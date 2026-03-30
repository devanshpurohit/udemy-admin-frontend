import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import boyImg from '../../assets/images/boy.png';
import { getStudents, deleteStudent } from "../../services/studentService";
import { getCourseList } from "../../services/courseService";
import { getLangText } from "../../utils/languageUtils";

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [selectedProgress, setSelectedProgress] = useState('All');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [courseList, setCourseList] = useState([]);

    // Fetch dynamic courses
    const fetchCourseList = async () => {
        try {
            const response = await getCourseList();
            if (response.success) {
                setCourseList(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching course list:', err);
        }
    };

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                limit: 20,
                search: debouncedSearchTerm || undefined,
                course: selectedCourse !== 'All' ? selectedCourse : undefined,
                progress: selectedProgress !== 'All' ? selectedProgress : undefined,
                sortBy,
                sortOrder
            };
            
            const response = await getStudents(params);
            
            console.log('Frontend - Response:', response);
            console.log('Frontend - Response success:', response.success);
            console.log('Frontend - Response data:', response.data);
            console.log('Frontend - Students count:', response.data?.students?.length || 0);
            console.log('Frontend - Total students:', response.data?.pagination?.total || 0);
            
            if (response.success) {
                setStudents(response.data.students || []);
                setTotalStudents(response.data.pagination?.total || 0);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                setError(response.message || 'Failed to fetch students');
            }
        } catch (err) {
            setError('Error fetching students');
            console.error('Fetch students error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete student
    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await deleteStudent(studentId);
                if (response.success) {
                    setStudents(students.filter(student => student._id !== studentId));
                    setTotalStudents(totalStudents - 1);
                    toast.success('Student deleted successfully');
                } else {
                    toast.error('Failed to delete student: ' + response.message);
                }
            } catch (err) {
                console.error('Delete student error:', err);
                toast.error('Error deleting student');
            }
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

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Get student image
    const getStudentImage = (student) => {
        const image = student.profile?.profileImage;
        if (!image || image.includes('picsum.photos') || image.includes('boy.png')) return boyImg;
        
        // If it's a base64 string or a full URL, return as is
        if (image.startsWith('data:') || image.startsWith('http')) {
            return image;
        }
        
        // Otherwise, construct full URL using base URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
        const cleanImage = image.startsWith('/') ? image : `/${image}`;
        return `${baseUrl}${cleanImage}`;
    };

    // Get student name
    const getStudentName = (student) => {
        if (student.profile?.firstName || student.profile?.lastName) {
            return `${student.profile.firstName || ''} ${student.profile.lastName || ''}`.trim();
        }
        return student.username || 'Unknown';
    };

    // Get student email
    const getStudentEmail = (student) => {
        return student.email || student.username || 'N/A';
    };

    // Get enrolled course
    const getEnrolledCourse = (student) => {
        const courses = student.studentDetails?.enrolledCourses || [];
        if (courses.length === 0) return 'No Course';
        
        const titles = courses
            .filter(c => c.course && c.course.title)
            .map(c => getLangText(c.course.title));
        
        if (titles.length === 0) return `${courses.length} Course${courses.length > 1 ? 's' : ''}`;
        
        if (titles.length <= 2) return titles.join(', ');
        return `${titles[0]}, ${titles[1]} +${titles.length - 2} more`;
    };

    // Get progress
    const getProgress = (student) => {
        const courses = student.studentDetails?.enrolledCourses || [];
        if (courses.length === 0) return 0;
        const totalProgress = courses.reduce((acc, curr) => acc + (curr.progress || 0), 0);
        return Math.round(totalProgress / courses.length);
    };

    // Get last activity
    const getLastActivity = (student) => {
        if (student.studentDetails?.enrolledCourses && student.studentDetails.enrolledCourses.length > 0) {
            const course = student.studentDetails.enrolledCourses[0];
            return course.lastAccessedAt || course.createdAt || student.createdAt;
        }
        return student.createdAt;
    };

    // Check certificate status
    const getCertificateStatus = (student) => {
        return student.certificateCount || 0;
    };

    // Effects
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        fetchCourseList();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [currentPage, debouncedSearchTerm, selectedCourse, selectedProgress, sortBy, sortOrder]);

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
                                            Student Management
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

              <div className="row justify-content-between align-items-center mb-2">

  {/* LEFT — Search */}
  <div className="col-lg-4 mb-2">
    <div className="custom-frm-bx">
      <input
        type="text"
        className="form-control search-table-frm pe-5"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="adm-search-bx">
        <button className="filter-btn" onClick={() => { setDebouncedSearchTerm(searchTerm); fetchStudents(); }}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </div>
  </div>

  {/* RIGHT — Filters */}
  <div className="col-lg-8 mb-2">
    <div className="d-flex justify-content-end gap-2">

      <div className="dropdown">
        <a
          href="javascript:void(0)"
          className="lg-white-btn dropdown-toggle"
          id="sortDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Sort by {sortBy === 'profile.firstName' ? 'Name' : sortBy === 'createdAt' ? 'Date' : 'Progress'} ({sortOrder === 'asc' ? '↑' : '↓'})
        </a>
        <ul className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card" aria-labelledby="sortDropdown">
          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('desc'); }}>Date (Newest)</a>
          </li>
          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('asc'); }}>Date (Oldest)</a>
          </li>
          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('profile.firstName'); setSortOrder('asc'); }}>Name (A-Z)</a>
          </li>
          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('profile.firstName'); setSortOrder('desc'); }}>Name (Z-A)</a>
          </li>
        </ul>
      </div>

      <select
        className="form-select lg-white-btn"
        style={{ width: "200px", height: "45px", borderRadius: "10px", border: "1px solid #ECECEC" }}
        value={selectedCourse}
        onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1); }}
      >
        <option value="All">All Courses</option>
        {courseList.map(course => (
            <option key={course._id} value={course._id}>{getLangText(course.title)}</option>
        ))}
      </select>

      <select
        className="form-select lg-white-btn"
        style={{ width: "200px", height: "45px", borderRadius: "10px", border: "1px solid #ECECEC" }}
        value={selectedProgress}
        onChange={(e) => { setSelectedProgress(e.target.value); setCurrentPage(1); }}
      >
        <option value="All">All Progress</option>
        <option value="0-25">0-25%</option>
        <option value="25-50">25-50%</option>
        <option value="50-75">50-75%</option>
        <option value="75-100">75-100%</option>
      </select>

    </div>
  </div>

