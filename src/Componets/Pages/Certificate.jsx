import { faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { getCertificates, generateCertificate, deleteCertificate, updateCertificate, revokeCertificate } from "../../services/certificateService";
import { getStudents } from "../../services/studentService";
import { getCourseList } from "../../services/courseService";

// Add cache-busting timestamp
const CACHE_BUSTER = new Date().getTime();

function Certificate() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortBy, setSortBy] = useState('issuedAt'); // 'issuedAt', 'courseTitle'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive' (show all by default)
    const [searchTerm, setSearchTerm] = useState('');
    const debounceTimeoutRef = useRef(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingCertificate, setViewingCertificate] = useState(null);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        studentId: '',
        courseId: '',
        student: '',
        course: '',
        instructor: '',
        courseTitle: '',
        studentName: '',
        template: 'modern',
        completedAt: new Date().toISOString().split('T')[0]
    });
    const [editingCertificate, setEditingCertificate] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [studentsRes, coursesRes] = await Promise.all([
                    getStudents({ limit: 1000 }),
                    getCourseList()
                ]);
                
                if (studentsRes.success) {
                    setStudents(studentsRes.data.students || []);
                }
                if (coursesRes.success) {
                    setCourses(coursesRes.data || []);
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch certificates
    const fetchCertificates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Add aggressive cache-busting with sorting and filtering
            const response = await getCertificates({ 
                _: CACHE_BUSTER,
                v: '1.0.0',
                sortBy: sortBy,
                sortOrder: sortOrder,
                limit: 50, // Increased limit to fetch more certificates
                search: searchTerm,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });
            console.log('📥 Certificates API response:', response);
            if (response.success) {
                console.log('✅ Certificates data:', response.data);
                setCertificates(response.data.certificates || response.data || []);
            } else {
                setError(response.message || 'Failed to fetch certificates');
            }
        } catch (err) {
            setError('Error fetching certificates');
            console.error('Fetch certificates error:', err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, statusFilter, searchTerm]);

    // Fetch certificates on component mount and when sorting/filtering changes
    useEffect(() => {
        fetchCertificates();
    }, [sortBy, sortOrder, statusFilter, fetchCertificates]);

    // Handle search change with debouncing
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchCertificates();
        }, 500);
    };

    // Handle search submit
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchCertificates();
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        let updatedFormData = {
            ...formData,
            [name]: value
        };

        // If courseId changed, update courseTitle automatically
        if (name === 'courseId') {
            const selectedCourse = courses.find(c => c._id === value);
            if (selectedCourse) {
                updatedFormData.courseTitle = selectedCourse.title;
            }
        }

        // If studentId changed, update studentName automatically
        if (name === 'studentId') {
            const selectedStudent = students.find(s => s._id === value);
            if (selectedStudent) {
                const name = `${selectedStudent.profile?.firstName || ''} ${selectedStudent.profile?.lastName || ''}`.trim() || selectedStudent.username;
                updatedFormData.studentName = name;
            }
        }

        setFormData(updatedFormData);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.studentId || !formData.courseId) {
            toast.error('Please select a student and a course');
            return;
        }

        console.log('🚀 Form submitted with data:', formData);
        
        try {
            if (editingCertificate) {
                console.log('🔧 Updating certificate with ID:', editingCertificate._id);
                const response = await updateCertificate(editingCertificate._id, formData);
                console.log('📥 Update response:', response);
                if (response.success) {
                    toast.success('Certificate updated successfully');
                } else {
                    toast.error('Failed to update certificate: ' + response.message);
                }
            } else {
                console.log('➕ Generating new certificate with data:', formData);
                const response = await generateCertificate(formData);
                console.log('📥 Generate response:', response);
                if (response.success) {
                    toast.success('Certificate generated successfully');
                } else {
                    toast.error('Failed to generate certificate: ' + response.message);
                }
            }
            
            // Reset form and close modal
            setFormData({ 
                studentId: '',
                courseId: '',
                student: '', 
                course: '', 
                instructor: '',
                courseTitle: '',
                studentName: '',
                template: 'modern',
                completedAt: new Date().toISOString().split('T')[0]
            });
            setEditingCertificate(null);
            setShowModal(false);
            setShowEditModal(false);
            fetchCertificates(); // Refresh list
        } catch (err) {
            console.error('❌ Submit error:', err);
            toast.error('Error saving certificate');
        }
    };

    // Handle edit
    const handleEdit = (certificate) => {
        setEditingCertificate(certificate);
        setFormData({
            student: certificate.student?._id || '',
            course: certificate.course?._id || '',
            instructor: certificate.instructor?._id || '',
            courseTitle: certificate.courseTitle,
            studentName: certificate.studentName || '',
            template: certificate.template,
            completedAt: certificate.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
        setShowEditModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this certificate?')) {
            try {
                const response = await deleteCertificate(id);
                if (response.success) {
                    toast.success('Certificate deleted successfully');
                    fetchCertificates();
                } else {
                    toast.error('Failed to delete certificate: ' + response.message);
                }
            } catch (err) {
                console.error('❌ Delete error:', err);
                toast.error('Error deleting certificate');
            }
        }
    };

    // Handle revoke/inactive/active
    const handleRevoke = async (id, status = 'revoked') => {
        let reason = null;
        
        if (status === 'inactive') {
            const confirmed = window.confirm('Are you sure you want to mark this certificate as inactive?');
            if (!confirmed) return;
        } else if (status === 'active') {
            const confirmed = window.confirm('Are you sure you want to reactivate this certificate?');
            if (!confirmed) return;
        } else {
            reason = prompt('Please enter reason for revoking this certificate:');
            if (!reason) return;
        }
        
        try {
            console.log(`🔄 Updating certificate ${id} to status: ${status}`);
            const response = await revokeCertificate(id, reason, status);
            console.log('📥 Update response:', response);
            if (response.success) {
                toast.success(`Certificate ${status === 'active' ? 'reactivated' : status === 'inactive' ? 'marked as inactive' : 'revoked'} successfully`);
                // Force refresh with cache busting
                setCertificates([]); // Clear current data
                setTimeout(() => {
                    fetchCertificates(); // Refetch fresh data
                }, 100);
            } else {
                toast.error(`Failed to update certificate: ${response.message}`);
            }
        } catch (err) {
            console.error('❌ Update status error:', err);
            toast.error('Error updating certificate status');
        }
    };

    // Handle view certificate
    const handleView = (certificate) => {
        setViewingCertificate(certificate);
        setShowViewModal(true);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                                            Certificate
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="text-end">
                            <button 
                                className="thm-btn" 
                                onClick={() => setShowModal(true)}
                            >
                                <FaPlus /> Generate Certificate
                            </button>
                        </div>
                    </div>
                </div>

               <div className="row justify-content-between align-items-center mb-2">

  {/* LEFT — SEARCH */}
  <div className="col-lg-4 mb-2">
    <div className="custom-frm-bx">
      <input
        type="text"
        className="form-control search-table-frm pe-5"
        placeholder="Search certificates..."
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

  {/* RIGHT — DROPDOWNS */}
  <div className="col-lg-6 mb-2">
    <div className="d-flex justify-content-end gap-2">

      {/* SORT */}
      <div className="dropdown">
        <a
          href="javascript:void(0)"
          className="lg-white-btn dropdown-toggle"
          id="acticonMenu2"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Sort by {sortBy === "courseTitle" ? "Course Title" : "Date"} ({sortOrder === "asc" ? "↑" : "↓"})
        </a>

        <ul
          className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
          aria-labelledby="acticonMenu2"
        >
          <li className="prescription-item">
            <a
              href="#"
              className="prescription-nav"
              onClick={() => {
                setSortBy("issuedAt");
                setSortOrder("desc");
              }}
            >
              Date (Newest)
            </a>
          </li>

          <li className="prescription-item">
            <a
              href="#"
              className="prescription-nav"
              onClick={() => {
                setSortBy("issuedAt");
                setSortOrder("asc");
              }}
            >
              Date (Oldest)
            </a>
          </li>

          <li className="prescription-item">
            <a
              href="#"
              className="prescription-nav"
              onClick={() => {
                setSortBy("courseTitle");
                setSortOrder("asc");
              }}
            >
              Course Title (A-Z)
            </a>
          </li>
        </ul>
      </div>

      {/* STATUS */}
      <div className="dropdown">
        <a
          href="javascript:void(0)"
          className="lg-white-btn dropdown-toggle"
          id="acticonMenu3"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Status: {statusFilter === "all"
            ? "All"
            : statusFilter === "active"
            ? "Active"
            : "Inactive"}
        </a>

        <ul
          className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
          aria-labelledby="acticonMenu3"
        >
          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={() => setStatusFilter("all")}>
              All
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={() => setStatusFilter("active")}>
              Active
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav" onClick={() => setStatusFilter("inactive")}>
              Inactive
            </a>
          </li>
        </ul>
      </div>

    </div>
  </div>

</div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="table-section">
                            <h5 className="innr-title mb-0">Certificate Management</h5>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Certificate ID</th>
                                            <th>Course Title</th>
                                            <th>Received by</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    <div className="alert alert-danger">{error}</div>
                                                </td>
                                            </tr>
                                        ) : certificates.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    No certificates found
                                                </td>
                                            </tr>
                                        ) : (
                                            certificates.map((certificate, index) => {
                                                console.log(`🔍 Rendering certificate ${index}:`, certificate);
                                                console.log(`🔍 Status for certificate ${index}:`, certificate.isRevoked);
                                                return (
                                                    <tr key={certificate._id}>
                                                        <td>{formatDate(certificate.issuedAt)}</td>
                                                        <td>
                                                            <span className="badge bg-info text-white">{certificate.certificateId}</span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-primary text-white">{certificate.courseTitle}</span>
                                                        </td>
                                                        <td>{certificate.studentName || 'N/A'}</td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="vertical-btn"
                                                                    id={`acticonMenu${certificate._id}`}
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby={`acticonMenu${certificate._id}`}
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleView(certificate)}>
                                                                            View
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleEdit(certificate)}>
                                                                            Edit
                                                                        </a>
                                                                    </li>
                                                                    {certificate.status === 'active' ? (
                                                                        <li className="prescription-item">
                                                                            <a href="#" className="prescription-nav" onClick={() => handleRevoke(certificate._id, 'inactive')}>
                                                                                Mark as Inactive
                                                                            </a>
                                                                        </li>
                                                                    ) : certificate.status === 'inactive' ? (
                                                                        <li className="prescription-item">
                                                                            <a href="#" className="prescription-nav" onClick={() => handleRevoke(certificate._id, 'active')}>
                                                                                Reactivate
                                                                            </a>
                                                                        </li>
                                                                    ) : certificate.status === 'revoked' ? (
                                                                        <>
                                                                            <li className="prescription-item">
                                                                                <a href="#" className="prescription-nav" onClick={() => handleRevoke(certificate._id, 'active')}>
                                                                                    Mark as Active
                                                                                </a>
                                                                            </li>
                                                                            <li className="prescription-item">
                                                                                <a href="#" className="prescription-nav" onClick={() => handleRevoke(certificate._id, 'inactive')}>
                                                                                    Mark as Inactive
                                                                                </a>
                                                                            </li>
                                                                        </>
                                                                    ) : null}
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleRevoke(certificate._id, 'revoked')}>
                                                                            Revoke
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleDelete(certificate._id)}>
                                                                            Delete
                                                                        </a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Certificate Modal */}
            <div className={`modal step-modal fade ${showModal ? 'show d-block' : ''}`} style={{ display: showModal ? 'block' : 'none' }} id="add-Certificate" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden={!showModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                            <div>
                                <h6 className="lg_title mb-0">Generate New Certificate</h6>
                            </div>
                        </div>
                        <div className="modal-body px-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="courseId">Course</label>
                                            <select 
                                                name="courseId"
                                                id="courseId"
                                                className="form-control" 
                                                value={formData.courseId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Course</option>
                                                {courses.map(course => (
                                                    <option key={course._id} value={course._id}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="studentId">Student</label>
                                            <select 
                                                name="studentId"
                                                id="studentId"
                                                className="form-control" 
                                                value={formData.studentId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Student</option>
                                                {students.map(student => (
                                                    <option key={student._id} value={student._id}>
                                                        {`${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.trim() || student.username} ({student.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-lg-6">
                                        

                                        <div className="custom-frm-bx">
                                            <label htmlFor="template">Template</label>
                                            <select 
                                                name="template"
                                                id="template"
                                                className="form-control" 
                                                value={formData.template}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="modern">Modern</option>
                                                <option value="classic">Classic</option>
                                                <option value="minimal">Minimal</option>
                                                <option value="professional">Professional</option>
                                            </select>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="completedAt">Completion Date</label>
                                            <input 
                                                type="date" 
                                                name="completedAt"
                                                id="completedAt"
                                                className="form-control" 
                                                value={formData.completedAt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 justify-content-end mt-4">
                                        <button type="button" className="sm-thm-btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="sm-thm-btn">Generate Certificate</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Certificate Modal */}
            <div className={`modal step-modal fade ${showEditModal ? 'show d-block' : ''}`} style={{ display: showEditModal ? 'block' : 'none' }} id="edit-Certificate" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden={!showEditModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                            <div>
                                <h6 className="lg_title mb-0">Edit Certificate</h6>
                            </div>
                        </div>
                        <div className="modal-body px-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label htmlFor="studentName">Received by</label>
                                            <input 
                                                type="text" 
                                                name="studentName"
                                                id="studentName"
                                                className="form-control" 
                                                placeholder="Enter Student Name"
                                                value={formData.studentName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="courseTitle">Course Title</label>
                                            <input 
                                                type="text" 
                                                name="courseTitle"
                                                id="courseTitle"
                                                className="form-control" 
                                                placeholder="Enter Course Title"
                                                value={formData.courseTitle}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="instructorName">Instructor Name</label>
                                            <input 
                                                type="text" 
                                                name="instructorName"
                                                id="instructorName"
                                                className="form-control" 
                                                placeholder="Enter Instructor Name"
                                                value={formData.instructorName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="template">Template</label>
                                            <select 
                                                name="template"
                                                id="template"
                                                className="form-control" 
                                                value={formData.template}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="modern">Modern</option>
                                                <option value="classic">Classic</option>
                                                <option value="minimal">Minimal</option>
                                                <option value="professional">Professional</option>
                                            </select>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <label htmlFor="completedAt">Completion Date</label>
                                            <input 
                                                type="date" 
                                                name="completedAt"
                                                id="completedAt"
                                                className="form-control" 
                                                value={formData.completedAt}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 justify-content-end mt-4">
                                        <button type="button" className="sm-thm-btn outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                                        <button type="submit" className="sm-thm-btn">Update Certificate</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Certificate Modal */}
            <div className={`modal step-modal fade ${showViewModal ? 'show d-block' : ''}`} style={{ display: showViewModal ? 'block' : 'none' }} id="view-Certificate" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden={!showViewModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" onClick={() => setShowViewModal(false)}>
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                            <div>
                                <h6 className="lg_title mb-0">Certificate Details</h6>
                            </div>
                        </div>
                        <div className="modal-body px-4">
                            {viewingCertificate && (
                                <div className="certificate-view">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <h6>Certificate Information</h6>
                                            <table className="table table-bordered">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Certificate ID:</strong></td>
                                                        <td>{viewingCertificate.certificateId}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Course Title:</strong></td>
                                                        <td>{viewingCertificate.courseTitle}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Received by:</strong></td>
                                                        <td>{viewingCertificate.studentName || 'N/A'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Verification</h6>
                                            <div className="alert alert-info">
                                                <strong>Verification Code:</strong> {viewingCertificate.certificateId}
                                                <br />
                                                <small>Use this code to verify the certificate authenticity.</small>
                                            </div>
                                            {viewingCertificate.revokedReason && (
                                                <div className="alert alert-danger">
                                                    <strong>Revocation Reason:</strong> {viewingCertificate.revokedReason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer px-4">
                            <button type="button" className="sm-thm-btn" onClick={() => setShowViewModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Certificate
