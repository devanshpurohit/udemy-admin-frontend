import { faClose, faArrowLeft, faArrowRight, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { saveCourseDraft, updateCourseDraft, getCourseDraft } from "../../services/courseService";
import "./CourseImageUpload.css";

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
        title: '',
        description: '',
        category: 'development',
        level: 'beginner',
        price: 99.99,
        duration: 3,
        language: 'English',
        requirements: [],
        whatYouLearn: [],
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
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || 'development',
                    level: course.level || 'beginner',
                    price: course.price || 99.99,
                    duration: course.duration || 3,
                    language: course.language || 'English',
                    requirements: course.requirements || [],
                    whatYouLearn: course.whatYouWillLearn || [],
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
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation - just check if title exists, otherwise use default
        if (!formData.title.trim()) {
            formData.title = 'Untitled Course';
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
                                <div className="col-lg-12">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="" className="fw-500">Enter Course Title (optional)</label>
                                        <input 
                                            type="text" 
                                            name="title"
                                            className="form-control" 
                                            placeholder="Enter Course Title" 
                                            value={formData.title}
                                            onChange={handleChange}
                                        />
                                        <span className="character-title">50-60 Character recomment </span>
                                    </div>
                                </div>

                                <div className="col-lg-12">
                                    <div className="custom-frm-bx">
                                        <label htmlFor="">Course Description (optional)</label>
                                        <textarea 
                                            name="description"
                                            className="form-control text-form" 
                                            placeholder="Describe What student learn with this course"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                        ></textarea>
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
                                                src={formData.courseImage}
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
