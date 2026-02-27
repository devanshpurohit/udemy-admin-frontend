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
        title: '',
        description: '',
        category: 'development',
        level: 'beginner',
        price: 99.99,
        duration: 3,
        language: 'English',
        courseImage: '',
        previewVideo: '',
        lessons: [],
        resources: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="card">
                        <div className="card-header">
                            <h5>Step 1: Basic Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Course Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter course title (optional)"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter course description (optional)"
                                    rows="3"
                                ></textarea>
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
                    <div className="card">
                        <div className="card-header">
                            <h5>Step 2: Course Content</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6>Lessons ({formData.lessons.length})</h6>
                                <button className="btn btn-primary btn-sm" onClick={addLesson}>
                                    Add Lesson
                                </button>
                            </div>
                            
                            {formData.lessons.length === 0 ? (
                                <div className="text-center py-5">
                                    <p className="text-muted">No lessons added. Click "Add Lesson" to add content.</p>
                                </div>
                            ) : (
                                formData.lessons.map((lesson, index) => (
                                    <div key={index} className="card mb-3">
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        placeholder="Lesson title"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <input
                                                        type="number"
                                                        className="form-control mb-2"
                                                        placeholder="Duration (min)"
                                                        value={lesson.duration}
                                                        onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => removeLesson(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea
                                                className="form-control"
                                                placeholder="Lesson description (optional)"
                                                value={lesson.description}
                                                onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                                rows="2"
                                            ></textarea>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="card">
                        <div className="card-header">
                            <h5>Step 3: Media & Assets</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Course Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {formData.courseImage && (
                                            <img
                                                src={formData.courseImage}
                                                alt="Course preview"
                                                className="mt-2"
                                                style={{ maxWidth: '200px', maxHeight: '150px' }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Preview Video</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                        />
                                        {formData.previewVideo && (
                                            <video
                                                controls
                                                className="mt-2"
                                                style={{ maxWidth: '200px', maxHeight: '150px' }}
                                            >
                                                <source src={formData.previewVideo} />
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
                                    <p><strong>Title:</strong> {formData.title || 'Untitled Course'}</p>
                                    <p><strong>Category:</strong> {formData.category}</p>
                                    <p><strong>Level:</strong> {formData.level}</p>
                                    <p><strong>Price:</strong> ${formData.price}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Duration:</strong> {formData.duration} months</p>
                                    <p><strong>Lessons:</strong> {formData.lessons.length}</p>
                                    <p><strong>Image:</strong> {formData.courseImage ? 'Uploaded' : 'Not uploaded'}</p>
                                    <p><strong>Video:</strong> {formData.previewVideo ? 'Uploaded' : 'Not uploaded'}</p>
                                </div>
                            </div>
                            
                            {formData.description && (
                                <div className="mb-3">
                                    <p><strong>Description:</strong></p>
                                    <p className="text-muted">{formData.description}</p>
                                </div>
                            )}
                            
                            {formData.lessons.length > 0 && (
                                <div className="mb-3">
                                    <p><strong>Lessons:</strong></p>
                                    <ul>
                                        {formData.lessons.map((lesson, index) => (
                                            <li key={index}>{lesson.title} ({lesson.duration} min)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
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
