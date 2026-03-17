import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink, useParams } from "react-router-dom";
import boyImg from '../../assets/images/boy.png';
import { getStudentById, updateStudentStatus } from "../../services/studentService";
import { uploadProfileImage, refetchUser } from "../../services/profileService";

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
            
            const formData = new FormData();
            formData.append('profileImage', file);
            
            console.log('Uploading file:', file.name);
            console.log('Upload URL:', `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}/api/students/${id}/profile-image`);
            
            // Upload to backend
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}/api/students/${id}/profile-image`, {
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
                
                toast.success('Profile image updated successfully!');
                console.log('New image URL:', result.data.profileImage);
            } else {
                toast.error('Failed to upload image: ' + result.message);
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    // Handle student status toggle
  

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
                                <p>{student?.email || 'N/A'}</p>
                            </div>

                            <div className="student-bio-data">
                                <ul className="student-bio-data-list">
                                    <li className="student-bio-item"> Phone <span className="student-bio-title">{student?.profile?.phone || 'N/A'}</span> </li>
                                    <li className="student-bio-item"> AI Card <span className="student-bio-title">{student?.aiCard?.cardNumber || 'N/A'}</span> </li>
                                    <li className="student-bio-item"> Language <span className="student-bio-title">English</span> </li>
                                    <li className="student-bio-item"> Last Login  <span className="student-bio-title">{student?.lastLogin ? new Date(student.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span> </li>
                                    <li className="student-bio-item"> Join Date <span className="student-bio-title">{formatDate(student?.createdAt)}</span> </li>
                                </ul>
                            </div>

                           
                        </div>


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
                                                <h6 className="mb-0">{enrollment.course?.title || 'Unknown Course'}</h6>
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
                                                        <span className="text-black fw-500">Lesson {idx + 1} -</span> {lesson.title}
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
                                                <td>{enrollment.course?.title || 'Unknown Course'}</td>
                                                <td>
                                                    <div className="progress-wrapper" style={{ minWidth: '150px' }}>
                                                        <div className="progress-item">
                                                            <div className="progress-label">{enrollment.progress || 0}%</div>
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
        </>
    );
}

export default StudentProfile;
