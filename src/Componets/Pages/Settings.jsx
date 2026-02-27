import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { MdAddAPhoto } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { getStoredUser, updateProfile, changePassword } from "../../services/authService";
import { uploadProfileImage, refetchUser } from "../../services/profileService";

function Settings() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState("/user-profile.png");
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load user on mount
  useEffect(() => {
    const u = getStoredUser();
    setUser(u);

    if (u) {
      setFormData({
        firstName: u.profile?.firstName || "",
        lastName: u.profile?.lastName || "",
        phone: u.profile?.phone || "",
        bio: u.profile?.bio || ""
      });

      setPreview(u.profile?.profileImage && u.profile?.profileImage.startsWith('http') ? u.profile?.profileImage : (u.profile?.profileImage ? `https://udemy-latest-backend.onrender.com${u.profile?.profileImage}` : "http://localhost:5173/src/assets/images/admin-usr.png"));
    }
  }, []);

  // Listen for storage changes to sync across components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        const userData = getStoredUser();
        console.log('Settings - Storage change detected, updating user data:', userData);
        setUser(userData);
        
        if (userData) {
          setFormData({
            firstName: userData.profile?.firstName || "",
            lastName: userData.profile?.lastName || "",
            bio: userData.profile?.bio || ""
          });
          
          if (userData.profile?.profileImage) {
            const imageUrl = userData.profile?.profileImage.startsWith('http') ? userData.profile.profileImage : (userData.profile?.profileImage ? `https://udemy-latest-backend.onrender.com${userData.profile.profileImage}` : "http://localhost:5173/src/assets/images/admin-usr.png");
            console.log('Settings - Setting preview from storage change:', imageUrl);
            setPreview(imageUrl);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Input change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSave = async () => {
    try {
      console.log('Settings - Saving profile data:', formData);
      
      // Update text profile
      await updateProfile(formData);

      // Upload image if selected
      if (profileImage) {
        console.log('Settings - Uploading profile image:', profileImage);
        const uploadResponse = await uploadProfileImage(profileImage);
        console.log('Settings - Image upload response:', uploadResponse);
      }

      // Re-fetch updated user
      const refreshed = await refetchUser();
      if (refreshed.success) {
        const updatedUser = refreshed.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Update preview with new image
        if (updatedUser.profile?.profileImage) {
          const imageUrl = updatedUser.profile?.profileImage.startsWith('http') ? updatedUser.profile?.profileImage : (updatedUser.profile?.profileImage ? `https://udemy-latest-backend.onrender.com${updatedUser.profile.profileImage}` : "http://localhost:5173/src/assets/images/admin-usr.png");
          console.log('Settings - Setting preview from updated user:', imageUrl);
          setPreview(imageUrl);
        }
        
        // Clear selected image
        setProfileImage(null);
        
        alert("Profile updated successfully ✅");
      }
    } catch (err) {
      console.error(err);
      alert("Profile update failed ❌");
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      console.log('Settings - Changing password');
      console.log('Settings - Current password:', passwordData.currentPassword);
      console.log('Settings - New password:', passwordData.newPassword);
      
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      console.log('Settings - Password change response:', response);

      if (response.success) {
        alert("Password changed successfully! ✅");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Force logout after password change
        setTimeout(() => {
          console.log('Settings - Auto logout after password change');
          logout();
          alert('Please login again with your new password 🔐');
        }, 1000);
      } else {
        alert("Password change failed: " + response.message);
      }
    } catch (err) {
      console.error('Settings - Password change error:', err);
      alert("Password change error: " + err.message);
    }
  };

  return (
    <div className="main-content flex-grow-1 p-3 overflow-auto">
      {/* Breadcrumb */}
      <div className="row mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb custom-breadcrumb mb-0">
            <li className="breadcrumb-item">
              <NavLink to="/" className="breadcrumb-link text-black">
                Dashboard
              </NavLink>
            </li>
            <li className="breadcrumb-item active">Settings</li>
          </ol>
        </nav>
      </div>

      {/* Profile Section */}
      <div className="profile-card mb-4">
        <div className="profile-wrapper profile-line">
          <label className="avatar-box">
            <input
              type="file"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleImageChange}
            />
            <img src={preview} alt="Profile" className="avatar-img" />
            <span className="camera-icon">
              <MdAddAPhoto />
            </span>
            <span className="size-badge">80 × 80</span>
          </label>

          <div className="profile-text">
            <h3>Profile Photo</h3>
            <p>PNG or JPG Image</p>
          </div>
        </div>

        {/* Profile Inputs */}
        <div className="row mt-4">
          <div className="col-lg-6">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-control profile-control"
              placeholder="First Name"
            />
          </div>

          <div className="col-lg-6">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-control profile-control"
              placeholder="Last Name"
            />
          </div>

          <div className="col-lg-6 mt-3">
            <input
              type="text"
              value={user?.username || ""}
              disabled
              className="form-control profile-control"
              placeholder="Username"
            />
          </div>

          <div className="col-lg-6 mt-3">
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control profile-control"
              placeholder="Mobile Number"
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="profile-card mb-4">
        <h4 className="inner-title">Security</h4>

        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="form-control profile-control mt-3"
            placeholder="Current Password"
            required
          />

          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="form-control profile-control mt-3"
            placeholder="New Password"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="form-control profile-control mt-3"
            placeholder="Confirm New Password"
            required
          />

          <button type="submit" className="lg-thm-btn mt-3">
            Change Password
          </button>
        </form>
      </div>

      {/* Save Button */}
      <div className="text-end">
        <button type="button" className="lg-thm-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
