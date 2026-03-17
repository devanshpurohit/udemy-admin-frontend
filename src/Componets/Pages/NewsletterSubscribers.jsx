import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import newsletterService from "../../services/newsletterService";

function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await newsletterService.getSubscribers();
      if (response.success) {
        setSubscribers(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
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
            <li className="breadcrumb-item active">Newsletter Subscribers</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="profile-card mb-4 mt-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="inner-title mb-0">Newsletter Subscribers</h4>
              <button 
                className="lg-thm-btn" 
                onClick={fetchSubscribers}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh List"}
              </button>
            </div>

            <div className="table-responsive mt-3">
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Subscribed On</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        <span className="ms-2">Loading subscribers...</span>
                      </td>
                    </tr>
                  ) : subscribers.length > 0 ? (
                    subscribers.map((sub, index) => (
                      <tr key={sub._id}>
                        <td>{index + 1}</td>
                        <td>{sub.email}</td>
                        <td>{new Date(sub.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No subscribers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsletterSubscribers;
