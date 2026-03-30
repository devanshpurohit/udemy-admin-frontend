import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { getLegalContent, updateLegalContent } from "../../services/legalContentService";

function LegalContent() {
  const [content, setContent] = useState({
    privacyPolicy: "",
    termsConditions: "",
    cookiesPolicy: "",
    licenseAgreement: ""
  });
  const [loading, setLoading] = useState(false);

  // Load content on mount
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await getLegalContent();
      if (response.success) {
        setContent(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load legal content");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setContent({
      ...content,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await updateLegalContent(content);
      if (response.success) {
        toast.success("Legal content updated successfully ✅");
        setContent(response.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update legal content ❌");
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
            <li className="breadcrumb-item active">Legal Content Settings</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="profile-card mb-4">
            <h4 className="inner-title mb-4">Manage Legal Pages Content</h4>
            
            <form onSubmit={handleSave}>
              {/* Privacy Policy */}
              <div className="mb-4">
                <label className="form-label fw-bold">Privacy Policy</label>
                <textarea
                  name="privacyPolicy"
                  value={content.privacyPolicy}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter Privacy Policy content..."
                  rows="8"
                  style={{ height: 'auto' }}
                ></textarea>
              </div>

              <hr className="my-4" />

              {/* Terms & Conditions */}
              <div className="mb-4">
                <label className="form-label fw-bold">Terms & Conditions</label>
                <textarea
                  name="termsConditions"
                  value={content.termsConditions}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter Terms & Conditions content..."
                  rows="8"
                  style={{ height: 'auto' }}
                ></textarea>
              </div>

              <hr className="my-4" />

              {/* Cookies Policy */}
              <div className="mb-4">
                <label className="form-label fw-bold">Cookies Policy</label>
                <textarea
                  name="cookiesPolicy"
                  value={content.cookiesPolicy}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter Cookies Policy content..."
                  rows="6"
                  style={{ height: 'auto' }}
                ></textarea>
              </div>

              <hr className="my-4" />

              {/* License Agreement */}
              <div className="mb-4">
                <label className="form-label fw-bold">License Agreement</label>
                <textarea
                  name="licenseAgreement"
                  value={content.licenseAgreement}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter License Agreement content..."
                  rows="6"
                  style={{ height: 'auto' }}
                ></textarea>
              </div>

              <div className="text-end mt-4">
                <button 
                  type="submit" 
                  className="lg-thm-btn" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Legal Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalContent;
