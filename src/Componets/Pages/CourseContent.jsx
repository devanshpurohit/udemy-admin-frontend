import { faClose, faPencil, faTrash, faVideo, faArrowLeft, faArrowRight, faPlus, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { getCourseDraft, saveCourseContent } from "../../services/courseService";

function CourseContent() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [currentStepFromServer, setCurrentStepFromServer] = useState(1);
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: 30,
        order: 1
    });

    useEffect(() => {
        if (courseId) {
            fetchCourseDraft();
        } else {
            navigate('/new-course');
        }
    }, [courseId]);

    const fetchCourseDraft = async () => {
        try {
            setFetching(true);
            const response = await getCourseDraft(courseId);
            if (response.success) {
                setLessons(response.data.lessons || []);
                setCompletedSteps(response.data.completedSteps || []);
                setCurrentStepFromServer(response.data.currentStep || 1);
            }
        } catch (err) {
            setError('Failed to load course content');
        } finally {
            setFetching(false);
        }
    };

    const handleLessonFormChange = (e) => {
        const { name, value, type } = e.target;
        setLessonForm({
            ...lessonForm,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        });
    };

    const handleAddLesson = () => {
        const newLesson = {
            ...lessonForm,
            _id: Date.now().toString(),
            order: lessons.length + 1
        };
        setLessons([...lessons, newLesson]);
        
        // Reset form
        setLessonForm({
            title: '',
            description: '',
            videoUrl: '',
            duration: 30,
            order: lessons.length + 2
        });
        setShowAddLesson(false);
    };

    const handleEditLesson = (lesson) => {
        setLessonForm({
            title: lesson.title,
            description: lesson.description || '',
            videoUrl: lesson.videoUrl || '',
            duration: lesson.duration || 0,
            order: lesson.order
        });
        setShowAddLesson(true);
    };

    const handleDeleteLesson = (lessonId) => {
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            setLessons(lessons.filter(lesson => lesson._id !== lessonId));
        }
    };

    const handleNext = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Strip out the temporary _id from lessons if they are new (strings from Date.now())
            // but keep existing ones (24-char hex ObjectIds)
            const lessonsToSave = lessons.map(({ _id, ...rest }) => {
                if (_id && _id.length !== 24) {
                    return rest;
                }
                return { _id, ...rest };
            });

            const response = await saveCourseContent(courseId, {
                lessons: lessonsToSave,
                currentStep: 2
            });

            if (response.success || response.data) {
                navigate(`/course-media/${courseId}`);
            } else {
                setError(response.message || 'Failed to save content');
            }
        } catch (err) {
            console.error('Error saving course content:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save content');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/new-course/${courseId}`);
    };

    const isStepLocked = (stepNumber) => {
        if (stepNumber === 1) return false;
        if (completedSteps.includes(stepNumber - 1)) return false;
        if (courseId && stepNumber <= currentStepFromServer + 1) return false;
        return true;
    };

    const handleStepClick = (stepNumber, path) => {
        if (!isStepLocked(stepNumber)) {
            navigate(`${path}/${courseId}`);
        }
    };

    if (fetching) {
        return <div className="main-content p-3">Loading course content...</div>;
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
                                        <li className="breadcrumb-item">
                                            <NavLink to={`/new-course/${courseId}`} className="breadcrumb-link">
                                                New Courses
                                            </NavLink>
                                        </li>
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        >
                                            Course Content
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fz-24">Course Content</h3>
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

                            <button className="account-step-crd account-step-one active-step">
                                <div className="account-step-bx nw-step-bx">
                                    <span className="account-step-icon nw-step-icon">2</span>
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

                        <h3 className="innr-title mb-4">Course Lessons</h3>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Lessons ({lessons.length})</h5>
                            <button 
                                className="lg-thm-btn" 
                                onClick={() => setShowAddLesson(true)}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Lesson
                            </button>
                        </div>

                        {showAddLesson && (
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h5 className="mb-0">Add New Lesson</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Lesson Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    value={lessonForm.title}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="Enter lesson title"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Duration (minutes)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="duration"
                                                    value={lessonForm.duration}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="Duration in minutes"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={lessonForm.description}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="Lesson description"
                                                    rows="3"
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Video URL</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="videoUrl"
                                                    value={lessonForm.videoUrl}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="https://example.com/video.mp4"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="lg-thm-btn"
                                                    onClick={handleAddLesson}
                                                    disabled={!lessonForm.title}
                                                >
                                                    Add Lesson
                                                </button>
                                                <button
                                                    type="button"
                                                    className="lg-white-btn"
                                                    onClick={() => {
                                                        setShowAddLesson(false);
                                                        setLessonForm({
                                                            title: '',
                                                            description: '',
                                                            videoUrl: '',
                                                            duration: 30,
                                                            order: lessons.length + 1
                                                        });
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {lessons.length === 0 ? (
                            <div className="text-center py-5">
                                <FontAwesomeIcon icon={faVideo} size="3x" className="text-muted mb-3" />
                                <h5>No lessons added yet</h5>
                                <p className="text-muted">Start by adding your first lesson to the course</p>
                                <button 
                                    className="lg-thm-btn" 
                                    onClick={() => setShowAddLesson(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add Your First Lesson
                                </button>
                            </div>
                        ) : (
                            <div className="lessons-list">
                                {lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="card mb-3">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="badge bg-primary me-2">Lesson {lesson.order}</span>
                                                        <h6 className="mb-0">{lesson.title}</h6>
                                                    </div>
                                                    {lesson.description && (
                                                        <p className="text-muted mb-2">{lesson.description}</p>
                                                    )}
                                                    {lesson.videoUrl && (
                                                        <div className="d-flex align-items-center text-muted small">
                                                            <FontAwesomeIcon icon={faVideo} className="me-2" />
                                                            <span>Video available</span>
                                                        </div>
                                                    )}
                                                    {lesson.duration > 0 && (
                                                        <div className="text-muted small">
                                                            Duration: {lesson.duration} minutes
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditLesson(lesson)}
                                                    >
                                                        <FontAwesomeIcon icon={faPencil} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteLesson(lesson._id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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

export default CourseContent;
