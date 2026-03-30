import { faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement, toggleAnnouncementStatus } from "../../services/announcementService";
import { getLangText } from "../../utils/languageUtils";

// Add cache-busting timestamp
const CACHE_BUSTER = new Date().getTime();

function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'title', 'priority'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft', 'archive'
    const [searchTerm, setSearchTerm] = useState('');
    const debounceTimeoutRef = useRef(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: 'all',
        isActive: true,
        status: 'published' // 'published', 'draft', 'archive'
    });
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    // Fetch announcements
    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Add aggressive cache-busting with sorting and filtering
            const response = await getAnnouncements({ 
                _: CACHE_BUSTER,
                v: '1.0.0', // Version parameter
                sortBy: sortBy,
                sortOrder: sortOrder,
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: searchTerm
            });
            console.log('📥 Announcements API response:', response);
            if (response.success) {
                console.log('✅ Announcements data:', response.data);
                console.log('🔍 Raw announcements array:', response.data.announcements);
                console.log('🔍 First announcement:', response.data.announcements?.[0]);
                setAnnouncements(response.data.announcements || response.data || []);
            } else {
                setError(response.message || 'Failed to fetch announcements');
            }
        } catch (err) {
            setError('Error fetching announcements');
            console.error('Fetch announcements error:', err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, statusFilter, searchTerm]);

    // Fetch announcements on component mount and when sorting/filtering changes
    useEffect(() => {
        fetchAnnouncements();
    }, [sortBy, sortOrder, statusFilter, fetchAnnouncements]);

    // Handle search change with debouncing
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchAnnouncements();
        }, 500);
    };

    // Handle search submit
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchAnnouncements();
    };

    // Handle input change
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 Form submitted with data:', formData);
        console.log('🚀 Editing announcement:', editingAnnouncement);
        console.log('🚀 Form data status:', formData.status);
        
        try {
            if (editingAnnouncement) {
                console.log('🔧 Updating announcement with ID:', editingAnnouncement._id);
                console.log('🔧 Update payload:', formData);
                const response = await updateAnnouncement(editingAnnouncement._id, formData);
                console.log('📥 Update response:', response);
                if (response.success) {
                    toast.success('Announcement updated successfully');
                } else {
                    toast.error('Failed to update announcement: ' + response.message);
                }
            } else {
                console.log('➕ Creating new announcement with data:', formData);
                console.log('➕ Create payload:', formData);
                const response = await createAnnouncement(formData);
                console.log('📥 Create response:', response);
                if (response.success) {
                    toast.success('Announcement created successfully');
                } else {
                    toast.error('Failed to create announcement: ' + response.message);
                }
            }
            
            // Reset form and close modal
            setFormData({ 
                title: '', 
                content: '', 
                targetAudience: 'all',
                isActive: true,
                status: 'published'
            });
            setEditingAnnouncement(null);
            setShowModal(false);
            setShowEditModal(false);
            fetchAnnouncements(); // Refresh list
        } catch (err) {
            console.error('❌ Submit error:', err);
            toast.error('Error saving announcement');
        }
    };

    // Handle edit
    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            targetAudience: announcement.targetAudience,
            isActive: announcement.isActive,
            status: announcement.status || 'published'
        });
        setShowEditModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                const response = await deleteAnnouncement(id);
                if (response.success) {
                    toast.success('Announcement deleted successfully');
                    fetchAnnouncements();
                } else {
                    toast.error('Failed to delete announcement: ' + response.message);
                }
            } catch (err) {
                console.error('❌ Delete error:', err);
                toast.error('Error deleting announcement');
            }
        }
    };

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await updateAnnouncement(id, { status: newStatus });
            if (response.success) {
                fetchAnnouncements();
            } else {
                toast.error('Failed to update announcement status: ' + response.message);
            }
        } catch (err) {
            console.error('❌ Status change error:', err);
            toast.error('Error updating announcement status');
        }
    };
    const handleToggleStatus = async (id) => {
        try {
            const response = await toggleAnnouncementStatus(id);
            if (response.success) {
                fetchAnnouncements();
            } else {
                toast.error('Failed to toggle announcement status: ' + response.message);
            }
        } catch (err) {
            console.error('❌ Toggle status error:', err);
            toast.error('Error toggling announcement status');
        }
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
                                            Announcement
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
                                <FaPlus /> Add Announcement
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
        placeholder="Search announcements..."
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

  {/* RIGHT — FILTERS */}
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
          Sort by{" "}
          {sortBy === "title"
            ? "Title"
            : sortBy === "status"
            ? "Status"
            : "Date"}{" "}
          ({sortOrder === "asc" ? "↑" : "↓"})
        </a>

        <ul
          className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
          aria-labelledby="acticonMenu2"
        >
          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => {setSortBy('createdAt'); setSortOrder('desc');}}>
              Date (Newest)
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => {setSortBy('createdAt'); setSortOrder('asc');}}>
              Date (Oldest)
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => {setSortBy('title'); setSortOrder('asc');}}>
              Title (A-Z)
            </a>
          </li>



          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => {setSortBy('status'); setSortOrder('asc');}}>
              Status (Published → Draft → Archive)
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
          Status:{" "}
          {statusFilter === "all"
            ? "All"
            : statusFilter === "published"
            ? "Published"
            : "Draft"}
        </a>

        <ul
          className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
          aria-labelledby="acticonMenu3"
        >
          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => setStatusFilter("all")}>
              All
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => setStatusFilter("published")}>
              Published
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => setStatusFilter("draft")}>
              Draft
            </a>
          </li>

          <li className="prescription-item">
            <a href="#" className="prescription-nav"
              onClick={() => setStatusFilter("archive")}>
              Archive
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
                            <h5 className="innr-title mb-0">Announcement Management</h5>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Announcements</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <div className="spinner-border" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    <div className="alert alert-danger">{error}</div>
                                                </td>
                                            </tr>
                                        ) : announcements.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4">
                                                    No announcements found
                                                </td>
                                            </tr>
                                        ) : (
                                            announcements.map((announcement, index) => {
                                                console.log(`🔍 Rendering announcement ${index}:`, announcement);
                                                console.log(`🔍 Status for announcement ${index}:`, announcement.status);
                                                console.log(`🔍 isActive for announcement ${index}:`, announcement.isActive);
                                                return (
                                                    <tr key={announcement._id}>
                                                        <td>{formatDate(announcement.createdAt)}</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx">
                                                                    <div className="admin-table-sub-details">
                                                                        <h6>{getLangText(announcement.title)}</h6>
                                                                        <p>{getLangText(announcement.content).substring(0, 100)}{getLangText(announcement.content).length > 100 ? '...' : ''}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className={`badge bg-${announcement.status === 'published' ? 'success' : announcement.status === 'draft' ? 'warning' : 'secondary'} text-white`}>
                                                                {announcement.status === 'published' ? 'Published' : announcement.status === 'draft' ? 'Draft' : 'Archive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="dropdown">
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    className="vertical-btn"
                                                                    id={`acticonMenu${announcement._id}`}
                                                                    data-bs-toggle="dropdown"
                                                                    aria-expanded="false"
                                                                >
                                                                    <BsThreeDotsVertical />
                                                                </a>
                                                                <ul
                                                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                    aria-labelledby={`acticonMenu${announcement._id}`}
                                                                >
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleEdit(announcement)}>
                                                                            Edit
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleStatusChange(announcement._id, 'published')}>
                                                                            Mark as Published
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleStatusChange(announcement._id, 'draft')}>
                                                                            Mark as Draft
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleStatusChange(announcement._id, 'archive')}>
                                                                            Archive
                                                                        </a>
                                                                    </li>
                                                                    <li className="prescription-item">
                                                                        <a href="#" className="prescription-nav" onClick={() => handleDelete(announcement._id)}>
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
{/* ================= ADD ANNOUNCEMENT MODAL ================= */}
<div
    className={`modal step-modal fade ${showModal ? 'show d-block' : ''}`}
    style={{ display: showModal ? 'block' : 'none' }}
    id="add-Announcement"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabIndex="-1"
    aria-hidden={!showModal}
>
    <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content custom-modal-box">
            
            <div className="text-end">
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setShowModal(false)}
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>

            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                <h6 className="lg_title mb-0">Add New Announcement</h6>
            </div>

            <div className="modal-body px-4">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-lg-12">

                            {/* Title */}
                            <div className="custom-frm-bx">
                                <label>Announcement Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    value={formData.title || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div className="custom-frm-bx">
                                <label>Description</label>
                                <textarea
                                    name="content"
                                    className="form-control"
                                    rows="4"
                                    value={formData.content || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>



                            {/* Status */}
                            <div className="custom-frm-bx">
                                <label>Status</label>
                                <select
                                    name="status"
                                    className="form-control"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="archive">Archive</option>
                                </select>
                            </div>

                            {/* Target Audience */}
                            <div className="custom-frm-bx">
                                <label>Target Audience</label>
                                <select
                                    name="targetAudience"
                                    className="form-control"
                                    value={formData.targetAudience}
                                    onChange={handleInputChange}
                                >
                                    <option value="all">All Users</option>
                                    <option value="students">Students</option>
                                    <option value="instructors">Instructors</option>
                                    <option value="admins">Admins</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="sm-thm-btn outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="sm-thm-btn">
                                    Submit
                                </button>
                            </div>

                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>



{/* ================= EDIT ANNOUNCEMENT MODAL ================= */}
<div
    className={`modal step-modal fade ${showEditModal ? 'show d-block' : ''}`}
    style={{ display: showEditModal ? 'block' : 'none' }}
    id="edit-Announcement"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabIndex="-1"
    aria-hidden={!showEditModal}
>
    <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content custom-modal-box">

            <div className="text-end">
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setShowEditModal(false)}
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>

            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                <h6 className="lg_title mb-0">Edit Announcement</h6>
            </div>

            <div className="modal-body px-4">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-lg-12">

                            {/* Same fields reused */}

                            <div className="custom-frm-bx">
                                <label>Announcement Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    value={formData.title || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="custom-frm-bx">
                                <label>Description</label>
                                <textarea
                                    name="content"
                                    className="form-control"
                                    rows="4"
                                    value={formData.content || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>



                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="sm-thm-btn outline"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="sm-thm-btn">
                                    Update
                                </button>
                            </div>

                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>

        </>
    )
}

export default Announcement
