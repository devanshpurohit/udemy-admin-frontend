import { faDownload, faEye, faSearch, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { getStatements, downloadStatement, updateStatementStatus, getStatement } from "../../services/statementService";

function Statements() {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [totalStatements, setTotalStatements] = useState(0);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [viewingStatement, setViewingStatement] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const limit = 8;
    const debounceTimeoutRef = useRef(null);

    // Fetch statements with filters
    const fetchStatements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                limit,
                search: searchTerm || undefined,
                status: status !== 'all' ? status : undefined,
                sortBy,
                sortOrder
            };

            const response = await getStatements(params);

            if (response.success) {
                setStatements(response.data || []);
                // If the backend returns pagination data
                if (response.pagination) {
                    setTotalPages(response.pagination.pages || 1);
                    setTotalStatements(response.pagination.total || 0);
                }
            } else {
                setError(response.message || 'Failed to fetch statements');
            }
        } catch (error) {
            console.error('Error fetching statements:', error);
            setError(error.message || 'Error fetching statements');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, status, sortBy, sortOrder]);

    // Debounced search
    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1);
        }, 500);
    }, []);


    // Handle status filter
    const handleStatusFilter = useCallback((newStatus) => {
        setStatus(newStatus);
        setCurrentPage(1);
    }, []);

    // Handle download
    const handleDownload = useCallback(async (statementId) => {
        try {
            const response = await downloadStatement(statementId);
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `statement-${statementId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading statement:', error);
            toast.error('Failed to download statement');
        }
    }, []);

    // Handle view statement
    const handleViewStatement = useCallback(async (statementId) => {
        try {
            setModalLoading(true);
            const response = await getStatement(statementId);
            if (response.success) {
                setViewingStatement(response.data);
                setShowStatementModal(true);
            } else {
                toast.error(response.message || 'Failed to fetch statement details');
            }
        } catch (error) {
            console.error('Error viewing statement:', error);
            toast.error('Failed to view statement');
        } finally {
            setModalLoading(false);
        }
    }, []);

    // Handle status update
    const handleStatusUpdate = useCallback(async (statementId, newStatus) => {
        try {
            const response = await updateStatementStatus(statementId, newStatus);
            if (response.success) {
                // Update local state
                setStatements(prev => 
                    prev.map(stmt => 
                        stmt._id === statementId 
                            ? { ...stmt, status: newStatus }
                            : stmt
                    )
                );
                toast.success('Statement status updated successfully');
            } else {
                toast.error('Failed to update statement status');
            }
        } catch (error) {
            console.error('Error updating statement status:', error);
            toast.error('Error updating statement status');
        }
    }, []);

    // Initial fetch and pagination
    useEffect(() => {
        fetchStatements();
    }, [fetchStatements]);

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
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
                                            Statement
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-between mb-2">
                    <div className="col-lg-3">
                        <div className="custom-frm-bx">
                            <input
                                type="text"
                                className="form-control search-table-frm pe-5"
                                placeholder="Search by order ID"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && fetchStatements()}
                            />
                            <div className="adm-search-bx">
                                <button className="filter-btn" onClick={() => { setCurrentPage(1); fetchStatements(); }}>
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
                                        Sort by {sortBy === 'amount' ? 'Amount' : 'Date'} ({sortOrder === 'asc' ? '↑' : '↓'})
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card" aria-labelledby="sortDropdown">
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('desc'); }}>Date (Newest)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('createdAt'); setSortOrder('asc'); }}>Date (Oldest)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('amount'); setSortOrder('desc'); }}>Amount (High to Low)</a>
                                        </li>
                                        <li className="prescription-item">
                                            <a href="#" className="prescription-nav" onClick={(e) => { e.preventDefault(); setSortBy('amount'); setSortOrder('asc'); }}>Amount (Low to High)</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>


                            <div className="text-end">
                                <div className="dropdown">
                                    <a
                                        href="javascript:void(0)"
                                        className="lg-white-btn dropdown-toggle"
                                        id="statusDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Status: {status === 'all' ? 'All' : status}
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                        aria-labelledby="statusDropdown"
                                    >
                                        <li className="prescription-item">
                                            <a 
                                                href="#" 
                                                className={`prescription-nav ${status === 'all' ? 'active' : ''}`}
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
                                                className={`prescription-nav ${status === 'Paid' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleStatusFilter('Paid');
                                                }}
                                            >
                                                Paid
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a 
                                                href="#" 
                                                className={`prescription-nav ${status === 'Pending' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleStatusFilter('Pending');
                                                }}
                                            >
                                                Pending
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="table-section">
                            <h5 className="innr-title mb-0">Statement</h5>
                            <div className="table table-responsive mb-0">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Order ID</th>
                                            <th>User Name</th>
                                            <th>Course Name</th>
                                            <th>Amount</th>
                                            <th>Payment Status</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    Loading statements...
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    <div className="alert alert-danger">
                                                        {error}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : statements.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    No statements found
                                                </td>
                                            </tr>
                                        ) : (
                                            statements.map((statement, index) => (
                                                <tr key={statement._id}>
                                                    <td>{index + 1}</td>
                                                    <td>{statement.orderId}</td>
                                                    <td>{statement.student?.username || statement.user?.username}</td>
                                                    <td>{statement.course?.title}</td>
                                                    <td>₹{statement.amount}</td>
                                                    <td>{statement.status}</td>
                                                    <td>{new Date(statement.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div>
                                                            <button 
                                                                className="eye-toggle-btn" 
                                                                onClick={() => handleDownload(statement._id)}
                                                                title="Download Statement"
                                                            >
                                                                <FontAwesomeIcon icon={faDownload} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="eye-toggle-btn"
                                                                onClick={() => handleViewStatement(statement._id)}
                                                                title="View Statement"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="dz-pagination-wrapper">
                            <div className="dz-pagination-info">
                                Showing {statements.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalStatements)} of {totalStatements} results
                            </div>

                            <nav>
                                <ul className="pagination dz-custom-pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link dz-page-link" 
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <MdChevronLeft />
                                        </button>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button 
                                                className="page-link dz-page-link" 
                                                onClick={() => setCurrentPage(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link dz-page-link" 
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <MdChevronRight />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statement Preview Modal */}
            <div className={`modal fade ${showStatementModal ? 'show d-block' : ''}`} 
                 style={{ display: showStatementModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }} 
                 tabIndex="-1" 
                 aria-hidden={!showStatementModal}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content admin-dropdown-card w-100" style={{ border: 'none' }}>
                        <div className="modal-header border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-600">Statement Details</h5>
                            <button type="button" className="btn-close" onClick={() => setShowStatementModal(false)}>
                                <FontAwesomeIcon icon={faClose} style={{ color: '#000' }} />
                            </button>
                        </div>
                        <div className="modal-body p-4">
                            {modalLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : viewingStatement ? (
                                <div className="statement-preview">
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <p className="mb-1 text-muted fz-14">Order ID</p>
                                            <h6 className="fw-600">#{viewingStatement.orderId}</h6>
                                        </div>
                                        <div className="col-md-6 text-md-end">
                                            <p className="mb-1 text-muted fz-14">Date</p>
                                            <h6 className="fw-600">{new Date(viewingStatement.createdAt).toLocaleDateString()}</h6>
                                        </div>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <p className="mb-1 text-muted fz-14">Student Details</p>
                                            <h6 className="fw-600 mb-0">{viewingStatement.student?.name || viewingStatement.user?.username || 'N/A'}</h6>
                                            <p className="fz-14 mb-0 text-muted">{viewingStatement.student?.email || 'N/A'}</p>
                                        </div>
                                        <div className="col-md-6 text-md-end">
                                            <p className="mb-1 text-muted fz-14">Payment Info</p>
                                            <h6 className="fw-600 mb-0">{viewingStatement.paymentMethod}</h6>
                                            <span className={`badge ${viewingStatement.status === 'Paid' ? 'bg-success' : 'bg-warning'} fz-12`}>
                                                {viewingStatement.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="table-responsive bg-light rounded p-3">
                                        <table className="table table-borderless mb-0">
                                            <thead>
                                                <tr className="border-bottom">
                                                    <th className="fz-14 text-muted pt-0">Course Description</th>
                                                    <th className="fz-14 text-muted pt-0 text-end">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="py-3">
                                                        <h6 className="fz-16 mb-1">{viewingStatement.course?.title}</h6>
                                                        <p className="fz-14 mb-0 text-muted">{viewingStatement.course?.level} Level • {viewingStatement.course?.lessons?.length || 0} Lessons</p>
                                                    </td>
                                                    <td className="py-3 text-end fw-600 fz-18">₹{viewingStatement.amount}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-top">
                                                    <td className="pt-3 fw-700 fz-18">Total Amount</td>
                                                    <td className="pt-3 text-end fw-700 fz-20 text-primary">₹{viewingStatement.amount}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    {viewingStatement.notes && (
                                        <div className="mt-4">
                                            <p className="mb-1 text-muted fz-14">Notes</p>
                                            <p className="fz-14 p-2 bg-light rounded">{viewingStatement.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted">No statement data available.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-top px-4 py-3">
                            <button type="button" className="lg-white-btn" onClick={() => setShowStatementModal(false)}>
                                Close
                            </button>
                            <button type="button" className="sm-thm-btn" onClick={() => window.print()}>
                                <FontAwesomeIcon icon={faDownload} className="me-2" />
                                Print / Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showStatementModal && <div className="modal-backdrop fade show"></div>}
        </>
    )
}

export default Statements
