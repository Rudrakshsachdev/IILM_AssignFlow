import React, { useState, useRef } from 'react';
import { uploadFacultyPicOnly } from '../../api/faculty';
import styles from '../../pages/Profile/Profile.module.css';


const DEPARTMENTS = [
  'School of Engineering',
  'School of Business',
  'School of Law',
  'School of Design',
  'School of Sciences',
  'School of Liberal Arts',
  'School of Education',
];

const DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Senior Professor',
  'Head of Department',
  'Dean',
  'Visiting Faculty',
];

const INITIAL_FORM = {
  faculty_name: '',
  faculty_email: '',
  faculty_employee_id: '',
  faculty_mobile: '',
  faculty_department: DEPARTMENTS[0],
  faculty_designation: DESIGNATIONS[0],
  faculty_specialization: '',
  faculty_subjects: '',
  faculty_profile_pic: '',
};

const FacultyProfileForm = ({ existingData, onSubmit, isLoading, isEditMode, onCancel }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(
    existingData
      ? {
          faculty_name: existingData.faculty_name || '',
          faculty_email: existingData.faculty_email || '',
          faculty_employee_id: existingData.faculty_employee_id || '',
          faculty_mobile: existingData.faculty_mobile || '',
          faculty_department: existingData.faculty_department || DEPARTMENTS[0],
          faculty_designation: existingData.faculty_designation || DESIGNATIONS[0],
          faculty_specialization: existingData.faculty_specialization || '',
          faculty_subjects: existingData.faculty_subjects || '',
          faculty_profile_pic: existingData.faculty_profile_pic || '',
        }
      : INITIAL_FORM
  );

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.faculty_name.trim()) newErrors.faculty_name = 'Name is required';
    if (!formData.faculty_employee_id.trim()) newErrors.faculty_employee_id = 'Employee ID is required';
    if (!formData.faculty_mobile.trim() || formData.faculty_mobile.length < 10)
      newErrors.faculty_mobile = 'Valid mobile number is required';
    if (!formData.faculty_department.trim()) newErrors.faculty_department = 'Department is required';
    if (!formData.faculty_designation.trim()) newErrors.faculty_designation = 'Designation is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      const data = await uploadFacultyPicOnly(file);
      setFormData((prev) => ({ ...prev, faculty_profile_pic: data.faculty_profile_pic }));
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

    if (isEditMode) {
      const updateData = { ...formData };
      delete updateData.faculty_employee_id; // Employee ID cannot be updated
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
      <h2>{isEditMode ? 'Edit Profile' : 'Create Your Faculty Profile'}</h2>
      <p>{isEditMode ? 'Update your faculty information below.' : 'Fill in your professional details to get started.'}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.profileTop} style={{ borderBottom: 'none', marginBottom: '1rem' }}>
          <div className={styles.avatarSection}>
            {formData.faculty_profile_pic ? (
              <img src={formData.faculty_profile_pic} alt="Preview" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(formData.faculty_name)}
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
              name="faculty_name"
              value={formData.faculty_name}
              onChange={handleChange}
              placeholder="e.g. Dr. Priya Sharma"
            />
            {errors.faculty_name && <small style={{ color: '#991b1b' }}>{errors.faculty_name}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="faculty_email"
              value={formData.faculty_email}
              onChange={handleChange}
              placeholder="e.g. priya.sharma@iilm.edu"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Employee ID *</label>
            <input
              type="text"
              name="faculty_employee_id"
              value={formData.faculty_employee_id}
              onChange={handleChange}
              placeholder="e.g. IILM-FAC-001"
              disabled={isEditMode}
              style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            />
            {errors.faculty_employee_id && <small style={{ color: '#991b1b' }}>{errors.faculty_employee_id}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Mobile Number *</label>
            <input
              type="tel"
              name="faculty_mobile"
              value={formData.faculty_mobile}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
            />
            {errors.faculty_mobile && <small style={{ color: '#991b1b' }}>{errors.faculty_mobile}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Department *</label>
            <select name="faculty_department" value={formData.faculty_department} onChange={handleChange}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.faculty_department && <small style={{ color: '#991b1b' }}>{errors.faculty_department}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Designation *</label>
            <select name="faculty_designation" value={formData.faculty_designation} onChange={handleChange}>
              {DESIGNATIONS.map((desig) => (
                <option key={desig} value={desig}>{desig}</option>
              ))}
            </select>
            {errors.faculty_designation && <small style={{ color: '#991b1b' }}>{errors.faculty_designation}</small>}
          </div>

          <div className={styles.formGroup}>
            <label>Specialization</label>
            <input
              type="text"
              name="faculty_specialization"
              value={formData.faculty_specialization}
              onChange={handleChange}
              placeholder="e.g. Machine Learning, Data Science"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subjects (comma-separated)</label>
            <input
              type="text"
              name="faculty_subjects"
              value={formData.faculty_subjects}
              onChange={handleChange}
              placeholder="e.g. AI, DBMS, Python"
            />
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

export default FacultyProfileForm;
