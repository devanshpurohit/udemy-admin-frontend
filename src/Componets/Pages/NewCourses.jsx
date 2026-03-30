import { faClose, faArrowLeft, faArrowRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { saveCourseDraft, updateCourseDraft, getCourseDraft } from "../../services/courseService";
import { getLangText } from "../../utils/languageUtils";
import "./CourseImageUpload.css";

const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api').replace('/api', '');
    let cleanPath = url.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${baseUrl}${cleanPath}`;
};

function NewCourses() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [courseIdState, setCourseIdState] = useState(courseId || null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [currentStepFromServer, setCurrentStepFromServer] = useState(1);
    
    // Simple form data - all optional
    const [formData, setFormData] = useState({
        title: { en: '', kn: '' },
        description: { en: '', kn: '' },
        category: 'development',
        level: 'beginner',
        price: 99.99,
        duration: 3,
        language: 'English',
        requirements: { en: [], kn: [] },
        whatYouWillLearn: { en: [], kn: [] },
        courseImage: ''
    });

    useEffect(() => {
        if (courseId) {
            fetchCourseDraft();
        }
    }, [courseId]);

    const fetchCourseDraft = async () => {
        try {
            setFetching(true);
            const response = await getCourseDraft(courseId);
            if (response.success) {
                const course = response.data;
                const parseField = (field) => {
                    if (typeof field === 'object' && field !== null) return { en: field.en || '', kn: field.kn || '' };
                    return { en: field || '', kn: '' };
                };
                
                const parseList = (field) => {
                    if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
                        return { en: Array.isArray(field.en) ? field.en : [], kn: Array.isArray(field.kn) ? field.kn : [] };
                    }
                    return { en: Array.isArray(field) ? field : [], kn: [] };
                };

                setFormData({
                    title: parseField(course.title),
                    description: parseField(course.description),
                    category: course.category || 'development',
                    level: course.level || 'beginner',
                    price: course.price || 99.99,
                    duration: course.duration || 3,
                    language: course.language || 'English',
                    requirements: parseList(course.requirements),
                    whatYouWillLearn: parseList(course.whatYouWillLearn),
                    courseImage: course.courseImage || ''
                });
                setCompletedSteps(course.completedSteps || []);
                setCurrentStepFromServer(course.currentStep || 1);
                setCourseIdState(course._id);
            }
        } catch (err) {
            setError('Failed to load course draft');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('_')) {
            const [field, lang] = name.split('_');
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [lang]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleListChange = (name, value, lang) => {
        setFormData(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [lang]: value.split('\n')
            }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                e.target.value = ''; // Clear the input
                return;
            }

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation
        if (!formData.title.en.trim() && !formData.title.kn.trim()) {
            toast.error('Please enter a course title in at least one language');
            return;
        }
        
        await saveDraft();
    };

    const saveDraft = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            const dataToSave = {
                ...formData,
                currentStep: 1,
                courseId: courseIdState
            };

            let response;
            if (courseIdState) {
                response = await updateCourseDraft(courseIdState, dataToSave);
            } else {
                response = await saveCourseDraft(dataToSave);
            }

            if (response.success) {
                setSuccess('Course draft saved successfully!');
                const newCourseId = response.data._id;
                setCourseIdState(newCourseId);
                // Navigate to next step
                navigate(`/course-content/${newCourseId}`);
            } else {
                setError(response.message || 'Failed to save course');
            }
        } catch (err) {
            setError(err.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    const isStepLocked = (stepNumber) => {
        if (stepNumber === 1) return false;
        if (completedSteps.includes(stepNumber - 1)) return false;
        if (courseIdState && stepNumber <= currentStepFromServer + 1) return false;
        return true;
    };

    const handleStepClick = (stepNumber, path) => {
        if (!isStepLocked(stepNumber)) {
            navigate(`${path}/${courseIdState}`);
        }
    };

    if (fetching) {
        return <div className="main-content p-3">Loading course draft...</div>;
    }

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
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        >
                                            New Courses
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fz-24">Create New Course</h3>
                        </div>

                        <div className="">
                            <button className="lg-white-btn" onClick={() => navigate('/course')}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center mb-3">
                    <div className="col-lg-10">
                        <div className="account-step-main-bx">
                            <button className="account-step-crd account-step-one active-step">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">1</span>
                                </div>
                                <h6>Basic Information</h6>
                            </button>

                            <button 
                                onClick={() => handleStepClick(2, '/course-content')} 
                                className={`account-step-crd account-step-one ${isStepLocked(2) ? 'locked-step' : ''}`}
                                disabled={isStepLocked(2)}
                            >
                                <div className={`account-step-bx ${isStepLocked(2) ? 'account-lock-step' : 'account-unstep-card'}`}>
                                    <span className="account-step-icon">
                                        {isStepLocked(2) ? <FontAwesomeIcon icon={faLock} /> : '2'}
                                    </span>
                                </div>
                                <h6>Course Content</h6>
                            </button>

                            <button 
                                onClick={() => handleStepClick(3, '/course-media')} 
                                className={`account-step-crd account-step-one ${isStepLocked(3) ? 'locked-step' : ''}`}
                                disabled={isStepLocked(3)}
                            >
                                <div className={`account-step-bx ${isStepLocked(3) ? 'account-lock-step' : 'account-unstep-card'}`}>
                                    <span className="account-step-icon">
                                        {isStepLocked(3) ? <FontAwesomeIcon icon={faLock} /> : '3'}
                                    </span>
                                </div>
                                <h6>Media & Assets</h6>
                            </button>

                            <button 
                                onClick={() => handleStepClick(4, '/course-pricing')} 
                                className={`account-step-crd account-step-one ${isStepLocked(4) ? 'locked-step' : ''}`}
                                disabled={isStepLocked(4)}
                            >
                                <div className={`account-step-bx ${isStepLocked(4) ? 'account-lock-step' : 'account-unstep-card'}`}>
                                    <span className="account-step-icon">
                                        {isStepLocked(4) ? <FontAwesomeIcon icon={faLock} /> : '4'}
                                    </span>
                                </div>
                                <h6>Pricing</h6>
                            </button>

                            <button 
                                onClick={() => handleStepClick(5, '/course-publish')} 
                                className={`account-step-crd ${isStepLocked(5) ? 'locked-step' : ''}`}
                                disabled={isStepLocked(5)}
                            >
                                <div className={`account-step-bx ${isStepLocked(5) ? 'account-lock-step' : 'account-unstep-card'}`}>
                                    <span className="account-step-icon">
                                        {isStepLocked(5) ? <FontAwesomeIcon icon={faLock} /> : '5'}
                                    </span>
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

                        <h3 className="innr-title mb-4">Basic Information</h3>

                        <div className="row mb-3">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label className="fw-500">🇬🇧 Course Title (English)</label>
                                            <input 
                                                type="text" 
                                                name="title_en"
                                                className="form-control" 
                                                placeholder="Enter Course Title in English" 
                                                value={formData.title.en}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label className="fw-500">🇮🇳 Course Title (Kannada)</label>
                                            <input 
                                                type="text" 
                                                name="title_kn"
                                                className="form-control" 
                                                placeholder="ಕನ್ನಡದಲ್ಲಿ ಕೋರ್ಸ್ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ" 
                                                value={formData.title.kn}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇬🇧 Course Description (English)</label>
                                            <textarea 
                                                name="description_en"
                                                className="form-control text-form" 
                                                placeholder="Describe what students will learn (English)"
                                                value={formData.description.en}
                                                onChange={handleChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇮🇳 Course Description (Kannada)</label>
                                            <textarea 
                                                name="description_kn"
                                                className="form-control text-form" 
                                                placeholder="ಕೋರ್ಸ್ ವಿವರಣೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ"
                                                value={formData.description.kn}
                                                onChange={handleChange}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇬🇧 What you will learn (English)</label>
                                            <textarea 
                                                className="form-control text-form" 
                                                placeholder="Example: Master React Hooks&#10;Build real-world projects"
                                                value={Array.isArray(formData.whatYouWillLearn.en) ? formData.whatYouWillLearn.en.join('\n') : ''}
                                                onChange={(e) => handleListChange('whatYouWillLearn', e.target.value, 'en')}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇮🇳 What you will learn (Kannada)</label>
                                            <textarea 
                                                className="form-control text-form" 
                                                placeholder="ಉದಾಹರಣೆ: ರಿಯಾಕ್ಟ್ ಮಾಸ್ಟರ್ ಮಾಡಿ"
                                                value={Array.isArray(formData.whatYouWillLearn.kn) ? formData.whatYouWillLearn.kn.join('\n') : ''}
                                                onChange={(e) => handleListChange('whatYouWillLearn', e.target.value, 'kn')}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇬🇧 Requirements (English)</label>
                                            <textarea 
                                                className="form-control text-form" 
                                                placeholder="Example: Basic HTML/CSS knowledge"
                                                value={Array.isArray(formData.requirements.en) ? formData.requirements.en.join('\n') : ''}
                                                onChange={(e) => handleListChange('requirements', e.target.value, 'en')}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="custom-frm-bx">
                                            <label>🇮🇳 Requirements (Kannada)</label>
                                            <textarea 
                                                className="form-control text-form" 
                                                placeholder="ಉದಾಹರಣೆ: ಮೂಲಭೂತ HTML ವಿಷಯಗಳು"
                                                value={Array.isArray(formData.requirements.kn) ? formData.requirements.kn.join('\n') : ''}
                                                onChange={(e) => handleListChange('requirements', e.target.value, 'kn')}
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Category</label>
                                        <select
                                            name="category"
                                            className="form-select"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option value="development">Development</option>
                                            <option value="design">Design</option>
                                            <option value="business">Business</option>
                                            <option value="marketing">Marketing</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Level</label>
                                        <select
                                            name="level"
                                            className="form-select"
                                            value={formData.level}
                                            onChange={handleChange}
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Price ($)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            placeholder="99.99"
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Duration (months)</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            className="form-control"
                                            placeholder="3"
                                            value={formData.duration}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-12">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Course Image (optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="form-control"
                                        />
                                        {formData.courseImage && (
                                            <img
                                                src={getImageUrl(formData.courseImage)}
                                                alt="Course preview"
                                                className="mt-2"
                                                style={{ maxWidth: '200px', maxHeight: '150px' }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="col-lg-12">
                                    <div className="d-flex justify-content-between align-items-center mt-4">
                                        <button 
                                            type="button" 
                                            className="lg-white-btn" 
                                            onClick={() => navigate('/course')}
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                                        </button>

                                        <div className="d-flex gap-2">
                                            <button 
                                                type="submit" 
                                                className="lg-thm-btn" 
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : 'Next Step'} <FontAwesomeIcon icon={faArrowRight} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewCourses;
