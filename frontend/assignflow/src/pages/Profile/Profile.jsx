/*
 * Profile Page — Student profile view, create, edit, and profile picture upload.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  uploadAndUpdateProfilePic,
} from '../../api/student';

import ProfileForm from '../../components/ProfileForm/ProfileForm';
import { Camera } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getStudentProfile();
      setProfile(data);
      setHasProfile(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasProfile(false);
        setProfile(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Handled by interceptor
      } else {
        setErrorMsg('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await createStudentProfile(formData);
      setProfile(data);
      setHasProfile(true);
      setSuccessMsg('Profile created successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await updateStudentProfile(formData);
      setProfile(data);
      setIsEditMode(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be under 5MB.');
      return;
    }

    setUploadingPic(true);
    setErrorMsg('');
    try {
      const data = await uploadAndUpdateProfilePic(file);
      setProfile(data);

      setSuccessMsg('Profile picture updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload picture.');
    } finally {
      setUploadingPic(false);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.spinner}>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </div>
      </div>
    );
  }

  // ── Create Profile Form ──
  if (!hasProfile && !isEditMode) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1>My Profile</h1>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
        {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        <ProfileForm onSubmit={handleCreate} isLoading={submitting} isEditMode={false} />
      </div>
    );
  }

  // ── Edit Mode ──
  if (isEditMode) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1>Edit Profile</h1>
        </div>
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        <ProfileForm
          existingData={profile}
          onSubmit={handleUpdate}
          isLoading={submitting}
          isEditMode={true}
          onCancel={() => setIsEditMode(false)}
        />
      </div>
    );
  }

  // ── Profile Display ──
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => setIsEditMode(true)}>Edit Profile</button>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <div className={`glass-card ${styles.profileCard}`}>
        <div className={styles.profileTop}>
          <div className={styles.avatarSection}>
            {profile.student_profile_pic ? (
              <img src={profile.student_profile_pic} alt="Profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(profile.student_name)}
              </div>
            )}
            <div
              className={styles.uploadOverlay}
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
            >
              {uploadingPic ? '…' : <Camera size={24} color="white" />}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePicUpload}
            />
          </div>
          <div className={styles.profileNameBlock}>
            <h2>{profile.student_name}</h2>
            <p>{profile.student_email || user?.email}</p>
            <span className={styles.badge}>Student</span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>URN</label>
            <span>{profile.student_urn}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Course</label>
            <span>{profile.student_course}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Branch</label>
            <span>{profile.student_branch}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Year</label>
            <span>{profile.student_year}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Semester</label>
            <span>{profile.student_sem}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Section</label>
            <span>{profile.student_section}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Mobile</label>
            <span>{profile.student_mobile}</span>
          </div>
        </div>

        <div className={styles.timestamps}>
          <span>Created: {formatDate(profile.created_at)}</span>
          <span>Last Updated: {formatDate(profile.updated_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
