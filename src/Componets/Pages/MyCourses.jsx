import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getCourses, updateCourse, deleteCourse } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";

function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userReady, setUserReady] = useState(false);
    const [userData, setUserData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const debounceTimeoutRef = useRef(null);

    // Handle status filter change with debouncing
    const handleStatusFilter = useCallback((status) => {
        setStatusFilter(status);
        
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set new timeout for debounced API call
        debounceTimeoutRef.current = setTimeout(() => {
            if (userData) {
                fetchCourses(userData, status);
            }
        }, 300); // 300ms debounce delay
    }, [userData]);

    // Refresh courses function
    const refreshCourses = useCallback(async () => {
        if (userData) {
            await fetchCourses(userData, statusFilter);
        }
    }, [userData, statusFilter]);

    // Handle course status change
    const handleStatusChange = async (courseId, newStatus) => {
        try {
            const response = await updateCourse(courseId, { status: newStatus });
            if (response.success) {
                // Update local state
                setCourses(prevCourses => 
                    prevCourses.map(course => 
                        course._id === courseId 
                            ? { ...course, status: newStatus }
                            : course
                    )
                );
                alert(`Course status updated to ${newStatus}`);
            } else {
                alert('Failed to update course status');
            }
        } catch (error) {
            console.error('Error updating course status:', error);
            alert('Error updating course status');
        }
    };

    // Handle course deletion
    const handleDeleteCourse = async (courseId, courseTitle) => {
        console.log('Deleting course:', courseId, courseTitle);
        if (window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
            try {
                console.log('Calling delete API for course:', courseId);
                const response = await deleteCourse(courseId);
                console.log('Delete response:', response);
                if (response.success) {
                    // Refresh courses from server instead of local state update
                    await refreshCourses();
                    alert('Course deleted successfully');
                } else {
                    alert('Failed to delete course: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Error deleting course: ' + error.message);
            }
        }
    };

    const fetchCourses = useCallback(async (userData, status = 'all') => {
        try {
            console.log('Fetching courses with status filter:', status);
            setError(null);
            const params = {};
            if (status !== 'all') {
                params.status = status;
            }
            const response = await getCourses(params);
            console.log('Courses response:', response);
            if (response.success) {
                console.log('Courses data:', response.data.courses);
                // Check instructor IDs
                response.data.courses.forEach(course => {
                    const userId = userData?.user?.id || userData?._id || 'default';
                    console.log(`Course: ${course.title}, Instructor: ${course.instructor}, Instructor ID: ${course.instructor?._id || course.instructor}, Instructor ID type: ${typeof (course.instructor?._id || course.instructor)}, User ID: ${userId}, User ID type: ${typeof userId}, Match: ${(course.instructor?._id || course.instructor) === userId}`);
                });
                setCourses(response.data.courses);
            } else {
                console.error('API error:', response.message);
                setError(response.message || 'Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message || 'Error fetching courses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Get logged-in user data
        const userData = getStoredUser();
        console.log('User data:', userData);
        console.log('User ID:', userData?.id || userData?._id);
        console.log('User ID type:', typeof (userData?.id || userData?._id));
        console.log('User ID string:', String(userData?.id || userData?._id));
        
        if (userData) {
            console.log('Setting user state...');
            console.log('User data before setting:', userData);
            setUser(userData);
            setUserData(userData);
            console.log('User data after setting:', userData);
        } else {
            console.log('No user data found');
            setLoading(false);
        }

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (user && userData) {
            console.log('User state updated:', user);
            console.log('User ID from state:', user?.id || user?._id);
            console.log('User ID type:', typeof (user?.id || user?._id));
            console.log('User ID string:', String(user?.id || user?._id));
            console.log('userData state:', userData);
            console.log('userData ID:', userData?.id || userData?._id);
            setUserReady(true);
            // Initial fetch with 'all' status
            fetchCourses(userData, 'all');
        }
    }, [user, userData, fetchCourses]);
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
                                            <NavLink to="/" className="breadcrumb-link">
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        >
                                            Courses
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="text-end">
                            <NavLink to="/new-course" className="thm-btn">
                                <FaPlus /> Create New Course
                            </NavLink>
                        </div>

                    </div>
                </div>

                <div className="row justify-content-between mb-2">
                    <div className="col-lg-3">
                        <div className="custom-frm-bx">
                            <input
                                type="email"
                                className="form-control  search-table-frm pe-5"
                                id="email"
                                placeholder="Search"
                                required
                            />
                            <div className="adm-search-bx">
                                <button className="filter-btn">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="text-end">

                            <div className="dropdown">
                                <a
                                    href="javascript:void(0)"
                                    className="lg-white-btn dropdown-toggle "
                                    id="acticonMenu2"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Status: {statusFilter === 'all' ? 'All' : statusFilter === 'published' ? 'Published' : statusFilter === 'draft' ? 'Draft' : 'Archived'}
                                </a>
                                <ul
                                    className="dropdown-menu dropdown-menu-end  tble-action-menu admin-dropdown-card"
                                    aria-labelledby="acticonMenu2"
                                >
                                    <li className="prescription-item">
                                        <a 
                                            href="#" 
                                            className={`prescription-nav ${statusFilter === 'all' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleStatusFilter('all');
                                            }}
                                        >
                                            All
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a 
                                            href="#" 
                                            className={`prescription-nav ${statusFilter === 'published' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleStatusFilter('published');
                                            }}
                                        >
                                            Published
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a 
                                            href="#" 
                                            className={`prescription-nav ${statusFilter === 'draft' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleStatusFilter('draft');
                                            }}
                                        >
                                            Draft
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a 
                                            href="#" 
                                            className={`prescription-nav ${statusFilter === 'archived' ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleStatusFilter('archived');
                                            }}
                                        >
                                            Archived
                                        </a>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <strong>Error:</strong> {error}
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    data-bs-dismiss="alert" 
                                    aria-label="Close"
                                    onClick={() => setError(null)}
                                ></button>
                            </div>
                        </div>
                    </div>
                )}


                <div className="row">
                    <div className="col-lg-12">
                        <div className="table-section">
                            <h5 className="innr-title mb-0">Course Name</h5>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Course </th>
                                            <th>Students</th>
                                            <th>Price</th>
                                            <th>Rating</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    Loading courses...
                                                </td>
                                            </tr>
                                        ) : !userReady ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    Loading user data...
                                                </td>
                                            </tr>
                                        ) : (
                                            courses
                                                .filter(course => {
                                                    const instructorId = course.instructor?._id || course.instructor;
                                                    const userId = userData?.user?.id || userData?._id || user?.id || user?._id;
                                                    const match = instructorId === userId;
                                                    
                                                    // Apply status filter if not 'all'
                                                    const statusMatch = statusFilter === 'all' || course.status === statusFilter;
                                                    
                                                    console.log(`Filtering course: ${course.title}, instructor: ${instructorId} (${typeof instructorId}), user: ${userId} (${typeof userId}), match: ${match}, status: ${course.status}, statusFilter: ${statusFilter}, statusMatch: ${statusMatch}`);
                                                    
                                                    return match && statusMatch;
                                                })
                                                .map((course, index) => (
                                                    <tr key={course._id}>
                                                        <td>{index + 1}.</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx">
                                                                    <img 
                                                                        src={course.courseImage || course.thumbnail || "/pic_01.jpg"} 
                                                                        alt={course.title}
                                                                        style={{ 
                                                                            width: '60px', 
                                                                            height: '60px', 
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    />
                                                                    <div className="admin-table-sub-details doctor-title">
                                                                        <h6>{course.title}</h6>
                                                                        <p>{course.category} - {course.level}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{course.students || 0}</td>
                                                        <td>${course.price || 0}</td>
                                                        <td>{course.rating || 4.5}</td>
                                                        <td>
                                                            <span className={`public-title ${course.status?.toLowerCase() || 'published'}`}>
                                                                {course.status || 'Published'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="vertical-btn"
                                                                    id={`acticonMenu${course._id}`}
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby={`acticonMenu${course._id}`}
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a 
                                                                            href="#" 
                                                                            className="prescription-nav"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleStatusChange(course._id, course.status === 'published' ? 'draft' : 'published');
                                                                            }}
                                                                        >
                                                                            {course.status === 'published' ? 'Set to Draft' : 'Publish'}
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a 
                                                                            href="#" 
                                                                            className="prescription-nav"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                navigate(`/edit-course/${course._id}`);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a 
                                                                            href="#" 
                                                                            className="prescription-nav text-danger"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                handleDeleteCourse(course._id, course.title);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                        )}
                                        {courses.filter(course => {
                                                    const instructorId = course.instructor?._id || course.instructor;
                                                    const userId = userData?.user?.id || userData?._id || user?.id || user?._id;
                                                    return instructorId === userId;
                                                }).length === 0 && !loading && userReady && (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    No courses found. Create your first course!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="dz-pagination-wrapper">

                            <div className="dz-pagination-info">
                                Showing 1 to 20 of 21 result
                            </div>

                            <nav>
                                <ul className="pagination dz-custom-pagination mb-0">
                                    <li className="page-item">
                                        <a className="page-link dz-page-link" href="#" aria-label="Previous">
                                            <MdChevronLeft />

                                        </a>
                                    </li>

                                    <li className="page-item active">
                                        <a className="page-link dz-page-link" href="#">1</a>
                                    </li>

                                    <li className="page-item">
                                        <a className="page-link dz-page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link dz-page-link" href="#">3</a>
                                    </li>

                                    <li className="page-item">
                                        <a className="page-link dz-page-link" href="#" aria-label="Next">
                                            <MdChevronRight />

                                        </a>
                                    </li>
                                </ul>
                            </nav>

                        </div>



                    </div>
                </div>
            </div>
        </>
    );
}

export default MyCourses;