</div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="table-section">
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="innr-title mb-0">Student Management</h5>
                                <h5 className="innr-title mb-0 total-title">Total Students: {totalStudents}</h5>
                            </div>
                            
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            ) : (
                                <div className="table table-responsive mb-0">
                                    <table className="table mb-0">
                                        <thead>
                                            <tr>
                                                <th>Students</th>
                                                <th>Course</th>
                                                <th>Progress</th>
                                                <th>Certificate</th>
                                                <th>Last Activity</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
                                                        No students found
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map((student) => (
                                                    <tr key={student._id}>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx student-box">
                                                                    <img 
                                                                        src={getStudentImage(student)} 
                                                                        alt={getStudentName(student)} 
                                                                    />
                                                                    <div className="admin-table-sub-details doctor-title">
                                                                        <h6>{getStudentName(student)}</h6>
                                                                        <p>{getStudentEmail(student)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{getEnrolledCourse(student)}</td>
                                                        <td>
                                                            <div className="progress-wrapper">
                                                                <div className="progress-item">
                                                                    <div className="progress-label">{getProgress(student)}%</div>
                                                                    <div className="progress custom-progress">
                                                                        <div 
                                                                            className="progress-bar" 
                                                                            style={{ width: `${getProgress(student)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{getCertificateStatus(student)}</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx student-box">
                                                                    <div className="admin-table-sub-details doctor-title">
                                                                        <h6>{formatDate(getLastActivity(student))}</h6>
                                                                        <p>{formatTime(getLastActivity(student))}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="vertical-btn"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                >
                                                                    <li className="prescription-item">
                                                                        <NavLink 
                                                                            to={`/student-profile/${student._id}`} 
                                                                            className="prescription-nav"
                                                                        >
                                                                            View Profile
                                                                        </NavLink>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a 
                                                                            href="#" 
                                                                            className="prescription-nav"
                                                                            onClick={() => handleDeleteStudent(student._id)}
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
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="dz-pagination-wrapper">
                                    <div className="dz-pagination-info">
                                        Showing {students.length} of {totalStudents} students
                                    </div>
                                    <nav>
                                        <ul className="pagination dz-custom-pagination mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <a 
                                                    className="page-link dz-page-link" 
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(currentPage - 1);
                                                    }}
                                                    aria-label="Previous"
                                                >
                                                    <MdChevronLeft />
                                                </a>
                                            </li>
                                            
                                            {[...Array(totalPages)].map((_, index) => (
                                                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <a 
                                                        className="page-link dz-page-link" 
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(index + 1);
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </a>
                                                </li>
                                            ))}
                                            
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <a 
                                                    className="page-link dz-page-link" 
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(currentPage + 1);
                                                    }}
                                                    aria-label="Next"
                                                >
                                                    <MdChevronRight />
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StudentManagement;
