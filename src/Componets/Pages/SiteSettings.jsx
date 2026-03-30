import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import { MdAddAPhoto } from "react-icons/md";
import { getSettings, updateSettings } from "../../services/siteSettingsService";

function SiteSettings() {
  const [settings, setSettings] = useState({
    logoUrl: "",
    footerContent: "",
    siteName: "",
    bannerTitle: "",
    bannerSubtitle: "",
    bannerDescription: ""
  });
  const [preview, setPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      if (response.success) {
        setSettings(response.data);
        // Construct full URL for preview
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5002';
        setPreview(response.data.logoUrl?.startsWith('http') ? response.data.logoUrl : `${baseUrl}${response.data.logoUrl}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('footerContent', settings.footerContent);
      formData.append('siteName', settings.siteName);
      formData.append('bannerTitle', settings.bannerTitle);
      formData.append('bannerSubtitle', settings.bannerSubtitle);
      formData.append('bannerDescription', settings.bannerDescription);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await updateSettings(formData);
      if (response.success) {
        toast.success("Settings updated successfully ✅");
        // Update local state with returned data
        setSettings(response.data);
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5002';
        setPreview(response.data.logoUrl?.startsWith('http') ? response.data.logoUrl : `${baseUrl}${response.data.logoUrl}`);
        setLogoFile(null);
        
        // Dispatch event for other components to update if needed
        window.dispatchEvent(new Event('siteSettingsUpdated'));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings ❌");
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
            <li className="breadcrumb-item active">Site Settings</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="profile-card mb-4">
            <h4 className="inner-title mb-4">Generate Logo & Content</h4>
            
            <form onSubmit={handleSave}>
              {/* Logo Section */}
              <div className="profile-wrapper profile-line mb-4">
                <label className="avatar-box" style={{ width: '120px', height: '120px', borderRadius: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  {preview ? (
                    <img src={preview} alt="Logo Preview" className="avatar-img" style={{ objectFit: 'contain', padding: '10px' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                        <MdAddAPhoto size={30} color="#ccc" />
                    </div>
                  )}
                  <span className="camera-icon">
                    <MdAddAPhoto />
                  </span>
                </label>

                <div className="profile-text ms-4">
                  <h3>Site Logo</h3>
                  <p>Upload your official logo (PNG/JPG/SVG)</p>
                  <small className="text-muted">Recommended size: 200x50 px</small>
                </div>
              </div>

              {/* Site Name */}
              <div className="mb-3">
                <label className="form-label fw-bold">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter site name"
                />
              </div>

              {/* Footer Content */}
              <div className="mb-4">
                <label className="form-label fw-bold">Footer Content</label>
                <textarea
                  name="footerContent"
                  value={settings.footerContent}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter short description for footer..."
                  rows="4"
                  style={{ height: 'auto' }}
                ></textarea>
                <small className="text-muted">This content appears next to the logo in the student website footer.</small>
              </div>

              <hr className="my-4" />
              <h4 className="inner-title mb-4">Homepage Banner Settings</h4>

              {/* Banner Title */}
              <div className="mb-3">
                <label className="form-label fw-bold">Banner Title (Top Small Text)</label>
                <input
                  type="text"
                  name="bannerTitle"
                  value={settings.bannerTitle}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="e.g. Learn AI the Smart Way"
                />
              </div>

              {/* Banner Subtitle */}
              <div className="mb-3">
                <label className="form-label fw-bold">Banner Subtitle (Main Heading)</label>
                <input
                  type="text"
                  name="bannerSubtitle"
                  value={settings.bannerSubtitle}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="e.g. Simple, practical AI concepts..."
                />
              </div>

              {/* Banner Description */}
              <div className="mb-4">
                <label className="form-label fw-bold">Banner Description (Paragraph)</label>
                <textarea
                  name="bannerDescription"
                  value={settings.bannerDescription}
                  onChange={handleChange}
                  className="form-control profile-control"
                  placeholder="Enter a detailed description for the homepage banner..."
                  rows="3"
                  style={{ height: 'auto' }}
                ></textarea>
              </div>

              <div className="text-end">
                <button 
                  type="submit" 
                  className="lg-thm-btn" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="profile-card">
            <h4 className="inner-title mb-3">Quick Preview</h4>
            <div className="p-3 border rounded bg-white">
                <div className="mb-3">
                    <small className="text-muted d-block mb-1">Header Preview:</small>
                    <div className="p-2 border rounded text-center" style={{ backgroundColor: '#f8f9fa' }}>
                        <img src={preview} alt="Logo" style={{ maxHeight: '30px' }} />
                    </div>
                </div>
                <div>
                    <small className="text-muted d-block mb-1">Footer Preview:</small>
                    <div className="p-3 border rounded bg-dark text-white">
                        <img src={preview} alt="Logo" style={{ maxHeight: '25px', marginBottom: '10px', filter: 'brightness(0) invert(1)' }} />
                        <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>{settings.footerContent}</p>
                    </div>
                </div>
                <div className="mt-3">
                    <small className="text-muted d-block mb-1">Banner Preview:</small>
                    <div className="p-3 border rounded bg-light" style={{ fontSize: '10px' }}>
                        <h6 style={{ fontSize: '9px', fontWeight: 'bold' }}>{settings.bannerTitle}</h6>
                        <h5 style={{ fontSize: '12px', fontWeight: 'bold', margin: '5px 0' }}>{settings.bannerSubtitle}</h5>
                        <p className="mb-0 text-muted">{settings.bannerDescription}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteSettings;
