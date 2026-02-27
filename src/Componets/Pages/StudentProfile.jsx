import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getStudentById, updateStudentStatus } from "../../services/studentService";

function StudentProfile() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch student data
    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getStudentById(id);
            
            if (response.success) {
                setStudent(response.data.student);
            } else {
                setError(response.message || 'Failed to fetch student data');
            }
        } catch (err) {
            setError('Error fetching student data');
            console.error('Fetch student error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle profile image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            
            const formData = new FormData();
            formData.append('profileImage', file);
            
            console.log('Uploading file:', file.name);
            console.log('Upload URL:', `https://udemy-latest-backend.onrender.com/api/students/${id}/profile-image`);
            
            // Upload to backend
            const response = await fetch(`https://udemy-latest-backend.onrender.com/api/students/${id}/profile-image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const result = await response.json();
            console.log('Upload response:', result);
            
            if (result.success) {
                // Update student state with new image
                setStudent(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        profileImage: result.data.profileImage
                    }
                }));
                
                // Update localStorage to sync across components
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser._id === id) {
                    currentUser.profile.profileImage = result.data.profileImage;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
                
                alert('Profile image updated successfully!');
                console.log('New image URL:', result.data.profileImage);
            } else {
                alert('Failed to upload image: ' + result.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    // Handle student status toggle
    const handleStatusToggle = async () => {
        try {
            const newStatus = !student.isActive;
            const response = await updateStudentStatus(id, newStatus);
            
            if (response.success) {
                setStudent(prev => ({
                    ...prev,
                    isActive: newStatus
                }));
                alert(`Student ${newStatus ? 'activated' : 'deactivated'} successfully!`);
            } else {
                alert('Failed to update status: ' + response.message);
            }
        } catch (err) {
            console.error('Status update error:', err);
            alert('Error updating status');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Get student image
    const getStudentImage = () => {
        if (student?.profile?.profileImage) {
            const imageUrl = student.profile.profileImage.startsWith('http') 
                ? student.profile.profileImage 
                : `https://udemy-latest-backend.onrender.com${student.profile.profileImage}`;
            
            console.log('Student image URL:', imageUrl);
            return imageUrl;
        }
        return "/student-profile.jpg";
    };

    // Get student name
    const getStudentName = () => {
        if (student?.profile?.firstName || student?.profile?.lastName) {
            return `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim();
        }
        return student?.username || 'Unknown';
    };

    // Counter component
    const Counter = ({ end, duration = 1000 }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            const increment = end / (duration / 16);

            const counter = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(counter);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 16);

            return () => clearInterval(counter);
        }, [end, duration]);

        return <h6>{count}</h6>;
    };

    useEffect(() => {
        if (id) {
            fetchStudentData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="alert alert-info" role="alert">
                    Student not found
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="row mb-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                            <div className="admin-breadcrumb">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb custom-breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <NavLink to="/student-management" className="breadcrumb-link">
                                                Student Management
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            {getStudentName()}
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-4 mb-3">
                        <div className="student-profile-card">
                            <div className="student-picture">
                                <img src={getStudentImage()} alt="" />
                                <div className="student-active">
                                    <span className="student-active-title">Active</span>
                                </div>
                            </div>
                            
                            <div className="student-upload">
                                <input
                                    type="file"
                                    id="profileImage"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="profileImage" className="upload-btn">
                                    {uploading ? 'Uploading...' : 'Change Photo'}
                                </label>
                            </div>

                            <div className="student-details">
                                <h4>{getStudentName()}</h4>
                                <p>{student.email || 'N/A'}</p>
                                <p>Member since: {formatDate(student.createdAt)}</p>
                            </div>

                            <div className="student-actions">
                                <button 
                                    className={`btn ${student.isActive ? 'btn-danger' : 'btn-success'}`}
                                    onClick={handleStatusToggle}
                                >
                                    {student.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8 mb-3">
                        <div className="student-stats-card">
                            <div className="stats-header">
                                <h5>Learning Statistics</h5>
                            </div>
                            
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-book"></i>
                                    </div>
                                    <div className="stat-info">
                                        <Counter end={student.studentDetails?.learningStats?.totalCoursesEnrolled || 0} />
                                        <span>Enrolled Courses</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-trophy"></i>
                                    </div>
                                    <div className="stat-info">
                                        <Counter end={student.studentDetails?.learningStats?.totalCoursesCompleted || 0} />
                                        <span>Completed Courses</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="stat-info">
                                        <Counter end={student.studentDetails?.learningStats?.totalLearningTime || 0} />
                                        <span>Learning Hours</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="stat-info">
                                        <Counter end={student.studentDetails?.learningStats?.averageCompletionRate || 0} />
                                        <span>Avg. Completion %</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="student-courses-card">
                            <div className="courses-header">
                                <h5>Enrolled Courses</h5>
                            </div>
                            
                            {student.studentDetails?.enrolledCourses?.length > 0 ? (
                                <div className="courses-grid">
                                    {student.studentDetails.enrolledCourses.map((enrollment, index) => (
                                        <div key={index} className="course-card">
                                            <div className="course-thumbnail">
                                                <img 
                                                    src={enrollment.course?.thumbnail || '/default-course.jpg'} 
                                                    alt={enrollment.course?.title || 'Course'} 
                                                />
                                            </div>
                                            <div className="course-info">
                                                <h6>{enrollment.course?.title || 'Unknown Course'}</h6>
                                                <div className="course-progress">
                                                    <div className="progress">
                                                        <div 
                                                            className="progress-bar" 
                                                            style={{ width: `${enrollment.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span>{enrollment.progress || 0}% Complete</span>
                                                </div>
                                                <p className="course-date">
                                                    Last Activity: {formatDate(enrollment.lastAccessedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-courses">
                                    <p>No courses enrolled yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentProfile;
