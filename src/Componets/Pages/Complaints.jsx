import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { getComplaints, deleteComplaint } from "../../services/complaintService";
import { FaTrash, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await getComplaints();
      if (response.success) {
        setComplaints(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        const response = await deleteComplaint(id);
        if (response.success) {
          toast.success("Complaint deleted successfully");
          setComplaints(complaints.filter((c) => c._id !== id));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete complaint");
      }
    }
  };

  return (
    <div className="main-content flex-grow-1 p-3 overflow-auto">
      {/* Breadcrumb */}
      <div className="row mb-3">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb custom-breadcrumb mb-0">
            <li className="breadcrumb-item">
              <NavLink to="/" className="breadcrumb-link text-black">
                Dashboard
              </NavLink>
            </li>
            <li className="breadcrumb-item active">Contact Us & Complaints</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="profile-card mb-4">
            <h4 className="inner-title mb-4">User Complaints & Messages</h4>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No complaints or messages found.</p>
              </div>
            ) : (
              <div className="row">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="col-md-6 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title text-primary mb-0">
                            <FaUser className="me-2" />
                            {complaint.firstName} {complaint.lastName}
                          </h5>
                          <button
                            onClick={() => handleDelete(complaint._id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="mb-2">
                          <small className="text-muted">
                            <FaEnvelope className="me-2" />
                            {complaint.email}
                          </small>
                        </div>
                        
                        {complaint.contactNumber && (
                          <div className="mb-2">
                            <small className="text-muted">
                              <FaPhone className="me-2" />
                              {complaint.contactNumber}
                            </small>
                          </div>
                        )}

                        <div className="mb-3">
                          <small className="text-muted">
                            <FaCalendarAlt className="me-2" />
                            {new Date(complaint.createdAt).toLocaleString()}
                          </small>
                        </div>

                        <hr />

                        <div className="complaint-msg-box">
                          <p className="card-text text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                             {complaint.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Complaints;
