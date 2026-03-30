import { faClose, faArrowLeft, faArrowRight, faUpload, faImage, faVideo, faFile, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { saveCourseMedia, getCourseDraft } from "../../services/courseService";

const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api').replace('/api', '');
    let cleanPath = url.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${baseUrl}${cleanPath}`;
};

function CourseMedia() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Media states
    const [courseImagePreview, setCourseImagePreview] = useState('');
    const [previewVideoPreview, setPreviewVideoPreview] = useState('');
    const [previewVideoFile, setPreviewVideoFile] = useState(null);
    const [videoUploading, setVideoUploading] = useState(false);
    const [courseResources, setCourseResources] = useState([]);

    useEffect(() => {
        if (courseId) {
            fetchCourseMedia();
        }
    }, [courseId]);

    const fetchCourseMedia = async () => {
        try {
            setFetching(true);
            const response = await getCourseDraft(courseId);
            if (response.success && response.data) {
                setCourseImagePreview(response.data.courseImage || '');
                setPreviewVideoPreview(response.data.previewVideo || '');
                setCourseResources(response.data.resources || []);
            }
        } catch (err) {
            console.error('Fetch course media error:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleCourseImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCourseImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePreviewVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewVideoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResourceUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newResource = {
                        name: file.name,
                        url: reader.result,
                        type: file.type.startsWith('image/') ? 'image' : 
                              file.type.includes('pdf') ? 'pdf' :
                              file.type.startsWith('video/') ? 'video' : 'other',
                        size: file.size,
                        uploadedAt: new Date().toISOString()
                    };
                    setCourseResources(prev => [...prev, newResource]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeResource = (index) => {
        setCourseResources(courseResources.filter((_, i) => i !== index));
    };

    const handleNext = async () => {
        try {
            setLoading(true);
            setError('');

            const mediaData = {
                courseImage: courseImagePreview,
                previewVideo: previewVideoPreview,
                resources: courseResources
            };

            const response = await saveCourseMedia(courseId, mediaData);

            if (response.success) {
                setSuccess('Course media saved successfully!');
                navigate(`/course-pricing/${courseId}`);
            } else {
                setError(response.message || 'Failed to save course media');
            }
        } catch (err) {
            console.error('Save course media error:', err);
            setError('Failed to save course media');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (courseId) {
            navigate(`/course-content/${courseId}`);
        } else {
            navigate('/course-content');
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
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Course Media
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fz-24">Course Media</h3>
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

                            <button className="account-step-crd account-step-one active-step">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">3</span>
                                </div>
                                <h6>Media & Assets</h6>
                            </button>

                            <button onClick={() => courseId && courseId !== 'undefined' && courseId !== 'null' ? navigate(`/course-pricing/${courseId}`) : null} className="account-step-crd account-step-one">
                                <div className="account-step-bx account-unstep-card">
                                    <span className="account-step-icon">4</span>
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

                        <h3 className="innr-title mb-4">Course Media & Assets</h3>

                        {/* Course Image Upload */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">Course Image</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Course Thumbnail Image (optional)</label>
                                            <div className="image-upload-container">
                                                <input
                                                    type="file"
                                                    id="courseImage"
                                                    accept="image/*"
                                                    onChange={handleCourseImageChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor="courseImage" className="image-upload-label">
                                                    {courseImagePreview ? (
                                                        <img
                                                            src={getImageUrl(courseImagePreview)}
                                                            alt="Course preview"
                                                            className="image-preview"
                                                            style={{
                                                                width: '100%',
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="upload-placeholder">
                                                            <FontAwesomeIcon icon={faImage} size="3x" className="mb-3" />
                                                            <p>Click to upload course image</p>
                                                        </div>
                                                    )}
                                                </label>
                                                {courseImagePreview && (
                                                    <div className="d-flex gap-2 mt-3">
                                                        <button
                                                            type="button"
                                                            className="lg-white-btn"
                                                            onClick={() => {
                                                                setCourseImagePreview('');
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Preview Video (optional)</label>
                                            <div className="video-upload-container">
                                                <input
                                                    type="file"
                                                    id="previewVideo"
                                                    accept="video/*"
                                                    onChange={handlePreviewVideoChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor="previewVideo" className="video-upload-label">
                                                    {previewVideoPreview ? (
                                                        <video
                                                            controls
                                                            style={{
                                                                width: '100%',
                                                                height: '200px',
                                                                borderRadius: '8px'
                                                            }}
                                                        >
                                                            <source src={getImageUrl(previewVideoPreview)} />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (
                                                        <div className="upload-placeholder">
                                                            <FontAwesomeIcon icon={faVideo} size="3x" className="mb-3" />
                                                            <p>Click to upload preview video</p>
                                                        </div>
                                                    )}
                                                </label>
                                                {previewVideoPreview && (
                                                    <div className="d-flex gap-2 mt-3">
                                                        <button
                                                            type="button"
                                                            className="lg-white-btn"
                                                            onClick={() => {
                                                                setPreviewVideoPreview('');
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Upload a preview video that students can watch before purchasing the course
                                </small>
                            </div>
                        </div>

                        {/* Course Resources */}
                        <div className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Course Resources (optional)</h5>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => document.getElementById('resourceFileInput').click()}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add Resources
                                </button>
                            </div>
                            <div className="card-body">
                                <input
                                    type="file"
                                    id="resourceFileInput"
                                    style={{ display: 'none' }}
                                    onChange={handleResourceUpload}
                                    multiple
                                />
                                
                                {courseResources.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faFile} size="3x" className="text-muted mb-3" />
                                        <h5>No resources added yet</h5>
                                        <p className="text-muted">Add PDFs, videos, images, or other files for students</p>
                                        <button
                                            className="lg-thm-btn"
                                            onClick={() => document.getElementById('resourceFileInput').click()}
                                        >
                                            <FontAwesomeIcon icon={faPlus} /> Add Resources
                                        </button>
                                    </div>
                                ) : (
                                    <div className="resources-list">
                                        {courseResources.map((resource, index) => (
                                            <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                <div className="d-flex align-items-center">
                                                    <FontAwesomeIcon
                                                        icon={
                                                            resource.type === 'image' ? faImage :
                                                            resource.type === 'video' ? faVideo :
                                                            faFile
                                                        }
                                                        className="me-2"
                                                    />
                                                    <div>
                                                        <div className="fw-bold">{resource.name}</div>
                                                        <small className="text-muted">
                                                            {resource.type} • {(resource.size / 1024 / 1024).toFixed(1)} MB
                                                        </small>
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeResource(index)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
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
                                >
                                    Next Step <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CourseMedia;