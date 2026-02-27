import { faClose, faArrowLeft, faArrowRight, faDollarSign, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function CoursePricing() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Simple pricing data
    const [formData, setFormData] = useState({
        price: 99.99,
        discountedPrice: 0,
        currency: 'USD',
        discountType: 'percentage',
        discountValue: 0,
        hasDiscount: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'hasDiscount') {
            setFormData({
                ...formData,
                [name]: checked,
                discountedPrice: checked ? calculateDiscountedPrice(formData.price, formData.discountType, formData.discountValue) : 0
            });
        } else if (name === 'discountType') {
            setFormData({
                ...formData,
                [name]: value,
                discountedPrice: calculateDiscountedPrice(formData.price, value, formData.discountValue)
            });
        } else if (name === 'discountValue') {
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0,
                discountedPrice: calculateDiscountedPrice(formData.price, formData.discountType, parseFloat(value) || 0)
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'number' ? parseFloat(value) || 0 : value
            });
        }
    };

    const calculateDiscountedPrice = (price, discountType, discountValue) => {
        if (discountType === 'percentage') {
            return price * (1 - discountValue / 100);
        } else {
            return Math.max(0, price - discountValue);
        }
    };

    const handleNext = () => {
        // Simple navigation - just go to next step
        if (courseId) {
            navigate(`/course-publish/${courseId}`);
        } else {
            navigate('/course-publish');
        }
    };

    const handleBack = () => {
        if (courseId) {
            navigate(`/course-media/${courseId}`);
        } else {
            navigate('/course-media');
        }
    };

    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="row mb-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                        <div>
                            <div className="admin-breadcrumb">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb custom-breadcrumb mb-0">
                                        <li className="breadcrumb-item">
                                            <NavLink to="/" className="breadcrumb-link">
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <NavLink to={`/new-course/${courseId}`} className="breadcrumb-link">
                                                New Courses
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <NavLink to={`/course-content/${courseId}`} className="breadcrumb-link">
                                                Course Content
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item">
                                            <NavLink to={`/course-media/${courseId}`} className="breadcrumb-link">
                                                Course Media
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Course Pricing
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fz-24">Course Pricing</h3>
                        </div>

                        <div className="">
                            <button className="lg-white-btn" onClick={handleBack}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center mb-3">
                    <div className="col-lg-10">
                        <div className="account-step-main-bx">
                            <button onClick={handleBack} className="account-step-crd account-step-one">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">1</span>
                                </div>
                                <h6>Basic Information</h6>
                            </button>

                            <button onClick={() => navigate(`/course-content/${courseId}`)} className="account-step-crd account-step-one">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">2</span>
                                </div>
                                <h6>Course Content</h6>
                            </button>

                            <button onClick={() => navigate(`/course-media/${courseId}`)} className="account-step-crd account-step-one">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">3</span>
                                </div>
                                <h6>Media & Assets</h6>
                            </button>

                            <button className="account-step-crd account-step-one active-step">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">4</span>
                                </div>
                                <h6>Pricing</h6>
                            </button>

                            <button onClick={() => courseId && courseId !== 'undefined' && courseId !== 'null' ? navigate(`/course-publish/${courseId}`) : null} className="account-step-crd">
                                <div className="account-step-bx account-unstep-card">
                                    <span className="account-step-icon">5</span>
                                </div>
                                <h6>Publish</h6>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success">
                                {success}
                            </div>
                        )}

                        <h3 className="innr-title mb-4">Course Pricing</h3>

                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Set Course Price</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Course Price</label>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon={faDollarSign} />
                                                </span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <small className="text-muted">
                                                Set the base price for your course
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Currency</label>
                                            <select
                                                className="form-select"
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleChange}
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP"> (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="hasDiscount"
                                            id="hasDiscount"
                                            checked={formData.hasDiscount}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="hasDiscount">
                                            Add discount to course
                                        </label>
                                    </div>
                                </div>

                                {formData.hasDiscount && (
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Discount Type</label>
                                                <select
                                                    className="form-select"
                                                    name="discountType"
                                                    value={formData.discountType}
                                                    onChange={handleChange}
                                                >
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed">Fixed Amount ($)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Discount Value ({formData.discountType === 'percentage' ? '%' : '$'})
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="discountValue"
                                                    value={formData.discountValue}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    min="0"
                                                    max={formData.discountType === 'percentage' ? 100 : formData.price}
                                                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.hasDiscount && (
                                    <div className="alert alert-info">
                                        <h6>Price Summary:</h6>
                                        <div className="d-flex justify-content-between">
                                            <span>Original Price:</span>
                                            <span className="fw-bold">${formData.price.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span>Discount:</span>
                                            <span>
                                                {formData.discountType === 'percentage' 
                                                    ? `${formData.discountValue}%` 
                                                    : `$${formData.discountValue.toFixed(2)}`
                                                }
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold">
                                            <span>Final Price:</span>
                                            <span className="text-success">${formData.discountedPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <button
                                        type="button"
                                        className="lg-white-btn"
                                        onClick={handleBack}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                                    </button>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="lg-thm-btn"
                                            onClick={handleNext}
                                            disabled={loading || formData.price <= 0}
                                        >
                                            {loading ? 'Saving...' : 'Next Step'} <FontAwesomeIcon icon={faArrowRight} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CoursePricing;