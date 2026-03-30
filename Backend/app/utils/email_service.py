"""
Email Service Utility.
Handles SMTP email dispatch for the AssignFlow platform.
Uses Gmail SMTP with TLS and app-specific password from .env.
"""

import os
import smtplib
import logging
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import List
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from app.core.config import settings

# Ensure .env is loaded before reading credentials
load_dotenv()

logger = logging.getLogger(__name__)

# SMTP Configuration (loaded once at module level)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
HOST_EMAIL = settings.HOST_EMAIL or os.getenv("HOST_EMAIL")
HOST_PASSWORD = settings.HOST_PASSWORD or os.getenv("HOST_PASSWORD")

# Template directory
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"

# Frontend URL for the "View Assignment" CTA
FRONTEND_BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _load_template(template_name: str) -> str:
    """Load an HTML template file from the templates directory."""
    template_path = TEMPLATE_DIR / template_name
    if not template_path.exists():
        logger.error(f"Email template not found: {template_path}")
        raise FileNotFoundError(f"Template '{template_name}' not found.")
    return template_path.read_text(encoding="utf-8")


def send_email(to: str, subject: str, html_body: str) -> bool:
    """
    Send a single email via Gmail SMTP/TLS.
    Returns True on success, False on failure.
    """
    if not HOST_EMAIL or not HOST_PASSWORD:
        logger.warning("Email credentials not configured. Skipping email send.")
        return False

    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"AssignFlow <{HOST_EMAIL}>"
        message["To"] = to
        message["Subject"] = subject

        html_part = MIMEText(html_body, "html")
        message.attach(html_part)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(HOST_EMAIL, HOST_PASSWORD)
            server.sendmail(HOST_EMAIL, to, message.as_string())

        logger.info(f"Email sent successfully to {to}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error(f"SMTP authentication failed. Check HOST_EMAIL/HOST_PASSWORD in .env.")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending to {to}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending email to {to}: {e}")
        return False


def _render_assignment_template(assignment_data: dict) -> str:
    """
    Render the assignment notification HTML template
    by replacing placeholder tokens with actual values.
    """
    html = _load_template("assignment_notification.html")

    # Build description block (only if description exists)
    description = assignment_data.get("description", "")
    if description and description.strip():
        description_block = f'''
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Description</p>
              <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">{description}</p>
            </td>
          </tr>
        </table>
        '''
    else:
        description_block = ""

    # Format deadline for display
    deadline = assignment_data.get("deadline", "")
    if hasattr(deadline, "strftime"):
        deadline_str = deadline.strftime("%B %d, %Y at %I:%M %p")
    else:
        deadline_str = str(deadline)

    # Replace all placeholders
    replacements = {
        "{{ASSIGNMENT_TITLE}}": str(assignment_data.get("title", "")),
        "{{SUBJECT}}": str(assignment_data.get("subject", "")),
        "{{SECTION_LABEL}}": str(assignment_data.get("section_label", "General")),
        "{{MAX_MARKS}}": str(assignment_data.get("max_marks", "")),
        "{{FACULTY_NAME}}": str(assignment_data.get("faculty_name", "Faculty")),
        "{{DEADLINE}}": deadline_str,
        "{{DESCRIPTION_BLOCK}}": description_block,
        "{{DASHBOARD_URL}}": f"{FRONTEND_BASE_URL}/student-dashboard/assignments",
    }

    for placeholder, value in replacements.items():
        html = html.replace(placeholder, value)

    return html


def send_assignment_notification(recipients: List[str], assignment_data: dict) -> None:
    """
    Send assignment notification emails to a list of recipients.
    Each recipient gets an individual email.
    Failures are logged but do not raise exceptions.
    """
    if not recipients:
        logger.info("No recipients for assignment notification. Skipping.")
        return

    try:
        html_body = _render_assignment_template(assignment_data)
    except FileNotFoundError:
        logger.error("Cannot send notifications — email template is missing.")
        return

    subject = f"📚 New Assignment: {assignment_data.get('title', 'Untitled')}"

    sent_count = 0
    failed_count = 0

    for email in recipients:
        if not email or not isinstance(email, str) or "@" not in email:
            logger.warning(f"Skipping invalid email: {email}")
            failed_count += 1
            continue

        success = send_email(to=email, subject=subject, html_body=html_body)
        if success:
            sent_count += 1
        else:
            failed_count += 1

    logger.info(
        f"Assignment notification dispatch complete. "
        f"Sent: {sent_count}, Failed: {failed_count}, Total: {len(recipients)}"
    )


def dispatch_assignment_emails_background(db: Session, assignment) -> None:
    """
    Dispatches assignment email notifications in a background thread.
    Queries students in the assignment's section and sends them branded emails.

    This function does NOT block the calling thread — it spawns a daemon thread
    and returns immediately, so the API response is unaffected.
    """
    from app.models.students import Student
    from app.models.users import User
    from app.services.academic_service import get_subject_name, build_section_label

    # Only send for published assignments with a section
    if not assignment.section_id or assignment.status != "published":
        logger.info("Assignment is not published or has no section. Skipping email dispatch.")
        return

    # Gather data while we still have the db session
    try:
        # Get student emails in this section
        students = (
            db.query(Student)
            .filter(
                Student.section_id == assignment.section_id,
                Student.is_active == True,
            )
            .all()
        )

        # Collect valid email addresses (prefer student_email, fallback to user.email)
        recipient_emails = []
        for student in students:
            email = student.student_email
            if not email and student.user:
                email = student.user.email if hasattr(student, 'user') and student.user else None
            # Fallback: query User table directly
            if not email:
                user = db.query(User).filter(User.id == student.user_id).first()
                if user:
                    email = user.email
            if email:
                recipient_emails.append(email)

        if not recipient_emails:
            logger.info(f"No student emails found for section_id={assignment.section_id}. Skipping.")
            return

        # Get faculty name
        faculty_user = db.query(User).filter(User.id == assignment.faculty_id).first()
        faculty_name = faculty_user.name if faculty_user else "Faculty"

        # Build assignment data dict for template rendering
        assignment_data = {
            "title": assignment.title,
            "description": assignment.description,
            "subject": get_subject_name(db, assignment.subject_id) if assignment.subject_id else assignment.subject,
            "section_label": build_section_label(db, assignment.section_id) if assignment.section_id else "General",
            "deadline": assignment.deadline,
            "max_marks": assignment.max_marks,
            "faculty_name": faculty_name,
        }

    except Exception as e:
        logger.error(f"Error preparing email dispatch data: {e}")
        return

    # Dispatch in background thread (daemon so it won't block shutdown)
    def _send():
        try:
            send_assignment_notification(recipient_emails, assignment_data)
        except Exception as e:
            logger.error(f"Background email dispatch error: {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
    logger.info(
        f"Background email dispatch started for assignment '{assignment.title}' "
        f"to {len(recipient_emails)} recipients."
    )
