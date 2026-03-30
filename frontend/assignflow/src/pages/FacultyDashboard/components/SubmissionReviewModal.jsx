import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, FileText, Loader, Save, CheckCircle, Image as ImageIcon } from 'lucide-react';
import styles from './SubmissionReviewModal.module.css';

const SubmissionReviewModal = ({ 
  submission, 
  assignment, 
  onClose, 
  onSave, 
  isSaving,
  successMsg,
  errorMsg 
}) => {
  const [evalData, setEvalData] = useState({
    marks_obtained: submission.marks_obtained !== null && submission.marks_obtained !== undefined ? submission.marks_obtained : '',
    feedback: submission.feedback || '',
    status: submission.status || 'pending'
  });

  const [documentUrl, setDocumentUrl] = useState('');
  const [fileType, setFileType] = useState('unknown');

  useEffect(() => {
    if (submission?.file_url) {
      const url = submission.file_url;
      setDocumentUrl(url);

      // Determine file viewer strategy
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('.pdf')) {
        setFileType('pdf');
      } else if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/) != null) {
        setFileType('image');
      } else if (lowerUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/) != null || url.includes('/raw/')) {
        // Many docx uploaded to cloudinary are 'raw', so we use google docs viewer
        setFileType('office');
        setDocumentUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`);
      } else {
        setFileType('unknown');
      }
    }
  }, [submission]);

  const handleSave = () => {
    onSave(submission.id, {
      ...evalData,
      marks_obtained: evalData.marks_obtained === '' ? null : Number(evalData.marks_obtained)
    });
  };

  if (!submission) return null;

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div 
          className={styles.modalContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <header className={styles.modalHeader}>
            <div className={styles.headerLeft}>
              <h2 className={styles.modalTitle}>Submission Evaluation</h2>
              <div className={styles.metaData}>
                <span>Student: <strong>{submission.student_name}</strong></span>
                <span className={styles.separator}>•</span>
                <span>URN: {submission.student_urn}</span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
                <X size={24} />
              </button>
            </div>
          </header>

          <div className={styles.modalBody}>
            {/* Left Pane: Document Viewer */}
            <div className={styles.viewerPane}>
              {documentUrl ? (
                <div className={styles.viewerWrapper}>
                  {fileType === 'pdf' && (
                    <iframe 
                      src={documentUrl} 
                      className={styles.iframeViewer} 
                      title="PDF Viewer"
                    />
                  )}
                  {fileType === 'office' && (
                    <iframe 
                      src={documentUrl} 
                      className={styles.iframeViewer} 
                      title="Document Viewer"
                    />
                  )}
                  {fileType === 'image' && (
                    <div className={styles.imageViewer}>
                      <img src={submission.file_url} alt="Submission" />
                    </div>
                  )}
                  {fileType === 'unknown' && (
                    <div className={styles.fallbackViewer}>
                      <FileText size={64} className={styles.fallbackIcon} />
                      <h3>Preview Not Available</h3>
                      <p>This file format cannot be viewed inline.</p>
                      <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <ExternalLink size={18} /> Open Externally
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.fallbackViewer}>
                  <FileText size={64} className={styles.fallbackIcon} />
                  <h3>No File Attached</h3>
                  <p>The student did not attach a file to this submission.</p>
                </div>
              )}
            </div>

            {/* Right Pane: Grading Panel */}
            <div className={styles.gradingPane}>
              <div className={styles.assignmentSummary}>
                <div className={styles.summaryLabel}>Assignment Details</div>
                <h3 className={styles.assignmentTitle}>{assignment?.title}</h3>
                {assignment?.max_marks && (
                  <div className={styles.maxMarks}>Max Marks: <strong>{assignment.max_marks}</strong></div>
                )}
              </div>

              {successMsg && (
                <div className={styles.successToast}>
                  <CheckCircle size={18} /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className={styles.errorToast}>
                  {errorMsg}
                </div>
              )}

              <div className={styles.gradingForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="evalStatus">Evaluation Status</label>
                  <select 
                    id="evalStatus"
                    className={styles.formSelect}
                    value={evalData.status}
                    onChange={(e) => setEvalData({...evalData, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="late">Late</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="evalMarks">Marks Awarded</label>
                  <input 
                    id="evalMarks"
                    type="number" 
                    min="0" 
                    max={assignment?.max_marks || 100}
                    placeholder="Enter score"
                    className={styles.formInput}
                    value={evalData.marks_obtained}
                    onChange={(e) => setEvalData({...evalData, marks_obtained: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="evalFeedback">Faculty Feedback</label>
                  <textarea 
                    id="evalFeedback"
                    className={styles.formTextarea}
                    placeholder="Provide constructive feedback for the student..."
                    rows={6}
                    value={evalData.feedback}
                    onChange={(e) => setEvalData({...evalData, feedback: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className={styles.gradingActions}>
                <a 
                  href={submission.file_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.downloadBtn}
                >
                  <Download size={18} /> Download
                </a>
                
                <button 
                  onClick={handleSave} 
                  className={`btn-primary ${styles.saveBtn}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><Loader size={18} className={styles.spin} /> Saving...</>
                  ) : (
                    <><Save size={18} /> Save Evaluation</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmissionReviewModal;
