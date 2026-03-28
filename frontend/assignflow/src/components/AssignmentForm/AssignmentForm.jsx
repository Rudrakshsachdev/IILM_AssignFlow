import React, { useState, useRef } from 'react';
import { uploadAssignmentFile } from '../../api/assignment';
import styles from './AssignmentForm.module.css';

const INITIAL_FORM = {
  title: '',
  description: '',
  subject: '',
  deadline: '',
  max_marks: '',
  file_url: '',
  status: 'published',
};

const AssignmentForm = ({ existingData, onSubmit, onCancel, isLoading, inline = false }) => {
  const isEditMode = !!existingData;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    if (existingData) {
      return {
        title: existingData.title || '',
        description: existingData.description || '',
        subject: existingData.subject || '',
        deadline: existingData.deadline
          ? new Date(existingData.deadline).toISOString().slice(0, 16)
          : '',
        max_marks: existingData.max_marks || '',
        file_url: existingData.file_url || '',
        status: existingData.status || 'published',
      };
    }
    return INITIAL_FORM;
  });

  const [errors, setErrors] = useState({});
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (!formData.max_marks || formData.max_marks < 1) newErrors.max_marks = 'Enter valid marks (≥ 1)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

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
      const data = await uploadAssignmentFile(file);
      setFormData((prev) => ({ ...prev, file_url: data.file_url }));
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
    if (!validate()) return;

    const payload = {
      ...formData,
      max_marks: parseInt(formData.max_marks, 10),
      deadline: new Date(formData.deadline).toISOString(),
    };

    // Remove empty optional fields
    if (!payload.description) delete payload.description;
    if (!payload.file_url) delete payload.file_url;

    onSubmit(payload);
  };

  const formContent = (
    <>
      <h2>{isEditMode ? '✏️ Edit Assignment' : '➕ Create Assignment'}</h2>
      <p>{isEditMode ? 'Update the assignment details below.' : 'Fill in the assignment details to publish.'}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Data Structures Lab 3"
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description for the assignment..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
              {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Max Marks *</label>
              <input
                type="number"
                name="max_marks"
                value={formData.max_marks}
                onChange={handleChange}
                placeholder="e.g. 100"
                min="1"
                max="1000"
              />
              {errors.max_marks && <span className={styles.errorText}>{errors.max_marks}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Deadline *</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
              {errors.deadline && <span className={styles.errorText}>{errors.deadline}</span>}
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* File Upload Area */}
          <div className={styles.formGroup}>
            <label>Attachment (PDF, DOC, DOCX, Image)</label>
            <div
              className={`${styles.fileUploadArea} ${formData.file_url ? styles.hasFile : ''} ${isDragOver ? styles.hasFile : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {uploading ? (
                <p className={styles.uploadingText}>⏳ Uploading...</p>
              ) : formData.file_url ? (
                <>
                  <div className={styles.fileUploadIcon}>✅</div>
                  <p className={styles.fileName}>{uploadedFileName || 'File uploaded'}</p>
                  <p className={styles.fileUploadText}>Click or drag to replace</p>
                </>
              ) : (
                <>
                  <div className={styles.fileUploadIcon}>📁</div>
                  <p className={styles.fileUploadText}>
                    <strong>Click to upload</strong> or drag & drop
                  </p>
                  <p className={styles.fileUploadText}>PDF, DOC, DOCX, JPEG, PNG (max 10MB)</p>
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

          <div className={styles.formActions}>
            <button type="submit" className="btn-primary" disabled={isLoading || uploading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update Assignment' : 'Create Assignment'}
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );

  if (inline) {
    return (
      <div className={styles.inlineFormCard}>
        {formContent}
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.formCard} onClick={(e) => e.stopPropagation()}>
        {formContent}
      </div>
    </div>
  );
};

export default AssignmentForm;
