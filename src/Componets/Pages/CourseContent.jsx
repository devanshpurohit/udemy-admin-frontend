import { faClose, faPencil, faTrash, faVideo, faArrowLeft, faArrowRight, faPlus, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { getCourseDraft, saveCourseContent, updateSection, deleteSection, updateLessonInSection, deleteLessonFromSection, updateQuiz, deleteQuiz } from "../../services/courseService";

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

    // Edit State
    const [editMode, setEditMode] = useState({
        type: null, // 'section', 'lesson', 'quiz'
        sectionId: null,
        lessonId: null,
        id: null
    });

    const resetForms = () => {
        setSectionForm({ title: '', description: '' });
        setLessonForm({ title: '', description: '', videoUrl: '', duration: 30, isPreview: false });
        setQuizForm({ question: '', options: ['', ''], correctAnswer: 0 });
        setEditMode({ type: null, sectionId: null, lessonId: null, id: null });
        setSelectedVideoFile(null);
        setVideoSourceType('url');
    };
    
    // Video Upload State
    const [videoSourceType, setVideoSourceType] = useState('url'); // 'url' or 'upload'
    const [selectedVideoFile, setSelectedVideoFile] = useState(null);
    const [videoUploading, setVideoUploading] = useState(false);

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

    // Add/Update Section
    const handleAddSection = async () => {
        try {
            setLoading(true);
            let response;
            if (editMode.type === 'section') {
                response = await updateSection(courseId, editMode.id, sectionForm);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api'}/courses/${courseId}/sections`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(sectionForm)
                });
                response = await fetchRes.json();
            }

            if (response.success) {
                if (editMode.type === 'section') {
                    setSections(sections.map(s => s._id === editMode.id ? response.data.section : s));
                    setSuccess('Section updated successfully!');
                } else {
                    setSections([...sections, response.data.section]);
                    setSuccess('Section added successfully!');
                }
                resetForms();
                setShowAddSection(false);
            } else {
                setError(response.message || 'Operation failed');
            }
        } catch (err) {
            setError('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSection = (section) => {
        setEditMode({ type: 'section', id: section._id, sectionId: null, lessonId: null });
        setSectionForm({ title: section.title, description: section.description || '' });
        setShowAddSection(true);
    };

    const handleDeleteSection = async (sectionId) => {
        if (window.confirm('Are you sure you want to delete this section? All lessons and quizzes in it will be removed.')) {
            try {
                setLoading(true);
                const response = await deleteSection(courseId, sectionId);
                if (response.success) {
                    setSections(sections.filter(s => s._id !== sectionId));
                    setSuccess('Section deleted successfully!');
                } else {
                    setError(response.message || 'Delete failed');
                }
            } catch (err) {
                setError('Delete failed');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddLesson = async () => {
        if (!selectedSection) {
            setError('Please select a section first');
            return;
        }

        let finalVideoUrl = lessonForm.videoUrl;

        // Validation for title and duration
        if (!lessonForm.title.trim()) {
            setError('Lesson title is required');
            return;
        }
        if (!lessonForm.duration || lessonForm.duration < 1) {
            setError('Duration must be at least 1 minute');
            return;
        }

        if (videoSourceType === 'upload') {
            if (!selectedVideoFile) {
                setError('Please select a video file to upload');
                return;
            }
            try {
                setVideoUploading(true);
                const formData = new FormData();
                formData.append('video', selectedVideoFile);
                const token = localStorage.getItem('token');
                const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api'}/courses/upload-video`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalVideoUrl = uploadData.data.videoUrl;
                } else {
                    setError(uploadData.message || 'Failed to upload video');
                    setVideoUploading(false);
                    return;
                }
            } catch (err) {
                console.error('Video upload error:', err);
                setError('Failed to upload video');
                setVideoUploading(false);
                return;
            } finally {
                setVideoUploading(false);
            }
        } else {
            if (!finalVideoUrl || !finalVideoUrl.trim()) {
                setError('Video URL is required');
                return;
            }
        }

        try {
            setLoading(true);
            const dataToSubmit = { ...lessonForm, videoUrl: finalVideoUrl };
            let response;
            if (editMode.type === 'lesson') {
                response = await updateLessonInSection(courseId, selectedSection, editMode.id, dataToSubmit);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api'}/courses/${courseId}/sections/${selectedSection}/lessons`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSubmit)
                });
                response = await fetchRes.json();
            }
            
            if (response.success) {
                const updatedSections = sections.map(section => {
                    if (section._id === selectedSection) {
                        if (editMode.type === 'lesson') {
                            return { ...section, lessons: section.lessons.map(l => l._id === editMode.id ? response.data.lesson : l) };
                        }
                        return { ...section, lessons: [...section.lessons, response.data.lesson] };
                    }
                    return section;
                });
                setSections(updatedSections);
                resetForms();
                setShowAddLesson(false);
                setSelectedSection(null);
                setSuccess(`Lesson ${editMode.type === 'lesson' ? 'updated' : 'added'} successfully!`);
            } else {
                setError(response.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Add lesson error:', err);
            setError('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEditLesson = (sectionId, lesson) => {
        setSelectedSection(sectionId);
        setEditMode({ type: 'lesson', id: lesson._id, sectionId, lessonId: null });
        setLessonForm({
            title: lesson.title,
            description: lesson.description || '',
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            isPreview: lesson.isPreview
        });
        setVideoSourceType('url'); // Default to URL for editing
        setShowAddLesson(true);
    };

    const handleDeleteLesson = async (sectionId, lessonId) => {
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            try {
                setLoading(true);
                const response = await deleteLessonFromSection(courseId, sectionId, lessonId);
                if (response.success) {
                    setSections(sections.map(s => {
                        if (s._id === sectionId) {
                            return { ...s, lessons: s.lessons.filter(l => l._id !== lessonId) };
                        }
                        return s;
                    }));
                    setSuccess('Lesson deleted successfully!');
                } else {
                    setError(response.message || 'Delete failed');
                }
            } catch (err) {
                setError('Delete failed');
            } finally {
                setLoading(false);
            }
        }
    };

    // Add/Update Quiz to Lesson
    const handleAddQuiz = async () => {
        if (!selectedSection || !selectedLesson) {
            setError('Please select a lesson first');
            return;
        }
        
        if (!quizForm.question.trim()) {
            setError('Quiz question is required');
            return;
        }
        
        if (!quizForm.options || quizForm.options.length < 2) {
            setError('At least 2 options are required');
            return;
        }
        
        const emptyOptions = quizForm.options.filter(option => !option.trim());
        if (emptyOptions.length > 0) {
            setError('All options must have values');
            return;
        }
        
        if (quizForm.correctAnswer === undefined || quizForm.correctAnswer < 0 || quizForm.correctAnswer >= quizForm.options.length) {
            setError('Please select a correct answer');
            return;
        }
        
        try {
            setLoading(true);
            let response;
            if (editMode.type === 'quiz') {
                response = await updateQuiz(courseId, selectedSection, selectedLesson, editMode.id, quizForm);
            } else {
                const token = localStorage.getItem('token');
                const fetchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api'}/courses/${courseId}/sections/${selectedSection}/lessons/${selectedLesson}/quiz`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(quizForm)
                });
                response = await fetchRes.json();
            }
            
            if (response.success) {
                const updatedSections = sections.map(section => {
                    if (section._id === selectedSection) {
                        return {
                            ...section,
                            lessons: section.lessons.map(lesson => {
                                if (lesson._id === selectedLesson) {
                                    if (editMode.type === 'quiz') {
                                        return { ...lesson, quizzes: lesson.quizzes.map(q => q._id === editMode.id ? response.data.quiz : q) };
                                    }
                                    return { ...lesson, quizzes: [...lesson.quizzes, response.data.quiz] };
                                }
                                return lesson;
                            })
                        };
                    }
                    return section;
                });
                setSections(updatedSections);
                resetForms();
                setShowAddQuiz(false);
                setSelectedSection(null);
                setSelectedLesson(null);
                setSuccess(`Quiz ${editMode.type === 'quiz' ? 'updated' : 'added'} successfully!`);
            } else {
                setError(response.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Add quiz error:', err);
            setError('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEditQuiz = (sectionId, lessonId, quiz) => {
        setSelectedSection(sectionId);
        setSelectedLesson(lessonId);
        setEditMode({ type: 'quiz', id: quiz._id, sectionId, lessonId });
        setQuizForm({
            question: quiz.question,
            options: [...quiz.options],
            correctAnswer: quiz.correctAnswer
        });
        setShowAddQuiz(true);
    };

    const handleDeleteQuiz = async (sectionId, lessonId, quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                setLoading(true);
                const response = await deleteQuiz(courseId, sectionId, lessonId, quizId);
                if (response.success) {
                    setSections(sections.map(s => {
                        if (s._id === sectionId) {
                            return {
                                ...s,
                                lessons: s.lessons.map(l => {
                                    if (l._id === lessonId) {
                                        return { ...l, quizzes: l.quizzes.filter(q => q._id !== quizId) };
                                    }
                                    return l;
                                })
                            };
                        }
                        return s;
                    }));
                    setSuccess('Quiz deleted successfully!');
                } else {
                    setError(response.message || 'Delete failed');
                }
            } catch (err) {
                setError('Delete failed');
            } finally {
                setLoading(false);
            }
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
                navigate('/course-media/' + courseId);
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
                                onClick={() => { resetForms(); setShowAddSection(true); }}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Add Section
                            </button>
                        </div>

                        {/* Add/Edit Section Modal */}
                        {showAddSection && (
                            <div className="card mb-4 border-primary">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{editMode.type === 'section' ? 'Edit Section' : 'Add New Section'}</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { resetForms(); setShowAddSection(false); }}
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
                                            {loading ? 'Saving...' : (editMode.type === 'section' ? 'Update Section' : 'Add Section')}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => { resetForms(); setShowAddSection(false); }}
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
                                                    resetForms();
                                                    setSelectedSection(section._id);
                                                    setShowAddLesson(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlus} /> Add Lesson
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => handleEditSection(section)}
                                                title="Edit Section"
                                            >
                                                <FontAwesomeIcon icon={faPencil} />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteSection(section._id)}
                                                title="Delete Section"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
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
                                                                    resetForms();
                                                                    setSelectedSection(section._id);
                                                                    setSelectedLesson(lesson._id);
                                                                    setShowAddQuiz(true);
                                                                }}
                                                            >
                                                                <MdQuiz /> Add Quiz
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-info"
                                                                onClick={() => handleEditLesson(section._id, lesson)}
                                                                title="Edit Lesson"
                                                            >
                                                                <FontAwesomeIcon icon={faPencil} />
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteLesson(section._id, lesson._id)}
                                                                title="Delete Lesson"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Quizzes for this lesson */}
                                                    {lesson.quizzes.length > 0 && (
                                                        <div className="mt-3">
                                                            <h6 className="text-muted small">Quizzes:</h6>
                                                            <div className="quiz-list">
                                                                {lesson.quizzes.map((quiz, quizIndex) => (
                                                                    <div key={quiz._id || quizIndex} className="quiz-item bg-light rounded p-2 mb-2">
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <div>
                                                                                <strong>Q{quizIndex + 1}:</strong> {quiz.question}
                                                                            </div>
                                                                            <div className="d-flex gap-2">
                                                                                <button 
                                                                                    className="btn btn-link btn-sm p-0 text-info"
                                                                                    onClick={() => handleEditQuiz(section._id, lesson._id, quiz)}
                                                                                    title="Edit Quiz"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPencil} />
                                                                                </button>
                                                                                <button 
                                                                                    className="btn btn-link btn-sm p-0 text-danger"
                                                                                    onClick={() => handleDeleteQuiz(section._id, lesson._id, quiz._id)}
                                                                                    title="Delete Quiz"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                                </button>
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

                        {/* Add/Edit Lesson Modal */}
                        {showAddLesson && selectedSection && (
                            <div className="card mb-4 border-info">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{editMode.type === 'lesson' ? 'Edit Lesson' : 'Add New Lesson'}</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            resetForms();
                                            setShowAddLesson(false);
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
                                                <label className="form-label d-block">Video Source *</label>
                                                <div className="btn-group mb-3" role="group">
                                                    <input 
                                                        type="radio" 
                                                        className="btn-check" 
                                                        name="videoSource" 
                                                        id="btnradio1" 
                                                        autoComplete="off" 
                                                        checked={videoSourceType === 'url'} 
                                                        onChange={() => setVideoSourceType('url')} 
                                                    />
                                                    <label className="btn btn-outline-primary" htmlFor="btnradio1">YouTube URL</label>

                                                    <input 
                                                        type="radio" 
                                                        className="btn-check" 
                                                        name="videoSource" 
                                                        id="btnradio2" 
                                                        autoComplete="off" 
                                                        checked={videoSourceType === 'upload'} 
                                                        onChange={() => setVideoSourceType('upload')} 
                                                    />
                                                    <label className="btn btn-outline-primary" htmlFor="btnradio2">Upload File</label>
                                                </div>

                                                {videoSourceType === 'url' ? (
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="videoUrl"
                                                        value={lessonForm.videoUrl}
                                                        onChange={handleLessonFormChange}
                                                        placeholder="https://youtube.com/watch?v=..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <input 
                                                            type="file" 
                                                            className="form-control" 
                                                            accept="video/*" 
                                                            onChange={(e) => setSelectedVideoFile(e.target.files[0])} 
                                                        />
                                                        {selectedVideoFile && <small className="text-muted d-block mt-1">Selected: {selectedVideoFile.name}</small>}
                                                    </div>
                                                )}
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
                                            disabled={loading || videoUploading}
                                        >
                                            {videoUploading ? 'Uploading Video...' : loading ? 'Saving...' : (editMode.type === 'lesson' ? 'Update Lesson' : 'Add Lesson')}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => { resetForms(); setShowAddLesson(false); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add/Edit Quiz Modal */}
                        {showAddQuiz && selectedSection && selectedLesson && (
                            <div className="card mb-4 border-success">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{editMode.type === 'quiz' ? 'Edit Quiz' : 'Add Quiz'}</h5>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { resetForms(); setShowAddQuiz(false); }}
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
                                                <label className="form-label">Options * (Select radio button for correct answer)</label>
                                                {quizForm.options.map((option, index) => (
                                                    <div key={index} className="d-flex gap-2 mb-2">
                                                        <div className="form-check pt-1">
                                                            <input
                                                                type="radio"
                                                                className="form-check-input"
                                                                name="correctAnswer"
                                                                id={`correctAnswer-${index}`}
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
                                            {loading ? 'Saving...' : (editMode.type === 'quiz' ? 'Update Quiz' : 'Add Quiz')}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => { resetForms(); setShowAddQuiz(false); }}
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
