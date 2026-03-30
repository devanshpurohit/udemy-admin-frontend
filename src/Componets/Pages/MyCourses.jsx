import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { getCourses, updateCourse, deleteCourse } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";
import { getLangText } from "../../utils/languageUtils";

const getImageUrl = (url) => {
    if (!url) return "/pic_01.jpg";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api').replace('/api', '');
    let cleanPath = url.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${baseUrl}${cleanPath}`;
};

function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userReady, setUserReady] = useState(false);
    const [userData, setUserData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [limit, setLimit] = useState(8);

    const navigate = useNavigate();
    const debounceTimeoutRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Add cache-busting timestamp
    const CACHE_BUSTER = useRef(new Date().getTime());

    // Handle status filter change
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Refresh courses function
    const refreshCourses = useCallback(async () => {
        await fetchCourses(currentPage, statusFilter, searchTerm, sortBy, sortOrder);
    }, [currentPage, statusFilter, searchTerm, sortBy, sortOrder]);

    // Handle search change with debouncing
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchTerm(query);
            setCurrentPage(1); // Reset to first page on search
        }, 500);
    };

    // Handle search submit
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
                toast.success(`Course status updated to ${newStatus}`);
            } else {
                toast.error('Failed to update course status');
            }
        } catch (error) {
            console.error('Error updating course status:', error);
            toast.error('Error updating course status');
        }
    };

    // Handle course deletion
    const handleDeleteCourse = async (courseId, courseTitle) => {
        console.log('Deleting course:', courseId, courseTitle);
        const displayTitle = getLangText(courseTitle);
        if (window.confirm(`Are you sure you want to delete "${displayTitle}"? This action cannot be undone.`)) {
            try {
                console.log('Calling delete API for course:', courseId);
                const response = await deleteCourse(courseId);
                console.log('Delete response:', response);
                if (response.success) {
                    // Refresh courses from server instead of local state update
                    await refreshCourses();
                    toast.success('Course deleted successfully');
                } else {
                    toast.error('Failed to delete course: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                toast.error('Error deleting course');
            }
        }
    };

    const fetchCourses = useCallback(async (page = currentPage, status = statusFilter, search = debouncedSearchTerm, sBy = sortBy, sOrder = sortOrder) => {
        try {
            console.log('Fetching courses - Page:', page, 'Status:', status, 'Search:', search, 'SortBy:', sBy, 'SortOrder:', sOrder);
            setLoading(true);
            setError(null);
            const params = {
                _: CACHE_BUSTER.current,
                sortBy: sBy,
                sortOrder: sOrder,
                page,
                limit
            };
            if (status !== 'all') {
                params.status = status;
            }
            if (search) {
                params.search = search;
            }
            
            const response = await getCourses(params);
            console.log('Courses response:', response);
            if (response.success) {
                setCourses(response.data.courses || []);
                setTotalPages(response.data.pagination?.pages || 1);
                setTotalCourses(response.data.pagination?.total || 0);
            } else {
                setError(response.message || 'Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message || 'Error fetching courses');
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, statusFilter, debouncedSearchTerm, currentPage, limit]);

    useEffect(() => {
        const storedUser = getStoredUser();
        console.log('User data:', storedUser);
        
        if (storedUser) {
            console.log('Setting user state...');
            setUser(storedUser);
            setUserData(storedUser);
            setUserReady(true);
        } else {
            console.log('No user data found');
            setLoading(false);
            setUserReady(true);
        }

        // Cleanup function
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (userReady && (userData || user)) {
            fetchCourses();
        }
    }, [statusFilter, sortBy, sortOrder, debouncedSearchTerm, fetchCourses, userReady, userData, user]);
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
                                type="text"
                                className="form-control  search-table-frm pe-5"
                                id="search"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            />
                            <div className="adm-search-bx">
                                <button className="filter-btn" onClick={handleSearchSubmit}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="d-flex align-items-center justify-content-end gap-3">
                            <div className="text-end">
                                <div className="dropdown">
                                    <a
                                        href="javascript:void(0)"
                                        className="lg-white-btn dropdown-toggle"
                                        id="sortDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Sort by {sortBy === 'title' ? 'Title' : sortBy === 'price' ? 'Price' : 'Date'} ({sortOrder === 'asc' ? '↑' : '↓'})
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card" aria-labelledby="sortDropdown">
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('desc'); }}>Date (Newest)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('asc'); }}>Date (Oldest)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('title'); setSortOrder('asc'); }}>Title (A-Z)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('title'); setSortOrder('desc'); }}>Title (Z-A)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('price'); setSortOrder('desc'); }}>Price (High to Low)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('price'); setSortOrder('asc'); }}>Price (Low to High)</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

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
                                            courses.map((course, index) => (
                                                    <tr key={course._id}>
                                                        <td>{index + 1}.</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx">
                                                                    <img 
                                                                        src={getImageUrl(course.courseImage || course.thumbnail)} 
                                                                        alt={getLangText(course.title)}
                                                                        style={{ 
                                                                            width: '60px', 
                                                                            height: '60px', 
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    />
                                                                    <div className="admin-table-sub-details doctor-title">
                                                                        <h6>{getLangText(course.title)}</h6>
                                                                        <p>{course.category} - {course.level}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{course.students || course.totalEnrollments || 0}</td>
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
                                                                                navigate(`/new-course/${course._id}`);
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
                                        {courses.length === 0 && !loading && userReady && (
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
                                Showing {courses.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalCourses)} of {totalCourses} results
                            </div>

                            <nav>
                                <ul className="pagination dz-custom-pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a 
                                            className="page-link dz-page-link" 
                                            href="#" 
                                            aria-label="Previous"
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                        >
                                            <MdChevronLeft />
                                        </a>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <a 
                                                className="page-link dz-page-link" 
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                                            >
                                                {i + 1}
                                            </a>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a 
                                            className="page-link dz-page-link" 
                                            href="#" 
                                            aria-label="Next"
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                        >
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
