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
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [showAddQuiz, setShowAddQuiz] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [currentStepFromServer, setCurrentStepFromServer] = useState(1);
    const [sectionForm, setSectionForm] = useState({
        title: '',
        description: ''
    });
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: 30,
        isPreview: false
    });
    const [quizForm, setQuizForm] = useState({
        question: '',
        options: ['', ''],
        correctAnswer: 0
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
                setSections(response.data.sections || []);
                setCompletedSteps(response.data.completedSteps || []);
                setCurrentStepFromServer(response.data.currentStep || 1);
            }
        } catch (err) {
            setError('Failed to load course content');
        } finally {
            setFetching(false);
        }
    };

    // Add Section
    const handleAddSection = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5002/api/courses/${courseId}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sectionForm)
            });

            const data = await response.json();
            if (data.success) {
                setSections([...sections, data.data.section]);
                setSectionForm({ title: '', description: '' });
                setShowAddSection(false);
                setSuccess('Section added successfully!');
            } else {
                setError(data.message || 'Failed to add section');
            }
        } catch (err) {
            setError('Failed to add section');
        } finally {
            setLoading(false);
        }
    };

    // Add Lesson to Section
    const handleAddLesson = async () => {
        console.log('🔍 handleAddLesson called');
        console.log('🔍 selectedSection:', selectedSection);
        console.log('🔍 lessonForm:', lessonForm);
        
        if (!selectedSection) {
            console.error('❌ No section selected');
            setError('Please select a section first');
            return;
        }
        
        // Validate form data
        console.log('🔍 Validating form data...');
        console.log('🔍 title:', lessonForm.title, 'trim:', lessonForm.title.trim());
        console.log('🔍 videoUrl:', lessonForm.videoUrl, 'trim:', lessonForm.videoUrl.trim());
        console.log('🔍 duration:', lessonForm.duration);
        
        if (!lessonForm.title.trim()) {
            console.error('❌ Title validation failed');
            setError('Lesson title is required');
            return;
        }
        
        if (!lessonForm.videoUrl.trim()) {
            console.error('❌ Video URL validation failed');
            setError('Video URL is required');
            return;
        }
        
        if (!lessonForm.duration || lessonForm.duration < 1) {
            console.error('❌ Duration validation failed');
            setError('Duration must be at least 1 minute');
            return;
        }
        
        console.log('✅ Form validation passed');
        console.log('🔍 Adding lesson to section:', selectedSection);
        console.log('🔍 Final lesson form data:', lessonForm);
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5002/api/courses/${courseId}/sections/${selectedSection}/lessons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(lessonForm)
            });

            console.log('🔍 Response status:', response.status);
            const data = await response.json();
            console.log('🔍 Response data:', data);
            
            if (data.success) {
                console.log('✅ Lesson added successfully:', data.data.lesson);
                const updatedSections = sections.map(section => {
                    if (section._id === selectedSection) {
                        return {
                            ...section,
                            lessons: [...section.lessons, data.data.lesson]
                        };
                    }
                    return section;
                });
                console.log('🔍 Updated sections:', updatedSections);
                setSections(updatedSections);
                setLessonForm({ title: '', description: '', videoUrl: '', duration: 30, isPreview: false });
                setShowAddLesson(false);
                setSelectedSection(null);
                setSuccess('Lesson added successfully!');
            } else {
                console.error('❌ Failed to add lesson:', data.message);
                setError(data.message || 'Failed to add lesson');
            }
        } catch (err) {
            console.error('❌ Add lesson error:', err);
            setError('Failed to add lesson');
        } finally {
            setLoading(false);
        }
    };

    // Add Quiz to Lesson
    const handleAddQuiz = async () => {
        if (!selectedSection || !selectedLesson) {
            console.error('❌ No section or lesson selected');
            setError('Please select a lesson first');
            return;
        }
        
        // Validate quiz form data
        console.log('🔍 Validating quiz form data...');
        console.log('🔍 question:', quizForm.question, 'trim:', quizForm.question.trim());
        console.log('🔍 options:', quizForm.options);
        console.log('🔍 correctAnswer:', quizForm.correctAnswer);
        
        if (!quizForm.question.trim()) {
            console.error('❌ Question validation failed');
            setError('Quiz question is required');
            return;
        }
        
        if (!quizForm.options || quizForm.options.length < 2) {
            console.error('❌ Options validation failed');
            setError('At least 2 options are required');
            return;
        }
        
        // Check if all options have values
        const emptyOptions = quizForm.options.filter(option => !option.trim());
        if (emptyOptions.length > 0) {
            console.error('❌ Empty options validation failed');
            setError('All options must have values');
            return;
        }
        
        if (quizForm.correctAnswer === undefined || quizForm.correctAnswer < 0 || quizForm.correctAnswer >= quizForm.options.length) {
            console.error('❌ Correct answer validation failed');
            setError('Please select a correct answer');
            return;
        }
        
        console.log('✅ Quiz form validation passed');
        console.log('🔍 Adding quiz to lesson:', selectedLesson);
        console.log('🔍 Final quiz form data:', quizForm);
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5002/api/courses/${courseId}/sections/${selectedSection}/lessons/${selectedLesson}/quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(quizForm)
            });

            console.log('🔍 Quiz response status:', response.status);
            const data = await response.json();
            console.log('🔍 Quiz response data:', data);
            
            if (data.success) {
                console.log('✅ Quiz added successfully:', data.data.quiz);
                const updatedSections = sections.map(section => {
                    if (section._id === selectedSection) {
                        return {
                            ...section,
                            lessons: section.lessons.map(lesson => {
                                if (lesson._id === selectedLesson) {
                                    return {
                                        ...lesson,
                                        quizzes: [...lesson.quizzes, data.data.quiz]
                                    };
                                }
                                return lesson;
                            })
                        };
                    }
                    return section;
                });
                console.log('🔍 Updated sections with quiz:', updatedSections);
                setSections(updatedSections);
                setQuizForm({ question: '', options: ['', ''], correctAnswer: 0 });
                setShowAddQuiz(false);
                setSelectedSection(null);
                setSelectedLesson(null);
                setSuccess('Quiz added successfully!');
            } else {
                console.error('❌ Failed to add quiz:', data.message);
                setError(data.message || 'Failed to add quiz');
            }
        } catch (err) {
            console.error('❌ Add quiz error:', err);
            setError('Failed to add quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionFormChange = (e) => {
        const { name, value } = e.target;
        setSectionForm({
            ...sectionForm,
            [name]: value
        });
    };

    const handleLessonFormChange = (e) => {
        const { name, value, type } = e.target;
        setLessonForm({
            ...lessonForm,
            [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? e.target.checked : value
        });
    };

    const handleQuizFormChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('option')) {
            const index = parseInt(name.split('-')[1]);
            const newOptions = [...quizForm.options];
            newOptions[index] = value;
            setQuizForm({
                ...quizForm,
                options: newOptions
            });
        } else {
            setQuizForm({
                ...quizForm,
                [name]: value
            });
        }
    };

    const addQuizOption = () => {
        if (quizForm.options.length < 6) {
            setQuizForm({
                ...quizForm,
                options: [...quizForm.options, '']
            });
        }
    };

    const removeQuizOption = (index) => {
        if (quizForm.options.length > 2) {
            const newOptions = quizForm.options.filter((_, i) => i !== index);
            setQuizForm({
                ...quizForm,
                options: newOptions,
                correctAnswer: Math.min(quizForm.correctAnswer, newOptions.length - 1)
            });
        }
    };

    const handleNext = async () => {
        try {
            setLoading(true);
            setError('');
            
            console.log('🔍 handleNext called');
            console.log('🔍 courseId:', courseId);
            console.log('🔍 sections array:', sections);
            console.log('🔍 sections type:', typeof sections);
            console.log('🔍 sections length:', sections.length);
            console.log('🔍 sections JSON:', JSON.stringify(sections, null, 2));
            
            // Check if sections is a valid array
            if (!Array.isArray(sections)) {
                console.error('❌ sections is not an array:', sections);
                setError('Invalid course content data');
                return;
            }
            
            if (sections.length === 0) {
                console.warn('⚠️ No sections to save');
                setError('Please add at least one section with lessons before proceeding');
                return;
            }
            
            // Check if sections have lessons
            const sectionsWithLessons = sections.filter(section => section.lessons && section.lessons.length > 0);
            console.log('🔍 sections with lessons:', sectionsWithLessons.length);
            
            if (sectionsWithLessons.length === 0) {
                console.warn('⚠️ No sections have lessons');
                setError('Please add at least one lesson to a section before proceeding');
                return;
            }
            
            console.log('🔍 Saving course content with sections:', sections);
            console.log('🔍 Total sections:', sections.length);
            console.log('🔍 Total lessons:', sections.reduce((total, section) => total + (section.lessons?.length || 0), 0));
            
            const response = await saveCourseContent(courseId, { sections });
            console.log('🔍 Save course content response:', response);
            console.log('🔍 Response success:', response.success);
            console.log('🔍 Response data:', response.data);
            
            if (response.success) {
                console.log('✅ Course content saved successfully');
                setSuccess('Course content saved successfully!');
                navigate('/course-pricing/' + courseId);
            } else {
                console.error('❌ Failed to save course content:', response.message);
                setError(response.message || 'Failed to save course content');
            }
        } catch (err) {
            console.error('❌ Save course content error:', err);
            console.error('❌ Error stack:', err.stack);
            setError('Failed to save course content: ' + (err.message || 'Unknown error'));
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

                        <h3 className="innr-title mb-4">Course Content</h3>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Sections ({sections.length})</h5>
                            <button 
                                className="lg-thm-btn" 
                                onClick={() => setShowAddSection(true)}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Section
                            </button>
                        </div>

                        {/* Add Section Modal */}
                        {showAddSection && (
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Add New Section</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setShowAddSection(false)}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Section Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="title"
                                                    value={sectionForm.title}
                                                    onChange={handleSectionFormChange}
                                                    placeholder="Enter section title"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={sectionForm.description}
                                                    onChange={handleSectionFormChange}
                                                    placeholder="Enter section description"
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleAddSection}
                                            disabled={loading}
                                        >
                                            {loading ? 'Adding...' : 'Add Section'}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => setShowAddSection(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sections and Lessons */}
                        {sections.map((section, sectionIndex) => (
                            <div key={section._id} className="card mb-4">
                                <div className="card-header bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            Section {sectionIndex + 1}: {section.title}
                                        </h5>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => {
                                                    setSelectedSection(section._id);
                                                    setShowAddLesson(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Add Lesson
                                            </button>
                                        </div>
                                    </div>
                                    {section.description && (
                                        <p className="text-muted mb-0 mt-2">{section.description}</p>
                                    )}
                                </div>
                                <div className="card-body">
                                    {section.lessons.length === 0 ? (
                                        <p className="text-muted">No lessons in this section yet.</p>
                                    ) : (
                                        <div className="lessons-list">
                                            {section.lessons.map((lesson, lessonIndex) => (
                                                <div key={lesson._id} className="lesson-item border rounded p-3 mb-3">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-2">
                                                                {lessonIndex + 1}. {lesson.title}
                                                                {lesson.isPreview && (
                                                                    <span className="badge bg-success ms-2">Preview</span>
                                                                )}
                                                            </h6>
                                                            {lesson.description && (
                                                                <p className="text-muted mb-2">{lesson.description}</p>
                                                            )}
                                                            <div className="d-flex gap-3 text-muted small">
                                                                <span><FontAwesomeIcon icon={faVideo} /> {lesson.duration} min</span>
                                                                <span><MdQuiz /> {lesson.quizzes.length} quiz{lesson.quizzes.length !== 1 ? 'zes' : ''}</span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => {
                                                                    setSelectedSection(section._id);
                                                                    setSelectedLesson(lesson._id);
                                                                    setShowAddQuiz(true);
                                                                }}
                                                            >
                                                                <MdQuiz /> Add Quiz
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Quizzes for this lesson */}
                                                    {lesson.quizzes.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6 className="text-muted small">Quizzes:</h6>
                                                            <div className="quiz-list">
                                                                {lesson.quizzes.map((quiz, quizIndex) => (
                                                                    <div key={quizIndex} className="quiz-item bg-light rounded p-2 mb-2">
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <strong>Q{quizIndex + 1}:</strong> {quiz.question}
                                                                            </div>
                                                                            <div className="text-muted small">
                                                                                {quiz.options.length} options
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Lesson Modal */}
                        {showAddLesson && selectedSection && (
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Add New Lesson</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            setShowAddLesson(false);
                                            setSelectedSection(null);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Lesson Title *</label>
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
                                                <label className="form-label">Duration (minutes) *</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="duration"
                                                    value={lessonForm.duration}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="30"
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={lessonForm.description}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="Enter lesson description"
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Video URL *</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="videoUrl"
                                                    value={lessonForm.videoUrl}
                                                    onChange={handleLessonFormChange}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        name="isPreview"
                                                        checked={lessonForm.isPreview}
                                                        onChange={handleLessonFormChange}
                                                    />
                                                    <label className="form-check-label">
                                                        Make this lesson available as preview
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleAddLesson}
                                            disabled={loading}
                                        >
                                            {loading ? 'Adding...' : 'Add Lesson'}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowAddLesson(false);
                                                setSelectedSection(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Quiz Modal */}
                        {showAddQuiz && selectedSection && selectedLesson && (
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Add Quiz</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            setShowAddQuiz(false);
                                            setSelectedSection(null);
                                            setSelectedLesson(null);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClose} />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Question *</label>
                                                <textarea
                                                    className="form-control"
                                                    name="question"
                                                    value={quizForm.question}
                                                    onChange={handleQuizFormChange}
                                                    placeholder="Enter your question"
                                                    rows="3"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Options *</label>
                                                {quizForm.options.map((option, index) => (
                                                    <div key={index} className="d-flex gap-2 mb-2">
                                                        <div className="form-check">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name="correctAnswer"
                                                                checked={quizForm.correctAnswer === index}
                                                                onChange={() => setQuizForm({...quizForm, correctAnswer: index})}
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name={`option-${index}`}
                                                            value={option}
                                                            onChange={handleQuizFormChange}
                                                            placeholder={`Option ${index + 1}`}
                                                            required
                                                        />
                                                        {quizForm.options.length > 2 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => removeQuizOption(index)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="d-flex gap-2 mt-2">
                                                    {quizForm.options.length < 6 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={addQuizOption}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} /> Add Option
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleAddQuiz}
                                            disabled={loading}
                                        >
                                            {loading ? 'Adding...' : 'Add Quiz'}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowAddQuiz(false);
                                                setSelectedSection(null);
                                                setSelectedLesson(null);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between">
                            <button className="lg-white-btn" onClick={handleBack}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>
                            <button className="lg-thm-btn" onClick={handleNext} disabled={loading}>
                                {loading ? 'Saving...' : 'Next: Media & Assets'} <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CourseContent;
