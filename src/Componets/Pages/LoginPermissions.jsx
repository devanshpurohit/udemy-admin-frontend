import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMobileAlt, FaLaptop, FaDesktop, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import api from '../../services/api';

const LoginPermissions = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/device-requests');
            // api interceptor already returns response.data
            if (response.success) {
                setRequests(response.data?.requests || []);
            }
        } catch (error) {
            console.error('Error fetching device requests:', error);
            toast.error('Failed to load login permissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.put(`/admin/device-requests/${id}`, { status });
            if (response.success) {
                toast.success(`Request ${status} successfully`);
                fetchRequests();
            }
        } catch (error) {
            console.error(`Error updating request to ${status}:`, error);
            toast.error(`Failed to ${status} request`);
        }
    };

    const getDeviceIcon = (deviceInfo) => {
        const info = deviceInfo.toLowerCase();
        if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) {
            return <FaMobileAlt className="text-secondary" size={24} />;
        }
        if (info.includes('mac') || info.includes('laptop')) {
            return <FaLaptop className="text-secondary" size={24} />;
        }
        return <FaDesktop className="text-secondary" size={24} />;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="badge bg-success px-3 py-2"><FaCheck className="me-1" /> Approved</span>;
            case 'rejected':
                return <span className="badge bg-danger px-3 py-2"><FaTimes className="me-1" /> Rejected</span>;
            default:
                return <span className="badge bg-warning text-dark px-3 py-2"><FaClock className="me-1" /> Pending</span>;
        }
    };

    return (
        <div className="main-content flex-grow-1 p-4 overflow-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>Login Permissions</h2>
                <button className="btn btn-outline-primary" onClick={fetchRequests} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh List'}
                </button>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                    <h5 className="mb-0 text-muted">Device Login Requests</h5>
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
                            <h5>No login requests found</h5>
                            <p>All users are using their standard devices.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>User</th>
                                        <th>Device Info</th>
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
                                                            src={req.user?.profile?.profileImage || '/boy.png'} 
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
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2">
                                                        {getDeviceIcon(req.deviceInfo)}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 mx-2">{req.deviceInfo}</h6>
                                                        <small className="text-muted mx-2">ID: {req.deviceId.substring(0, 8)}...</small>
                                                    </div>
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
                                                {req.status === 'pending' && (
                                                    <div className="btn-group">
                                                        <button 
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                                                        >
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-danger ms-1"
                                                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                                                        >
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status !== 'pending' && (
                                                    <span className="text-muted small">Processed</span>
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

export default LoginPermissions;
