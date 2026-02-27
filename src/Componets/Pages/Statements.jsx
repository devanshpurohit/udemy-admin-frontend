import { faDownload, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdChevronLeft } from "react-icons/md";
import { MdChevronRight } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getStatements, downloadStatement, updateStatementStatus } from "../../services/statementService";

function Statements() {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [status, setStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const debounceTimeoutRef = useRef(null);

    // Fetch statements with filters
    const fetchStatements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                limit: 20,
                search: searchTerm,
                paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
                status: status !== 'all' ? status : undefined
            };
            
            const response = await getStatements(params);
            
            if (response.success) {
                setStatements(response.data.statements || []);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setError(response.message || 'Failed to fetch statements');
            }
        } catch (error) {
            console.error('Error fetching statements:', error);
            setError(error.message || 'Error fetching statements');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, paymentMethod, status]);

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

    // Handle payment method filter
    const handlePaymentMethodFilter = useCallback((method) => {
        setPaymentMethod(method);
        setCurrentPage(1);
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
            alert('Failed to download statement');
        }
    }, []);

    // Handle view statement
    const handleViewStatement = useCallback(async (statementId) => {
        try {
            const response = await downloadStatement(statementId);
            
            // Open in new tab
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error viewing statement:', error);
            alert('Failed to view statement');
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
                alert('Statement status updated successfully');
            } else {
                alert('Failed to update statement status');
            }
        } catch (error) {
            console.error('Error updating statement status:', error);
            alert('Error updating statement status');
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
                                placeholder="Search by order ID or course name"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <div className="adm-search-bx">
                                <button className="filter-btn">
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="d-flex align-items-center justify-content-end gap-3">
                            <div className="text-end">
                                <div className="dropdown">
                                    <a
                                        href="javascript:void(0)"
                                        className="lg-white-btn dropdown-toggle"
                                        id="paymentMethodDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Payment Method: {paymentMethod === 'all' ? 'All' : paymentMethod}
                                    </a>
                                    <ul
                                        className="dropdown-menu dropdown-menu-end tble-action-menu admin-dropdown-card"
                                        aria-labelledby="paymentMethodDropdown"
                                    >
                                        <li className="prescription-item">
                                            <a 
                                                href="#" 
                                                className={`prescription-nav ${paymentMethod === 'all' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePaymentMethodFilter('all');
                                                }}
                                            >
                                                All
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a 
                                                href="#" 
                                                className={`prescription-nav ${paymentMethod === 'Bank Transfer' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePaymentMethodFilter('Bank Transfer');
                                                }}
                                            >
                                                Bank Transfer
                                            </a>
                                        </li>
                                        <li className="prescription-item">
                                            <a 
                                                href="#" 
                                                className={`prescription-nav ${paymentMethod === 'UPI' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePaymentMethodFilter('UPI');
                                                }}
                                            >
                                                UPI
                                            </a>
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
                                            <th>Order Id </th>
                                            <th>Course</th>
                                            <th>Amount</th>
                                            <th>Payment Method</th>
                                            <th>Status</th>
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
                                                    <td>{(currentPage - 1) * 20 + index + 1}</td>
                                                    <td>#{statement.orderId || 'ORD' + String(statement._id).slice(-6)}</td>
                                                    <td>
                                                        <div className="admin-table-bx">
                                                            <div className="admin-table-sub-bx">
                                                                <img 
                                                                    src={statement.course?.courseImage || statement.course?.thumbnail || "/pic_01.jpg"} 
                                                                    alt={statement.course?.title || "Course"} 
                                                                />
                                                                <div className="admin-table-sub-details doctor-title">
                                                                    <h6>{statement.course?.title || 'Course Title'}</h6>
                                                                   <p>
  {statement.course?.level || 'Unknown'} - 
  {statement.course?.lessons?.length || 0} lessons
</p>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>${statement.amount || 0}</td>
                                                    <td>{statement.paymentMethod || 'N/A'}</td>
                                                    <td>
                                                        <span className={`${
                                                            statement.status === 'Paid' ? 'public-title' : 
                                                            statement.status === 'Pending' ? 'pending-title' : 
                                                            'public-title'
                                                        }`}>
                                                            {statement.status || 'Unknown'}
                                                        </span>
                                                    </td>
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
                                Showing {statements.length > 0 ? (currentPage - 1) * 20 + 1 : 0} to {Math.min(currentPage * 20, statements.length + (currentPage - 1) * 20)} of {totalPages * 20} results
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

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                <button 
                                                    className="page-link dz-page-link" 
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    {totalPages > 5 && (
                                        <li className="page-item disabled">
                                            <span className="page-link dz-page-link">...</span>
                                        </li>
                                    )}

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
        </>
    )
}

export default Statements
