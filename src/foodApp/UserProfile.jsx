import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getUserProfile, updateUserProfile } from '../utils/api';

const UserProfile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        const userData = data.user || data;
        setUser(userData);
        setEditData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          dateOfBirth: userData.dateOfBirth || userData['Date-Of-Birth'] || '',
          phonenumber: userData.phoneNumber || userData.phonenumber || '',
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) setProfileImage(savedImage);

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      setProfileImage(imageData);
      localStorage.setItem('profileImage', imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await updateUserProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        dateOfBirth: editData.dateOfBirth,
        phonenumber: editData.phonenumber,
      });

      // Directly update user state from editData so UI reflects changes immediately
      setUser(prev => ({
        ...prev,
        firstName: editData.firstName,
        lastName: editData.lastName,
        dateOfBirth: editData.dateOfBirth,
        phoneNumber: editData.phonenumber,
        phonenumber: editData.phonenumber,
        'Date-Of-Birth': editData.dateOfBirth,
      }));

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError('');
    // Reset edit fields back to current user data
    setEditData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      dateOfBirth: user.dateOfBirth || user['Date-Of-Birth'] || '',
      phonenumber: user.phoneNumber || user.phonenumber || '',
    });
  };

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return null;
    try {
      // Handles both ISO/yyyy-mm-dd and other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
          <svg className="w-6 h-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <button
        onClick={onLogout}
        className="text-sm font-label font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors"
      >
        Logout
      </button>
    );
  }

  const inputClass = "w-full py-2 px-3 bg-surface-container border border-outline-variant/30 rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";

  return (
    <>
      <div className="flex items-center gap-4 group">
        <div className="relative">
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary cursor-pointer hover:shadow-lg hover:shadow-primary/20"
            title="View profile"
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
            )}
          </div>

          <button
            onClick={onLogout}
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center text-on-error shadow-lg shadow-error/30 hover:scale-110 active:scale-95 transition-all"
            title="Logout"
          >
            <span className="material-symbols-outlined text-xs">logout</span>
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setIsModalOpen(false); setIsEditing(false); setSaveError(''); }}
        >
          <div
            className="relative bg-surface rounded-[32px] shadow-2xl border border-outline-variant/10 p-8 max-w-sm w-full animate-in zoom-in-95 duration-300 flex flex-col items-center gap-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setIsModalOpen(false); setIsEditing(false); setSaveError(''); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {/* Profile Picture */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full bg-surface-container-high border-4 border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              title="Click to change photo"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-label font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity flex items-center gap-1 -mt-2"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              Change Photo
            </button>

            {/* Name & email header */}
            <div className="text-center -mt-2">
              <h3 className="font-headline text-xl font-black text-on-surface capitalize">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-on-surface-variant opacity-70">{user.email}</p>
            </div>

            {/* Details Section */}
            <div className="w-full bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 space-y-4">

              {/* Header row with Edit / Save / Cancel */}
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-primary">
                  Profile Details
                </h4>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-[11px] font-label font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity disabled:opacity-50"
                    >
                      {saving ? (
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-80" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined text-sm">check</span>
                      )}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Save feedback */}
              {saveSuccess && (
                <div className="text-xs text-secondary bg-secondary-container/20 rounded-xl px-3 py-2 text-center font-medium">
                  ✓ Profile updated successfully!
                </div>
              )}
              {saveError && (
                <div className="text-xs text-error bg-error-container/20 rounded-xl px-3 py-2 text-center font-medium">
                  {saveError}
                </div>
              )}

              <div className="space-y-3">
                {/* First Name */}
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-on-surface-variant font-medium min-w-[80px]">First Name</span>
                  {isEditing ? (
                    <input
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="First name"
                    />
                  ) : (
                    <span className="text-on-surface font-bold capitalize text-right">{user.firstName}</span>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-on-surface-variant font-medium min-w-[80px]">Last Name</span>
                  {isEditing ? (
                    <input
                      name="lastName"
                      value={editData.lastName}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Last name"
                    />
                  ) : (
                    <span className="text-on-surface font-bold capitalize text-right">{user.lastName}</span>
                  )}
                </div>

                {/* Email — read only, no edit */}
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-on-surface-variant font-medium min-w-[80px]">Email</span>
                  <span className="text-on-surface-variant text-right text-xs truncate max-w-[160px]">{user.email}</span>
                </div>

                {/* Date of Birth */}
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-on-surface-variant font-medium min-w-[80px]">Birthday</span>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editData.dateOfBirth}
                      onChange={handleEditChange}
                      className={inputClass}
                      title="DD/MM/YYYY"
                    />
                  ) : (
                    <span className="text-on-surface font-bold text-right">
                      {formatDateToDisplay(user.dateOfBirth || user['Date-Of-Birth']) || <span className="text-on-surface-variant opacity-50 font-normal">Not provided</span>}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-on-surface-variant font-medium min-w-[80px]">Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phonenumber"
                      value={editData.phonenumber}
                      onChange={handleEditChange}
                      className={inputClass}
                      placeholder="Phone number"
                    />
                  ) : (
                    <span className="text-on-surface font-bold text-right">
                      {user.phoneNumber || user.phonenumber || <span className="text-on-surface-variant opacity-50 font-normal">Not provided</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>


 
            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full py-3 bg-error/10 text-error font-label font-bold text-xs uppercase tracking-widest rounded-full hover:bg-error/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserProfile;
