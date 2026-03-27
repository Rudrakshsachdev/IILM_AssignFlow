def validate_email_domain(email: str, role: str):
    """
    Validates the email domain based on the user's role. For students, the email must end with '@iilm.edu', and for faculty, it must end with '@iilm.edu' or '@iilm.edu'.
    """

    if role == "student" and not email.endswith("@iilm.edu"):
        return False
    elif role == "faculty" and not email.endswith("@iilm.edu"):
        return False
    elif role == "admin":
        allowedroles = ["@iilm.edu", "@iilm.edu"]
        return email in allowedroles
    return True
