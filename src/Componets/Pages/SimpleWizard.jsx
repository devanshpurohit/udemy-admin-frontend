import { faArrowLeft, faArrowRight, faRocket, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { createCourse } from "../../services/courseService";

function SimpleWizard() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Simple form data - all optional
    const [formData, setFormData] = useState({
        title: { en: '', kn: '' },
        description: { en: '', kn: '' },
        category: 'development',
        level: 'beginner',
        price: 99.99,
        duration: 3,
        language: 'English',
        courseImage: '',
        previewVideo: '',
        previewVideo_kn: '',
        lessons: [],
        lessons_kn: [],
        resources: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle nested fields for title and description
        if (name.startsWith('title_') || name.startsWith('description_')) {
            const [field, lang] = name.split('_');
            setFormData({
                ...formData,
                [field]: {
                    ...formData[field],
                    [lang]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    courseImage: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    previewVideo: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const addLesson = () => {
        const newLesson = {
            title: `Lesson ${formData.lessons.length + 1}`,
            description: '',
            videoUrl: '',
            duration: 30,
            order: formData.lessons.length + 1
        };
        setFormData({
            ...formData,
            lessons: [...formData.lessons, newLesson]
        });
    };

    const updateLesson = (index, field, value) => {
        const updatedLessons = [...formData.lessons];
        updatedLessons[index][field] = value;
        setFormData({
            ...formData,
            lessons: updatedLessons
        });
    };

    const removeLesson = (index) => {
        const updatedLessons = formData.lessons.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            lessons: updatedLessons
        });
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);
            setError('');
            setSuccess('');
            
            // Create course with whatever data is filled
            const courseData = {
                ...formData,
                status: 'published',
                instructor: 'current_user', // This should come from auth
                createdAt: new Date().toISOString()
            };
            
            const response = await createCourse(courseData);
            if (response.success) {
                setSuccess('Course published successfully!');
                setTimeout(() => {
                    navigate('/course');
                }, 2000);
            } else {
                setError(response.message || 'Failed to publish course');
            }
        } catch (err) {
            setError('Failed to publish course');
        } finally {
            setPublishing(false);
        }
    };

    const [contentLang, setContentLang] = useState('en'); // 'en' or 'kn'

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="card">
                        <div className="card-header">
                            <h5>Step 1: Basic Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">🇬🇧 English Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title_en"
                                            value={formData.title.en}
                                            onChange={handleInputChange}
                                            placeholder="Enter course title in English"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">🇬🇧 English Description</label>
                                        <textarea
                                            className="form-control"
                                            name="description_en"
                                            rows="4"
                                            value={formData.description.en}
                                            onChange={handleInputChange}
                                            placeholder="Enter course description in English"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">🇮🇳 Kannada Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title_kn"
                                            value={formData.title.kn}
                                            onChange={handleInputChange}
                                            placeholder="ಕನ್ನಡದಲ್ಲಿ ಕೋರ್ಸ್ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">🇮🇳 Kannada Description</label>
                                        <textarea
                                            className="form-control"
                                            name="description_kn"
                                            rows="4"
                                            value={formData.description.kn}
                                            onChange={handleInputChange}
                                            placeholder="ಕನ್ನಡದಲ್ಲಿ ಕೋರ್ಸ್ ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        >
                                            <option value="development">Development</option>
                                            <option value="design">Design</option>
                                            <option value="business">Business</option>
                                            <option value="marketing">Marketing</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Level</label>
                                        <select
                                            className="form-select"
                                            name="level"
                                            value={formData.level}
                                            onChange={handleInputChange}
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Price ($)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="99.99"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Duration (months)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            placeholder="3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold text-primary">Step 2: Course Content</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="nav nav-pills mb-4 bg-light p-1 rounded-3">
                                <button 
                                    className={`nav-link flex-fill rounded-2 py-2 fw-semibold ${contentLang === 'en' ? 'active shadow-sm' : 'text-muted'}`}
                                    onClick={() => setContentLang('en')}
                                >
                                    🇬🇧 English Content
                                </button>
                                <button 
                                    className={`nav-link flex-fill rounded-2 py-2 fw-semibold ${contentLang === 'kn' ? 'active shadow-sm' : 'text-muted'}`}
                                    onClick={() => setContentLang('kn')}
                                >
                                    🇮🇳 Kannada Content
                                </button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="mb-0 fw-bold">
                                    {contentLang === 'en' ? 'English Lessons' : 'Kannada Lessons'} 
                                    <span className="badge bg-primary-subtle text-primary ms-2 rounded-pill">
                                        {contentLang === 'en' ? formData.lessons.length : formData.lessons_kn.length}
                                    </span>
                                </h6>
                                <button 
                                    className="btn btn-primary d-flex align-items-center gap-2 px-3" 
                                    onClick={() => {
                                        const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                        const currentLessons = formData[langKey];
                                        const newLesson = {
                                            title: `Lesson ${currentLessons.length + 1}`,
                                            description: '',
                                            videoUrl: '',
                                            duration: 30,
                                            order: currentLessons.length + 1
                                        };
                                        setFormData({
                                            ...formData,
                                            [langKey]: [...currentLessons, newLesson]
                                        });
                                    }}
                                >
                                    <FontAwesomeIcon icon={faRocket} /> Add Lesson
                                </button>
                            </div>
                            
                            {(contentLang === 'en' ? formData.lessons : formData.lessons_kn).length === 0 ? (
                                <div className="text-center py-5 bg-light rounded-4 border-2 border-dashed">
                                    <div className="mb-3 opacity-25">
                                        <FontAwesomeIcon icon={faRocket} size="3x" />
                                    </div>
                                    <p className="text-muted fw-medium mb-0">No lessons added for this language. Click "Add Lesson" to start.</p>
                                </div>
                            ) : (
                                (contentLang === 'en' ? formData.lessons : formData.lessons_kn).map((lesson, index) => (
                                    <div key={index} className="card mb-3 border-0 shadow-sm transition-hover">
                                        <div className="card-body p-4">
                                            <div className="row g-3 align-items-end mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small text-muted text-uppercase fw-bold">Lesson Title</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-2"
                                                        placeholder="Enter lesson title"
                                                        value={lesson.title}
                                                        onChange={(e) => {
                                                            const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                                            const updated = [...formData[langKey]];
                                                            updated[index].title = e.target.value;
                                                            setFormData({ ...formData, [langKey]: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label small text-muted text-uppercase fw-bold">Duration (min)</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="number"
                                                            className="form-control border-2"
                                                            placeholder="30"
                                                            value={lesson.duration}
                                                            onChange={(e) => {
                                                                const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                                                const updated = [...formData[langKey]];
                                                                updated[index].duration = parseInt(e.target.value) || 0;
                                                                setFormData({ ...formData, [langKey]: updated });
                                                            }}
                                                        />
                                                        <span className="input-group-text border-2 bg-transparent text-muted small">min</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <button
                                                        className="btn btn-outline-danger w-100 py-2"
                                                        onClick={() => {
                                                            const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                                            const updated = formData[langKey].filter((_, i) => i !== index);
                                                            setFormData({ ...formData, [langKey]: updated });
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label small text-muted text-uppercase fw-bold">YouTube / Video URL</label>
                                                    <input
                                                        type="text"
                                                        className="form-control border-2"
                                                        placeholder="Paste video URL"
                                                        value={lesson.videoUrl || ''}
                                                        onChange={(e) => {
                                                            const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                                            const updated = [...formData[langKey]];
                                                            updated[index].videoUrl = e.target.value;
                                                            setFormData({ ...formData, [langKey]: updated });
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label small text-muted text-uppercase fw-bold">Description</label>
                                                    <textarea
                                                        className="form-control border-2"
                                                        placeholder="Briefly describe what students will learn"
                                                        value={lesson.description}
                                                        onChange={(e) => {
                                                            const langKey = contentLang === 'en' ? 'lessons' : 'lessons_kn';
                                                            const updated = [...formData[langKey]];
                                                            updated[index].description = e.target.value;
                                                            setFormData({ ...formData, [langKey]: updated });
                                                        }}
                                                        rows="2"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-bold text-primary">Step 3: Media & Assets</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-4">
                                <div className="col-md-12">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted text-uppercase fw-bold">Course Image (Same for both)</label>
                                        <input
                                            type="file"
                                            className="form-control border-2"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {formData.courseImage && (
                                            <div className="mt-3 p-2 bg-light rounded-3 d-inline-block">
                                                <img
                                                    src={formData.courseImage}
                                                    alt="Course preview"
                                                    className="rounded-2 shadow-sm"
                                                    style={{ maxWidth: '240px', maxHeight: '160px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted text-uppercase fw-bold">🇬🇧 English Preview Video</label>
                                        <input
                                            type="file"
                                            className="form-control border-2"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setFormData({ ...formData, previewVideo: reader.result });
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {formData.previewVideo && (
                                            <video controls className="mt-3 rounded-3 shadow-sm" style={{ width: '100%', maxHeight: '180px' }}>
                                                <source src={formData.previewVideo} />
                                            </video>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted text-uppercase fw-bold">🇮🇳 Kannada Preview Video</label>
                                        <input
                                            type="file"
                                            className="form-control border-2"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setFormData({ ...formData, previewVideo_kn: reader.result });
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {formData.previewVideo_kn && (
                                            <video controls className="mt-3 rounded-3 shadow-sm" style={{ width: '100%', maxHeight: '180px' }}>
                                                <source src={formData.previewVideo_kn} />
                                            </video>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="card">
                        <div className="card-header">
                            <h5>Step 4: Review & Publish</h5>
                        </div>
                        <div className="card-body">
                            <h6>Course Summary:</h6>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <p><strong>🇬🇧 Title (EN):</strong> {formData.title.en || 'Untitled'}</p>
                                    <p><strong>🇮🇳 Title (KN):</strong> {formData.title.kn || 'Not provided'}</p>
                                    <p><strong>Category:</strong> {formData.category}</p>
                                    <p><strong>Level:</strong> {formData.level}</p>
                                    <p><strong>Price:</strong> ${formData.price}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Duration:</strong> {formData.duration} months</p>
                                    <p><strong>🇬🇧 English Lessons:</strong> {formData.lessons.length}</p>
                                    <p><strong>🇮🇳 Kannada Lessons:</strong> {formData.lessons_kn.length}</p>
                                    <p><strong>Image:</strong> {formData.courseImage ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                                    <p><strong>🇬🇧 English Video:</strong> {formData.previewVideo ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                                    <p><strong>🇮🇳 Kannada Video:</strong> {formData.previewVideo_kn ? '✅ Uploaded' : '❌ Not uploaded'}</p>
                                </div>
                            </div>
                            
                            <div className="row">
                                <div className="col-md-6">
                                    {formData.description.en && (
                                        <div className="mb-3 p-3 bg-light rounded-3">
                                            <p className="mb-1 fw-bold">🇬🇧 Description (EN):</p>
                                            <p className="text-muted mb-0">{formData.description.en}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    {formData.description.kn && (
                                        <div className="mb-3 p-3 bg-light rounded-3">
                                            <p className="mb-1 fw-bold">🇮🇳 Description (KN):</p>
                                            <p className="text-muted mb-0">{formData.description.kn}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    {formData.lessons.length > 0 && (
                                        <div className="mb-3">
                                            <p className="fw-bold mb-1">🇬🇧 English Lessons:</p>
                                            <ul className="small text-muted ps-3">
                                                {formData.lessons.map((lesson, index) => (
                                                    <li key={index}>{lesson.title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    {formData.lessons_kn.length > 0 && (
                                        <div className="mb-3">
                                            <p className="fw-bold mb-1">🇮🇳 Kannada Lessons:</p>
                                            <ul className="small text-muted ps-3">
                                                {formData.lessons_kn.map((lesson, index) => (
                                                    <li key={index}>{lesson.title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="alert alert-info">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                <strong>Ready to publish!</strong> Your course will be published with the information above.
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="main-content flex-grow-1 p-3 overflow-auto">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <h2 className="mb-4">Simple Course Creator</h2>
                        
                        {/* Step Indicators */}
                        <div className="d-flex justify-content-between mb-4">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`text-center ${currentStep >= step ? 'text-primary' : 'text-muted'}`}
                                >
                                    <div
                                        className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                                            currentStep >= step ? 'bg-primary text-white' : 'bg-light'
                                        }`}
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        {step}
                                    </div>
                                    <small>
                                        {step === 1 && 'Basic Info'}
                                        {step === 2 && 'Content'}
                                        {step === 3 && 'Media'}
                                        {step === 4 && 'Publish'}
                                    </small>
                                </div>
                            ))}
                        </div>

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

                        {renderStep()}

                        {/* Navigation Buttons */}
                        <div className="d-flex justify-content-between mt-4">
                            <button
                                className="btn btn-secondary"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>

                            <div>
                                {currentStep === 4 ? (
                                    <button
                                        className="btn btn-success"
                                        onClick={handlePublish}
                                        disabled={publishing}
                                    >
                                        {publishing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faRocket} /> Publish Course
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNext}
                                    >
                                        Next <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimpleWizard;
