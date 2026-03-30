import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faPlus, faTimes, faStar, faBook } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { getStudents } from '../../services/studentService';
import { getAllReviews, updateReviewStatus, deleteReview as deleteReviewService } from '../../services/reviewService';
import { getLangText } from '../../utils/languageUtils';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('feedbacks'); // 'feedbacks' or 'questions'
    const [creationType, setCreationType] = useState('feedback'); // 'feedback' or 'faq'
    
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        comment: '',
        userRole: 'Student',
        userImage: '/boy.png',
        isApproved: true,
        question: '',
        answer: '',
        courseId: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fbRes, qRes, stdRes, courseRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/feedback`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/questions/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                getStudents(),
                axios.get(`${API_BASE_URL}/courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (fbRes.data.success) {
                setFeedbacks(fbRes.data.data);
            }

            if (qRes.data.success) {
                setQuestions(qRes.data.data);
            }

            if (courseRes.data.success) {
                // courseRes is a raw axios response
                const courseList = courseRes.data.data?.courses || courseRes.data.data || [];
                setCourses(Array.isArray(courseList) ? courseList : []);
            }

            if (stdRes.success) {
                // stdRes is the response body (from api service)
                const studentList = stdRes.data?.students || stdRes.students || [];
                setStudents(Array.isArray(studentList) ? studentList : []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, isApproved, isReview = false) => {
        try {
            if (isReview) {
                const response = await updateReviewStatus(id, isApproved);
                if (response.success) {
                    toast.success(`Review ${isApproved ? 'Approved' : 'Rejected'}`);
                    fetchData();
                }
            } else {
                const response = await axios.put(`${API_BASE_URL}/feedback/${id}`, 
                    { isApproved },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.success) {
                    toast.success(`Feedback ${isApproved ? 'Approved' : 'Rejected'}`);
                    fetchData();
                }
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id, isFAQ) => {
        if (!window.confirm(`Are you sure you want to delete this ${isFAQ ? 'FAQ' : 'feedback'}?`)) return;
        try {
            if (isFAQ) {
                const response = await axios.delete(`${API_BASE_URL}/questions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success('FAQ deleted');
                    fetchData();
                }
            } else {
                const response = await axios.delete(`${API_BASE_URL}/feedback/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success('Feedback deleted');
                    fetchData();
                }
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'studentSelect') {
            if (value === 'Custom') {
                setFormData({ ...formData, name: '', userImage: '/boy.png', userRole: 'Student' });
            } else {
                const selectedStudent = students.find(s => s._id === value);
                if (selectedStudent) {
                    setFormData({ 
                        ...formData, 
                        name: selectedStudent.name || selectedStudent.username, 
                        userImage: selectedStudent.profile?.profileImage || '/boy.png',
                        userRole: 'Student'
                    });
                }
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (creationType === 'faq') {
                const response = await axios.post(`${API_BASE_URL}/questions/admin/create`, {
                    question: formData.question,
                    answer: formData.answer,
                    courseId: formData.courseId || null,
                    isPublic: true
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success('Course FAQ created successfully');
                    setShowModal(false);
                    resetForm();
                    fetchData();
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/feedback/admin`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    toast.success('Feedback created successfully');
                    setShowModal(false);
                    resetForm();
                    fetchData();
                }
            }
        } catch (error) {
            toast.error(`Failed to create ${creationType}`);
        }
    };

    const handleOpenModal = () => {
        setCreationType(activeTab === 'questions' ? 'faq' : 'feedback');
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            rating: 5,
            comment: '',
            userRole: 'Student',
            userImage: '/boy.png',
            isApproved: true,
            question: '',
            answer: '',
            courseId: ''
        });
    };

    const renderTable = (items, isReviewTab = false) => (
        <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="bg-light">
                    <tr>
                        <th className="px-4 py-3">{isReviewTab ? 'Course' : 'User'}</th>
                        <th className="px-4 py-3">{isReviewTab ? 'Question' : 'Rating'}</th>
                        <th className="px-4 py-3">{isReviewTab ? 'Answer' : 'Message'}</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan={isReviewTab ? "6" : "5"} className="text-center py-5 text-muted">No {isReviewTab ? 'reviews' : 'feedbacks'} found.</td></tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item._id} className="align-middle">
                                <td className="px-4 py-3">
                                    {isReviewTab ? (
                                        <div className="d-flex align-items-center gap-2 fw-bold">
                                            <FontAwesomeIcon icon={faBook} className="text-primary small" />
                                            {item.courseId?.title ? getLangText(item.courseId.title) : 'General FAQ'}
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center gap-3">
                                            <img 
                                                src={item.userImage || "/boy.png"} 
                                                alt={item.name} 
                                                className="rounded-circle" 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                                            />
                                            <div>
                                                <div className="fw-bold">{item.name}</div>
                                                <small className="text-muted">{item.userRole}</small>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {isReviewTab ? (
                                        <div className="text-wrap" style={{ maxWidth: '300px' }}>{item.question}</div>
                                    ) : (
                                        <div className="text-warning">
                                            {Array.from({ length: item.rating }).map((_, i) => (
                                                <FontAwesomeIcon key={i} icon={faStar} />
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-wrap" style={{ maxWidth: '300px' }}>
                                    {isReviewTab ? item.answer : item.comment}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`badge rounded-pill px-3 ${item.status === 'answered' || item.isApproved ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning border border-warning'}`}>
                                        {isReviewTab ? item.status : (item.isApproved ? 'Approved' : 'Pending')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item._id, isReviewTab)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light">
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-3 shadow-sm">
                <div>
                   <h4 className="fw-bold mb-0">Feedback & Review Management</h4>
                   <p className="text-muted mb-0 small">Manage general site feedback and course-specific reviews</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" onClick={handleOpenModal}>
                    <FontAwesomeIcon icon={faPlus} /> Create {activeTab === 'questions' ? 'Course FAQ' : 'Feedback'}
                </button>
            </div>

            {/* Tabs */}
            <div className="card shadow-sm border-0 mb-4 overflow-hidden">
                <div className="card-header border-0 bg-white p-0">
                    <div className="d-flex">
                        <button 
                            className={`flex-grow-1 py-3 border-0 bg-transparent fw-bold ${activeTab === 'feedbacks' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted'}`}
                            onClick={() => setActiveTab('feedbacks')}
                        >
                            Site Feedbacks ({feedbacks.length})
                        </button>
                        <button 
                            className={`flex-grow-1 py-3 border-0 bg-transparent fw-bold ${activeTab === 'questions' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted'}`}
                            onClick={() => setActiveTab('questions')}
                        >
                            Course FAQ ({questions.length})
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        activeTab === 'feedbacks' ? renderTable(feedbacks, false) : renderTable(questions, true)
                    )}
                </div>
            </div>

            {/* Create Feedback Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0">
                            <div className="modal-header border-0 pb-0 shadow-sm bg-white">
                                <h5 className="modal-title fw-bold">Create New {creationType === 'faq' ? 'Course FAQ' : 'Feedback'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-muted text-uppercase mb-2">I want to create:</label>
                                        <div className="d-flex gap-3">
                                            <button 
                                                type="button" 
                                                className={`btn flex-grow-1 ${creationType === 'feedback' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => {
                                                    setCreationType('feedback');
                                                    resetForm();
                                                }}
                                            >
                                                Site Feedback
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn flex-grow-1 ${creationType === 'faq' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => {
                                                    setCreationType('faq');
                                                    resetForm();
                                                }}
                                            >
                                                Course FAQ
                                            </button>
                                        </div>
                                    </div>

                                    {creationType === 'faq' ? (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Select Course (Optional for Global)</label>
                                                <select 
                                                    name="courseId" 
                                                    className="form-select border-2" 
                                                    onChange={handleInputChange}
                                                    value={formData.courseId}
                                                >
                                                    <option value="">-- Global FAQ --</option>
                                                    {courses.map(course => (
                                                        <option key={course._id} value={course._id}>{getLangText(course.title)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Question</label>
                                                <input 
                                                    type="text" 
                                                    name="question" 
                                                    className="form-control border-2" 
                                                    value={formData.question} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Answer</label>
                                                <textarea 
                                                    name="answer" 
                                                    className="form-control border-2" 
                                                    rows="4" 
                                                    value={formData.answer} 
                                                    onChange={handleInputChange} 
                                                    required
                                                ></textarea>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Select Student</label>
                                                <select 
                                                    name="studentSelect" 
                                                    className="form-select border-2" 
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">-- Select Student --</option>
                                                    <option value="Custom">Custom / Other</option>
                                                    {students.map(student => (
                                                        <option key={student._id} value={student._id}>
                                                            {student.name || student.username} ({student.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">User Name</label>
                                                <input 
                                                    type="text" 
                                                    name="name" 
                                                    className="form-control border-2" 
                                                    value={formData.name} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Role</label>
                                                <input 
                                                    type="text" 
                                                    name="userRole" 
                                                    className="form-control border-2" 
                                                    value={formData.userRole} 
                                                    onChange={handleInputChange} 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Rating (1-5)</label>
                                                <input 
                                                    type="number" 
                                                    name="rating" 
                                                    className="form-control border-2" 
                                                    min="1" max="5" 
                                                    value={formData.rating} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Feedback Message</label>
                                                <textarea 
                                                    name="comment" 
                                                    className="form-control border-2" 
                                                    rows="4" 
                                                    value={formData.comment} 
                                                    onChange={handleInputChange} 
                                                    required
                                                ></textarea>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0 bg-light-subtle">
                                    <button type="button" className="btn btn-outline-secondary px-4 fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm">Create {creationType === 'faq' ? 'FAQ' : 'Feedback'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
