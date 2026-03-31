import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink, useParams } from "react-router-dom";
import boyImg from '../../assets/images/boy.png';
import { getStudentById, updateStudentStatus, updateStudentProfile, uploadStudentProfileImage } from "../../services/studentService";
import { uploadProfileImage, refetchUser } from "../../services/profileService";
import { getLangText } from "../../utils/languageUtils";
import { FaUser, FaPhone, FaInfoCircle, FaGlobe } from "react-icons/fa";

function StudentProfile() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        language: 'English'
    });
    const [updating, setUpdating] = useState(false);

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
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            
            const response = await uploadStudentProfileImage(id, file);
            
            if (response.success) {
                // Update student state with new image
                setStudent(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        profileImage: response.data.profileImage
                    }
                }));
                
                // Update localStorage if this is the logged-in user
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser._id === id) {
                    currentUser.profile = currentUser.profile || {};
                    currentUser.profile.profileImage = response.data.profileImage;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
                
                toast.success('Profile image updated successfully!');
            } else {
                toast.error('Failed to upload image: ' + (response.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
        }
    };
 
     // Handle Edit Profile
     const handleEditClick = () => {
         setEditData({
             firstName: student?.profile?.firstName || '',
             lastName: student?.profile?.lastName || '',
             phone: student?.profile?.phone || '',
             bio: student?.profile?.bio || '',
             language: student?.profile?.language || 'English'
         });
         setShowEditModal(true);
     };
 
     const handleUpdateProfile = async (e) => {
         e.preventDefault();
         try {
             setUpdating(true);
             const response = await updateStudentProfile(id, editData);
             if (response.success) {
                 toast.success('Profile updated successfully');
                 setShowEditModal(false);
                 fetchStudentData(); // Refresh data
             } else {
                 toast.error(response.message || 'Failed to update profile');
             }
         } catch (err) {
             console.error('Update profile error:', err);
             toast.error('Error updating profile');
         } finally {
             setUpdating(false);
         }
     };

    // Handle student status toggle
    const handleToggleStatus = async () => {
        try {
            const newStatus = !student.isActive;
            const action = newStatus ? 'Unblock' : 'Block';
            
            if (window.confirm(`Are you sure you want to ${action} this student?`)) {
                const response = await updateStudentStatus(id, newStatus);
                if (response.success) {
                    toast.success(`Student ${action.toLowerCase()}ed successfully`);
                    fetchStudentData(); // Refresh data to get updated status
                } else {
                    toast.error(response.message || `Failed to ${action.toLowerCase()} student`);
                }
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            toast.error('Error updating student status');
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
        const image = student?.profile?.profileImage;
        if (!image || image.includes('picsum.photos') || image.includes('boy.png')) return boyImg;
        
        // If it's a base64 string or a full URL, return as is
        if (image.startsWith('data:') || image.startsWith('http')) {
            return image;
        }
        
        // Otherwise, construct full URL using base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com';
        const cleanImage = image.startsWith('/') ? image : `/${image}`;
        return `${baseUrl}${cleanImage}`;
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
                                <img src={getStudentImage()} alt={getStudentName()} />
                                <div className="student-active">
                                    <span className={student?.isActive ? "student-active-title" : "student-inactive-title"}>
                                        {student?.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-center mt-2 mb-3">
                                <input
                                    type="file"
                                    id="profileImage"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                
                            </div>

                            <div className="student-profile-content">
                                 <h5>{getStudentName()}</h5>
                                 <p className="mb-2">{student?.email || 'N/A'}</p>
                                 <div className="d-flex justify-content-center gap-2">
                                     <button 
                                         className="btn btn-sm btn-primary px-3 rounded-pill"
                                         onClick={handleEditClick}
                                         style={{ backgroundColor: '#0056b3', border: 'none' }}
                                     >
                                         Edit Profile
                                     </button>
                                     <button 
                                         className={`btn btn-sm px-3 rounded-pill ${student?.isActive ? 'btn-danger' : 'btn-success'}`}
                                         onClick={handleToggleStatus}
                                         style={{ border: 'none' }}
                                     >
                                         {student?.isActive ? 'Block Student' : 'Unblock Student'}
                                     </button>
                                 </div>
                             </div>

                            <div className="student-bio-data">
                                <ul className="student-bio-data-list">
                                    <li className="student-bio-item"> Phone <span className="student-bio-title">{student?.profile?.phone || 'N/A'}</span> </li>
                                    <li className="student-bio-item"> AI Card <span className="student-bio-title">{student?.aiCard?.cardNumber || 'N/A'}</span> </li>
                                    <li className="student-bio-item"> Language <span className="student-bio-title">{student?.profile?.language || 'English'}</span> </li>
                                    <li className="student-bio-item"> Last Login  <span className="student-bio-title">{student?.lastLogin ? new Date(student.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span> </li>
                                    <li className="student-bio-item"> Join Date <span className="student-bio-title">{formatDate(student?.createdAt)}</span> </li>
                                </ul>
                            </div>

                           
                        </div>

                        {student?.languageHistory && student.languageHistory.length > 0 && (
                            <div className="student-profile-card mt-3">
                                <h6 className="lg_title mb-3">Language Change History</h6>
                                <p className="text-muted small mb-3">Language was changed {student.languageHistory.length} time(s).</p>
                                <ul className="list-unstyled mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {[...student.languageHistory].reverse().map((history, i) => (
                                        <li key={i} className="mb-2 pb-2 border-bottom" style={{ fontSize: '0.85rem' }}>
                                            <strong className="text-primary">Changed to {history.language}</strong>
                                            <div className="text-muted d-flex justify-content-between mt-1">
                                                <span>By: <span className="text-capitalize fw-500">{history.changedBy}</span></span>
                                                <span>{new Date(history.changedAt).toLocaleDateString()} {new Date(history.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}


                        <div className="quiz-performance-box">
                            <h6 className="lg_title">Quiz Performance</h6>
                            <div className="row">
                                <div className="col-lg-6 mb-2">
                                    <div className="performance-small-card">
                                        <div className="performance-content">
                                            <p>Attempt</p>
                                            <Counter end={student?.studentDetails?.quizStats?.totalAttempts || 0} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6 mb-2">
                                    <div className="performance-small-card">
                                        <div className="performance-content">
                                            <p>Avg Score</p>
                                            <Counter end={student?.studentDetails?.quizStats?.averageScore || 0} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6 mb-2">
                                    <div className="performance-small-card">
                                        <div className="performance-content">
                                            <p>Pass</p>
                                            <Counter end={student?.studentDetails?.quizStats?.passedQuizzes || 0} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6 mb-2">
                                    <div className="performance-small-card">
                                        <div className="performance-content">
                                            <p>Failed</p>
                                            <Counter end={student?.studentDetails?.quizStats?.failedQuizzes || 0} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="student-profile-card">
                            <h6 className="lg_title mb-2">Current Course Progress</h6>
                            <div className="progress-wrapper">
                                {student?.studentDetails?.enrolledCourses?.slice(0, 1).map((enrollment, idx) => (
                                    <div className="progress-item" key={idx}>
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="progress-label">
                                                <h6 className="mb-0">{enrollment.course?.title ? getLangText(enrollment.course.title) : 'Unknown Course'}</h6>
                                            </div>
                                            <div>
                                                <span className="progress-label fz-14 fw-500">{enrollment.progress || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="progress custom-progress nw-custom-progress">
                                            <div className="progress-bar" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                {(!student?.studentDetails?.enrolledCourses || student.studentDetails.enrolledCourses.length === 0) && (
                                    <p className="text-muted">No course progress available</p>
                                )}
                            </div>
                        </div>

                        <div className="table-section mt-4">
                            <div className="">
                                <h5 className="innr-title mb-0">Curriculum Progress (Recent Chapter)</h5>
                            </div>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Chapter Name </th>
                                            <th>Status</th>
                                            <th>Completion Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student?.studentDetails?.enrolledCourses?.[0]?.course?.sections?.[0]?.lessons?.slice(0, 3).map((lesson, idx) => {
                                            const isCompleted = student?.studentDetails?.enrolledCourses?.[0]?.completedLessons?.some(cl => cl.lesson === lesson._id);
                                            return (
                                                <tr key={idx}>
                                                    <td>
                                                        <span className="text-black fw-500">Lesson {idx + 1} -</span> {getLangText(lesson.title)}
                                                    </td>
                                                    <td>
                                                        <span className={isCompleted ? "complete-title" : "progress-title"}>
                                                            {isCompleted ? "Completed" : "In Progress"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="admin-table-bx">
                                                            <div className="admin-table-sub-details">
                                                                <h6>{isCompleted ? formatDate(new Date()) : 'N/A'}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(!student?.studentDetails?.enrolledCourses || student.studentDetails.enrolledCourses.length === 0) && (
                                            <tr><td colSpan="3" className="text-center">No curriculum data available</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-lg-12">
                        <div className="table-section">
                            <div className="">
                                <h5 className="innr-title mb-0">All Enrolled Courses</h5>
                            </div>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Course </th>
                                            <th>Progress</th>
                                            <th>Last Activity</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student?.studentDetails?.enrolledCourses?.map((enrollment, index) => (
                                            <tr key={index}>
                                                <td>{enrollment.course?.title ? getLangText(enrollment.course.title) : 'Unknown Course'}</td>
                                                <td>
                                                    <div className="progress-wrapper" style={{ minWidth: '150px' }}>
                                                        <div className="progress-item">
                                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                                <div className="progress-label">
                                                                    <h6 className="mb-0"></h6>
                                                                </div>
                                                                <div>
                                                                    <span className="progress-label fz-14 fw-500">{enrollment.progress || 0}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="progress custom-progress">
                                                                <div className="progress-bar" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="admin-table-bx">
                                                        <div className="admin-table-sub-details">
                                                            <h6>{formatDate(enrollment.lastAccessedAt)}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={enrollment.progress === 100 ? "complete-title" : "progress-title"}>
                                                        {enrollment.progress === 100 ? "Completed" : "In Progress"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
             {/* Edit Profile Modal */}
             {showEditModal && (
                 <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                     <div className="modal-dialog modal-dialog-centered modal-lg">
                         <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                             <div className="modal-header bg-light border-0 py-3 px-4">
                                 <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                                     <span className="me-2" style={{ color: '#0056b3' }}><FaUser /></span>
                                     Edit Student Profile
                                 </h5>
                                 <button type="button" className="btn-close shadow-none" onClick={() => setShowEditModal(false)}></button>
                             </div>
                             <form onSubmit={handleUpdateProfile}>
                                 <div className="modal-body p-4">
                                     <div className="row g-4">
                                         <div className="col-md-6">
                                             <label className="form-label fw-600 text-muted mb-2">First Name</label>
                                             <div className="input-group">
                                                 <span className="input-group-text bg-white border-end-0 text-muted"> <FaUser size={14} /> </span>
                                                 <input 
                                                     type="text" 
                                                     className="form-control border-start-0 ps-0 shadow-none" 
                                                     placeholder="Enter first name"
                                                     value={editData.firstName}
                                                     onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                                 />
                                             </div>
                                         </div>
                                         <div className="col-md-6">
                                             <label className="form-label fw-600 text-muted mb-2">Last Name</label>
                                             <div className="input-group">
                                                 <span className="input-group-text bg-white border-end-0 text-muted"> <FaUser size={14} /> </span>
                                                 <input 
                                                     type="text" 
                                                     className="form-control border-start-0 ps-0 shadow-none" 
                                                     placeholder="Enter last name"
                                                     value={editData.lastName}
                                                     onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                                 />
                                             </div>
                                         </div>
                                         <div className="col-md-6">
                                             <label className="form-label fw-600 text-muted mb-2">Phone Number</label>
                                             <div className="input-group">
                                                 <span className="input-group-text bg-white border-end-0 text-muted"> <FaPhone size={14} /> </span>
                                                 <input 
                                                     type="text" 
                                                     className="form-control border-start-0 ps-0 shadow-none" 
                                                     placeholder="Enter phone number"
                                                     value={editData.phone}
                                                     onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                 />
                                             </div>
                                         </div>
                                         <div className="col-md-6">
                                             <label className="form-label fw-600 text-muted mb-2">Language Preference</label>
                                             <div className="input-group">
                                                 <span className="input-group-text bg-white border-end-0 text-muted"> <FaGlobe size={14} /> </span>
                                                 <select 
                                                     className="form-select border-start-0 ps-0 shadow-none"
                                                     value={editData.language}
                                                     onChange={(e) => setEditData({...editData, language: e.target.value})}
                                                 >
                                                     <option value="English">English</option>
                                                     <option value="Kannada">Kannada</option>
                                                 </select>
                                             </div>
                                         </div>
                                         <div className="col-12">
                                             <label className="form-label fw-600 text-muted mb-2">Bio / Description</label>
                                             <div className="input-group">
                                                 <span className="input-group-text bg-white border-end-0 text-muted align-items-start pt-2"> <FaInfoCircle size={14} /> </span>
                                                 <textarea 
                                                     className="form-control border-start-0 ps-0 shadow-none" 
                                                     rows="4"
                                                     placeholder="Tell us about the student..."
                                                     value={editData.bio}
                                                     onChange={(e) => setEditData({...editData, bio: e.target.value})}
                                                 ></textarea>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="modal-footer border-0 p-4 pt-0 justify-content-end">
                                     <button 
                                         type="button" 
                                         className="btn btn-link text-muted text-decoration-none me-2" 
                                         onClick={() => setShowEditModal(false)}
                                     >
                                         Cancel
                                     </button>
                                     <button 
                                         type="submit" 
                                         className="btn px-4 rounded-pill text-white shadow" 
                                         disabled={updating}
                                         style={{ backgroundColor: '#0056b3', minWidth: '120px' }}
                                     >
                                         {updating ? (
                                             <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                         ) : null}
                                         {updating ? 'Saving...' : 'Save Changes'}
                                     </button>
                                 </div>
                             </form>
                         </div>
                     </div>
                 </div>
             )}
         </>
    );
}

export default StudentProfile;
