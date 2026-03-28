import React, { useState, useRef } from 'react';
import { Loader2, CheckCircle, UploadCloud } from 'lucide-react';
import { uploadSubmissionFile } from '../../api/submission';
import styles from './SubmissionForm.module.css';

const SubmissionForm = ({ onSubmit, isLoading }) => {
  const fileInputRef = useRef(null);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF, DOC, DOCX, JPEG, PNG files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const data = await uploadSubmissionFile(file);
      setFileUrl(data.file_url);
      setUploadedFileName(data.file_name || file.name);
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileUrl) {
      setUploadError('Please upload a file before submitting.');
      return;
    }
    onSubmit(fileUrl);
  };

  return (
    <div className={styles.submissionForm}>
      <h3>Your Submission</h3>
      <p className="text-muted">Upload your completed assignment here. Supported formats: PDF, DOC, DOCX, PNG, JPEG.</p>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <div
            className={`${styles.fileUploadArea} ${fileUrl ? styles.hasFile : ''} ${isDragOver ? styles.hasFile : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploading ? (
              <div className={styles.uploadingText}>
                <Loader2 size={24} className={styles.spin} color="var(--primary-color)" />
                <p>Uploading...</p>
              </div>
            ) : fileUrl ? (
              <>
                <div className={styles.fileUploadIcon}><CheckCircle size={32} color="#22c55e" /></div>
                <p className={styles.fileName}>{uploadedFileName || 'File ready to submit'}</p>
                <p className={styles.fileUploadText}>Click or drag to replace</p>
              </>
            ) : (
              <>
                <div className={styles.fileUploadIcon}><UploadCloud size={32} color="#64748b" /></div>
                <p className={styles.fileUploadText}>
                  <strong>Click to upload</strong> or drag & drop
                </p>
                <p className={styles.fileUploadText}>Max 10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
          {uploadError && <span className={styles.errorText}>{uploadError}</span>}
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading || uploading || !fileUrl}
          style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
        >
          {isLoading ? 'Submitting...' : 'Turn In Assignment'}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;
