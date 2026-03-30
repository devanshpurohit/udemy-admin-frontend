import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getStoredUser, updateProfile } from '../../services/authService';
import { uploadProfileImage, refetchUser } from '../../services/profileService';
import { getCourses } from '../../services/courseService';
import { getStudents } from '../../services/studentService';
import adminUsr from '../../assets/images/admin-usr.png';
import { 
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaUpload,
  FaSave,
  FaTimes
} from 'react-icons/fa';


function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [coursesCount, setCoursesCount] = useState(0);
    const [studentsCount, setStudentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const userData = getStoredUser();
        console.log('Profile - User data from localStorage:', userData);
        setUser(userData);
        
        if (userData) {
            // Fix user data access - userData is the user object directly
            setFormData({
                firstName: userData.profile?.firstName || '',
                lastName: userData.profile?.lastName || '',
                email: userData.email || '',
                phone: userData.profile?.phone || '',
                bio: userData.profile?.bio || ''
            });
            
            // Set profile image if exists
            if (userData.profile?.profileImage) {
                setImagePreview(userData.profile.profileImage);
            }
            
            // Fetch user's courses count
            fetchUserCoursesCount(userData.id || userData._id);
            fetchStudentsCount();
        } else {
            // Redirect to login if no user
            console.log('Profile - No user found, redirecting to login');
            window.location.href = '/login';
        }
        setLoading(false);
    }, []);

    // Listen for storage changes to sync across components
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === null) {
                const userData = getStoredUser();
                console.log('Profile - Storage change detected, updating user data:', userData);
                setUser(userData);
                
                if (userData) {
                    setFormData({
                        firstName: userData.profile?.firstName || '',
                        lastName: userData.profile?.lastName || '',
                        email: userData.email || '',
                        phone: userData.profile?.phone || '',
                        bio: userData.profile?.bio || ''
                    });
                    
                    if (userData.profile?.profileImage) {
                        setImagePreview(userData.profile.profileImage);
                    }
                    
                    fetchUserCoursesCount(userData.id || userData._id);
                    fetchStudentsCount();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fetch user's courses count
    const fetchUserCoursesCount = async (userId) => {
        try {
            console.log('Fetching courses count for user:', userId);
            const response = await getCourses({ instructor: userId });
            if (response.success) {
                const userCourses = response.data.courses.filter(course => 
                    course.instructor?._id === userId || course.instructor === userId
                );
                setCoursesCount(userCourses.length);
                console.log('User courses count:', userCourses.length);
            }
        } catch (error) {
            console.error('Error fetching courses count:', error);
            setCoursesCount(0);
        }
    };

    const fetchStudentsCount = async () => {
        try {
            const response = await getStudents({ limit: 1000 });
            if (response.success) {
                setStudentsCount(response.data.students?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching students count:', error);
            setStudentsCount(0);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        if (!profileImage) return;
        
        setUploading(true);
        try {
            console.log('Uploading profile image file:', profileImage);
            
            // Use proper file upload service
            const response = await uploadProfileImage(profileImage);
            console.log('Image upload response:', response);
            console.log('Image upload response success:', response.success);
            console.log('Image upload response data:', response.data);
            
            // Check if response has data and success
            const isSuccess = response.success === true && response.data && response.data.profileImage;
            console.log('Image upload isSuccess check:', isSuccess);
            
            if (isSuccess) {
                console.log('Profile - Upload successful, re-fetching user...');
                
                // Direct update with response data first
                console.log('Profile - Setting preview from response:', response.data.profileImage);
                setImagePreview(response.data.profileImage);
                
                // Then re-fetch user from database to get latest data
                try {
                    const refetchResponse = await refetchUser();
                    console.log('Profile - Refetch response:', refetchResponse);
                    
                    if (refetchResponse.success) {
                        const updatedUser = refetchResponse.data.user;
                        console.log('Profile - Updated user data:', updatedUser);
                        
                        setUser(updatedUser);
                        
                        // Update localStorage to trigger storage events in other components
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        window.dispatchEvent(new Event('userUpdated'));
                        console.log('Profile - Re-fetched and updated localStorage with user (image upload):', updatedUser);
                        
                        // Also update with user data for consistency
                        if (updatedUser.profile?.profileImage) {
                            console.log('Profile - Setting preview from user data:', updatedUser.profile.profileImage);
                            setImagePreview(updatedUser.profile.profileImage);
                        }
                        
                        setProfileImage(null);
                        toast.success('Profile image uploaded successfully!');
                    } else {
                        console.log('Profile - Refetch failed, but using response data:', refetchResponse);
                        // Even if refetch fails, we have the response data
                        toast.success('Profile image uploaded successfully! (Using response data)');
                    }
                } catch (refetchError) {
                    console.log('Profile - Refetch error, but using response data:', refetchError);
                    // Even if refetch fails, we have the response data
                    toast.success('Profile image uploaded successfully! (Using response data)');
                }
            } else {
                console.log('Profile - Upload failed:', response);
                toast.error('Failed to upload profile image: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Error uploading profile image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting profile update:', formData);
            const response = await updateProfile(formData);
            if (response.success) {
                console.log('Profile update response:', response.data);
                
                // Re-fetch user from database to get latest data
                const refetchResponse = await refetchUser();
                if (refetchResponse.success) {
                    const updatedUser = refetchResponse.data.user;
                    setUser(updatedUser);
                    
                    // Update localStorage to trigger storage events in other components
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('userUpdated'));
                    console.log('Profile - Re-fetched and updated localStorage with user:', updatedUser);
                    
                    // Update form data with new values
                    setFormData({
                        firstName: updatedUser.profile?.firstName || '',
                        lastName: updatedUser.profile?.lastName || '',
                        email: updatedUser.email || '',
                        phone: updatedUser.profile?.phone || '',
                        bio: updatedUser.profile?.bio || ''
                    });
                    
                    setIsEditing(false);
                    toast.success('Profile updated successfully!');
                } else {
                    toast.error('Failed to re-fetch user data: ' + (refetchResponse.message || 'Unknown error'));
                }
            } else {
                toast.error('Failed to update profile: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Error updating profile: ' + error.message);
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status"></div><p className="mt-3">Loading profile...</p></div>;
    }

    return (
        <div className="main-content flex-grow-1 p-3 overflow-auto">
            <div className="row">
                <div className="col-lg-4">
                    <div className="profile-card">
                        <div className="profile-header text-center">
                            <div className="position-relative d-inline-block">
                                <img 
                                    src={imagePreview && imagePreview.startsWith('http') ? imagePreview : (imagePreview ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}${imagePreview}` : adminUsr)} 
                                    alt="Profile" 
                                    className="rounded-circle"
                                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        console.log('Profile - Image load error, trying fallback:', e.target.src);
                                        e.target.src = adminUsr;
                                    }}
                                    onLoad={(e) => {
                                        console.log('Profile - Image loaded successfully:', e.target.src);
                                    }}
                                />
                                <label htmlFor="profileImageUpload" className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2" style={{ cursor: 'pointer' }}>
                                    <FaCamera size={16} />
                                </label>
                                <input
                                    type="file"
                                    id="profileImageUpload"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            {profileImage && (
                                <div className="mt-2">
                                    <button 
                                        className="btn btn-sm btn-primary me-2" 
                                        onClick={handleImageUpload}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : <><FaUpload /> Upload</>}
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-secondary" 
                                        onClick={() => {
                                            setProfileImage(null);
                                            setImagePreview(user?.profile?.profileImage || "/user-avatar.png");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            <h4 className="mt-3">
                                {user?.profile?.firstName || user?.username || 'Admin'} {user?.profile?.lastName || ''}
                            </h4>
                            <p className="text-muted">{user?.email}</p>
                            <span className={`badge ${user?.role === 'admin' ? 'bg-primary' : 'bg-success'}`}>
                                {user?.role?.toUpperCase() || 'USER'}
                            </span>
                        </div>
                        
                        <div className="profile-stats">
                            <div className="stat-item">
                                <h5>{coursesCount}</h5>
                                <span>Courses</span>
                            </div>
                            <div className="stat-item">
                                <h5>{studentsCount}</h5>
                                <span>Students</span>
                            </div>
                            <div className="stat-item">
                                <h5>{user?.rating || 4.5}</h5>
                                <span>Rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="profile-details">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>Profile Information</h4>
                            {!isEditing && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            )}
                            {isEditing && (
                                <div>
                                    <button 
                                        className="btn btn-success me-2"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        <FaSave /> Save
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea
                                            name="bio"
                                            className="form-control"
                                            rows="4"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Full Name</label>
                                        <p className="form-control-static">
                                            {user?.profile?.firstName || user?.username || 'Admin'} {user?.profile?.lastName || ''}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Email Address</label>
                                        <p className="form-control-static">
                                            <FaEnvelope className="me-2" />
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted">Phone Number</label>
                                        <p className="form-control-static">
                                            <FaPhone className="me-2" />
                                            {user?.profile?.phone || 'Not provided'}
                                        </p>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label text-muted">Bio</label>
                                        <p className="form-control-static">{user?.profile?.bio || 'No bio provided'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
