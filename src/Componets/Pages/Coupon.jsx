import { faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaPlus } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCoupons, createCoupon, deleteCoupon, updateCoupon } from "../../services/couponService";

// Add cache-busting timestamp
const CACHE_BUSTER = new Date().getTime();

function Coupon() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'value', 'code'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        endDate: ''
    });
    const [editingCoupon, setEditingCoupon] = useState(null);

    // Fetch coupons with debouncing
    const fetchCoupons = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Add minimal parameters to avoid rate limiting
            const response = await getCoupons({ 
                sortBy: sortBy,
                sortOrder: sortOrder
            });
            console.log('📥 Coupons API response:', response);
            if (response.success) {
                console.log('✅ Coupons data:', response.data);
                setCoupons(response.data.coupons || response.data || []);
            } else {
                setError(response.message || 'Failed to fetch coupons');
            }
        } catch (err) {
            setError('Error fetching coupons');
            console.error('Fetch coupons error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch coupons on component mount and when sorting changes
    useEffect(() => {
        fetchCoupons();
    }, [sortBy, sortOrder]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🚀 Form submitted with data:', formData);
        console.log('🚀 Editing coupon:', editingCoupon);
        
        try {
            if (editingCoupon) {
                console.log('🔧 Updating coupon with ID:', editingCoupon._id);
                const response = await updateCoupon(editingCoupon._id, formData);
                console.log('📥 Update response:', response);
                if (response.success) {
                    toast.success('Coupon updated successfully');
                } else {
                    toast.error('Failed to update coupon: ' + response.message);
                }
            } else {
                console.log('➕ Creating new coupon with data:', formData);
                const response = await createCoupon(formData);
                console.log('📥 Create response:', response);
                if (response.success) {
                    toast.success('Coupon created successfully');
                } else {
                    toast.error('Failed to create coupon: ' + response.message);
                }
            }
            
            // Reset form and close modal
            setFormData({ code: '', discount: '', expiryDate: '' });
            setEditingCoupon(null);
            setShowModal(false);
            fetchCoupons(); // Refresh list
        } catch (err) {
            console.error('❌ Submit error:', err);
            toast.error('Error saving coupon');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const response = await deleteCoupon(id);
                if (response.success) {
                    toast.success('Coupon deleted successfully');
                    fetchCoupons(); // Refresh list
                } else {
                    toast.error('Failed to delete coupon: ' + response.message);
                }
            } catch (err) {
                console.error('Delete error:', err);
                toast.error('Error deleting coupon');
            }
        }
    };

    // Handle edit
    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            discount: coupon.discount,
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    // Handle input change
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

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
                                            Coupon
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>

                        <div className="text-end">
                            <button 
                                className="thm-btn" 
                                onClick={() => {
                                    setEditingCoupon(null); // Reset editing state
                                    setFormData({ // Reset form data
                                        code: '',
                                        description: '',
                                        type: 'percentage',
                                        value: '',
                                        endDate: ''
                                    });
                                    setShowModal(true);
                                }}
                            >
                                <FaPlus /> Add New Coupon
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-between mb-2">
                    <div className="col-lg-3">
                        <div className="custom-frm-bx">
                            <input
                                type="text"
                                className="form-control search-table-frm pe-5"
                                placeholder="Search coupons..."
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
                                    Sort by {sortBy === 'value' ? 'Discount' : sortBy === 'code' ? 'Code' : 'Date'} ({sortOrder === 'asc' ? '↑' : '↓'})
                                </a>
                                <ul
                                    className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                    aria-labelledby="acticonMenu2"
                                >
                                    <li className="prescription-item">
                                        <a href="#" className="prescription-nav" onClick={() => {setSortBy('value'); setSortOrder('desc');}}>
                                            Discount (High to Low)
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a href="#" className="prescription-nav" onClick={() => {setSortBy('value'); setSortOrder('asc');}}>
                                            Discount (Low to High)
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a href="#" className="prescription-nav" onClick={() => {setSortBy('code'); setSortOrder('asc');}}>
                                            Code (A-Z)
                                        </a>
                                    </li>
                                    <li className="prescription-item">
                                        <a href="#" className="prescription-nav" onClick={() => {setSortBy('createdAt'); setSortOrder('desc');}}>
                                            Date (Newest)
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
                            <h5 className="innr-title mb-0">Coupon Management</h5>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Coupon Code</th>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Discount Value</th>
                                            <th>Validity Till</th>
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
                                        ) : coupons.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    No coupons found
                                                </td>
                                            </tr>
                                        ) : (
                                            coupons.map((coupon, index) => (
                                                <tr key={coupon._id}>
                                                    <td>{index + 1}</td>
                                                    <td>{coupon.code}</td>
                                                    <td>{coupon.description}</td>
                                                    <td>{coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</td>
                                                    <td>{coupon.type === 'percentage' ? coupon.value + '%' : '$' + coupon.value}</td>
                                                    <td>{formatDate(coupon.endDate)}</td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <a
                                                                href="javascript:void(0)"
                                                                className="vertical-btn"
                                                                id={`acticonMenu${coupon._id}`}
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                <BsThreeDotsVertical />
                                                            </a>
                                                            <ul
                                                                className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                                                aria-labelledby={`acticonMenu${coupon._id}`}
                                                            >
                                                                <li className="prescription-item">
                                                                    <a 
                                                                        href="javascript:void(0)" 
                                                                        className="prescription-nav"
                                                                        onClick={() => handleEdit(coupon)}
                                                                    >
                                                                        Edit
                                                                    </a>
                                                                </li>
                                                                <li className="prescription-item">
                                                                    <a 
                                                                        href="javascript:void(0)" 
                                                                        className="prescription-nav"
                                                                        onClick={() => handleDelete(coupon._id)}
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
                        </div>
                    </div>
                </div>

                {/* Add/Edit Coupon Modal */}
                <div className={`modal step-modal fade ${showModal ? 'show d-block' : ''}`} style={{ display: showModal ? 'block' : 'none' }} id="add-Announcement" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden={!showModal}>
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content custom-modal-box">
                            <div className="text-end">
                                <button 
                                    type="button" 
                                    className="modal-close-btn" 
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCoupon(null); // Reset editing state
                                        setFormData({ // Reset form data
                                            code: '',
                                            description: '',
                                            type: 'percentage',
                                            value: '',
                                            endDate: ''
                                        });
                                    }}
                                    aria-label="Close"
                                >
                                    <FontAwesomeIcon icon={faClose} />
                                </button>
                            </div>
                            <div className="d-flex align-items-center justify-content-between popup-nw-brd px-4">
                                <div>
                                    <h6 className="lg_title mb-0">
                                        {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                                    </h6>
                                </div>
                            </div>
                            <div className="modal-body px-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="custom-frm-bx">
                                                <label htmlFor="code">Coupon Code</label>
                                                <input 
                                                    type="text" 
                                                    name="code"
                                                    id="code"
                                                    className="form-control" 
                                                    placeholder="Enter Coupon Code"
                                                    value={formData.code}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="description">Description</label>
                                                <textarea 
                                                    name="description"
                                                    id="description"
                                                    className="form-control" 
                                                    placeholder="Enter Coupon Description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    required
                                                />
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="type">Coupon Type</label>
                                                <select 
                                                    name="type"
                                                    id="type"
                                                    className="form-control" 
                                                    value={formData.type}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="percentage">Percentage</option>
                                                    <option value="fixed_amount">Fixed Amount</option>
                                                </select>
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="value">Discount Value</label>
                                                <input 
                                                    type="number" 
                                                    name="value"
                                                    id="value"
                                                    className="form-control" 
                                                    placeholder="Enter Discount Value"
                                                    value={formData.value}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            <div className="custom-frm-bx">
                                                <label htmlFor="endDate">Expiry Date</label>
                                                <input 
                                                    type="date" 
                                                    name="endDate"
                                                    id="endDate"
                                                    className="form-control" 
                                                    value={formData.endDate}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="d-flex align-items-center gap-2 justify-content-end mt-4">
                                                <button 
                                                    type="button" 
                                                    className="sm-thm-btn outline"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className="sm-thm-btn">
                                                    {editingCoupon ? 'Update' : 'Submit'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Coupon
