import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaClock, FaUserLock } from 'react-icons/fa';
import api from '../../services/api';

const UnblockRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/unblock-requests');
            if (response.success) {
                setRequests(response.data?.requests || []);
            }
        } catch (error) {
            console.error('Error fetching unblock requests:', error);
            toast.error('Failed to load unblock requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.put(`/admin/unblock-requests/${id}`, { status });
            if (response.success) {
                toast.success(`Request ${status} successfully`);
                fetchRequests();
            }
        } catch (error) {
            console.error(`Error updating request to ${status}:`, error);
            toast.error(`Failed to ${status} request`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge bg-success px-3 py-2"><FaCheck className="me-1" /> Approved & Unblocked</span>;
            case 'rejected':
                return <span className="badge bg-danger px-3 py-2"><FaTimes className="me-1" /> Rejected</span>;
            default:
                return <span className="badge bg-warning text-dark px-3 py-2"><FaClock className="me-1" /> Pending</span>;
        }
    };

    return (
        <div className="main-content flex-grow-1 p-4 overflow-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                    <FaUserLock className="me-2 mb-1" />
                    Unblock Requests
                </h2>
                <button className="btn btn-outline-primary" onClick={fetchRequests} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh List'}
                </button>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                    <h5 className="mb-0 text-muted">User Account Unblock Requests</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaUserLock size={48} className="mb-3 text-light" />
                            <h5>No unblock requests found</h5>
                            <p>No users are currently requesting to be unblocked.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>User Info</th>
                                        <th>Reason for Unblock</th>
                                        <th>Requested At</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        <img 
                                                            src={req.user?.profile?.profileImage && !req.user.profile.profileImage.includes('boy.png') ? (req.user.profile.profileImage.startsWith('http') ? req.user.profile.profileImage : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5002'}${req.user.profile.profileImage.startsWith('/') ? '' : '/'}${req.user.profile.profileImage}`) : '/boy.png'} 
                                                            alt="User"
                                                            className="rounded-circle"
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = '/boy.png' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">
                                                            {req.user?.profile?.firstName} {req.user?.profile?.lastName}
                                                            {!req.user?.profile?.firstName && req.user?.username}
                                                        </h6>
                                                        <small className="text-muted">{req.user?.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '300px', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                                                    <span className="fst-italic text-secondary">
                                                        "{req.reason}"
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {new Date(req.createdAt).toLocaleDateString()} <br />
                                                <small className="text-muted">{new Date(req.createdAt).toLocaleTimeString()}</small>
                                            </td>
                                            <td>
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="text-end">
                                                {req.status === 'pending' ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-success d-flex align-items-center"
                                                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                                                        >
                                                            <FaCheck className="me-1" /> Unblock
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                                                        >
                                                            <FaTimes className="me-1" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">No actions needed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnblockRequests;
