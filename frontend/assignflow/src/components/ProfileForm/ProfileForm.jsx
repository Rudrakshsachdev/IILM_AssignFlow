import React, { useState, useRef } from 'react';
import { uploadProfilePicOnly } from '../../api/student';
import styles from '../../pages/Profile/Profile.module.css';


const INITIAL_FORM = {
  student_name: '',
  student_email: '',
  student_urn: '',
  student_course: '',
  student_branch: '',
  student_year: 1,
  student_sem: 1,
  student_section: '',
  student_mobile: '',
  student_profile_pic: '',
};

const ProfileForm = ({ existingData, onSubmit, isLoading, isEditMode, onCancel }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(
    existingData
      ? {
          student_name: existingData.student_name || '',
          student_email: existingData.student_email || '',
          student_urn: existingData.student_urn || '',
          student_course: existingData.student_course || '',
          student_branch: existingData.student_branch || '',
          student_year: existingData.student_year || 1,
          student_sem: existingData.student_sem || 1,
          student_section: existingData.student_section || '',
          student_mobile: existingData.student_mobile || '',
          student_profile_pic: existingData.student_profile_pic || '',
        }
      : INITIAL_FORM
  );

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.student_name.trim()) newErrors.student_name = 'Name is required';
    if (!formData.student_urn.trim()) newErrors.student_urn = 'URN is required';
    if (!formData.student_course.trim()) newErrors.student_course = 'Course is required';
    if (!formData.student_branch.trim()) newErrors.student_branch = 'Branch is required';
    if (!formData.student_section.trim()) newErrors.student_section = 'Section is required';
    if (!formData.student_mobile.trim() || formData.student_mobile.length < 10)
      newErrors.student_mobile = 'Valid mobile number is required';
    if (formData.student_year < 1 || formData.student_year > 5)
      newErrors.student_year = 'Year must be 1-5';
    if (formData.student_sem < 1 || formData.student_sem > 10)
      newErrors.student_sem = 'Semester must be 1-10';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || '' : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const data = await uploadProfilePicOnly(file);
      setFormData(prev => ({ ...prev, student_profile_pic: data.student_profile_pic }));
    } catch (err) {

      setUploadError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // For update mode, only send changed fields (excluding URN which can't change)
    if (isEditMode) {
      const updateData = { ...formData };
      delete updateData.student_urn; // URN cannot be updated
      onSubmit(updateData);
    } else {
      onSubmit(formData);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`glass-card ${styles.formCard}`}>
      <h2>{isEditMode ? 'Edit Profile' : 'Create Your Profile'}</h2>
      <p>{isEditMode ? 'Update your student information below.' : 'Fill in your academic details to get started.'}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.profileTop} style={{ borderBottom: 'none', marginBottom: '1rem' }}>
          <div className={styles.avatarSection}>
            {formData.student_profile_pic ? (
              <img src={formData.student_profile_pic} alt="Preview" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(formData.student_name)}
              </div>
            )}
            <div
              className={styles.uploadOverlay}
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile picture"
            >
              {uploading ? '...' : '📷'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div className={styles.profileNameBlock}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Change Photo'}
            </button>
            {uploadError && <p style={{ color: '#991b1b', fontSize: '0.8rem', marginTop: '0.5rem' }}>{uploadError}</p>}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Full Name *</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              placeholder="e.g. Rudraksh Sachdev"
            />
            {errors.student_name && <small style={{ color: '#991b1b' }}>{errors.student_name}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="student_email"
              value={formData.student_email}
              onChange={handleChange}
              placeholder="e.g. rudraksh@iilm.edu"
            />
          </div>

          <div className={styles.formGroup}>
            <label>URN (University Roll No.) *</label>
            <input
              type="text"
              name="student_urn"
              value={formData.student_urn}
              onChange={handleChange}
              placeholder="e.g. IILM2024001"
              disabled={isEditMode}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            {errors.student_urn && <small style={{ color: '#991b1b' }}>{errors.student_urn}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Course *</label>
            <input
              type="text"
              name="student_course"
              value={formData.student_course}
              onChange={handleChange}
              placeholder="e.g. B.Tech"
            />
            {errors.student_course && <small style={{ color: '#991b1b' }}>{errors.student_course}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Branch *</label>
            <input
              type="text"
              name="student_branch"
              value={formData.student_branch}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
            />
            {errors.student_branch && <small style={{ color: '#991b1b' }}>{errors.student_branch}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Year *</label>
            <select name="student_year" value={formData.student_year} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {errors.student_year && <small style={{ color: '#991b1b' }}>{errors.student_year}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Semester *</label>
            <select name="student_sem" value={formData.student_sem} onChange={handleChange}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.student_sem && <small style={{ color: '#991b1b' }}>{errors.student_sem}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Section *</label>
            <input
              type="text"
              name="student_section"
              value={formData.student_section}
              onChange={handleChange}
              placeholder="e.g. A"
            />
            {errors.student_section && <small style={{ color: '#991b1b' }}>{errors.student_section}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Mobile Number *</label>
            <input
              type="tel"
              name="student_mobile"
              value={formData.student_mobile}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
            />
            {errors.student_mobile && <small style={{ color: '#991b1b' }}>{errors.student_mobile}</small>}
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn-primary" disabled={isLoading || uploading}>
              {isLoading ? 'Saving...' : isEditMode ? 'Update Profile' : 'Create Profile'}
            </button>
            {isEditMode && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;

