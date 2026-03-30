import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCourse, updateCourse } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";
import { toast } from "react-toastify";
import { getLangText } from "../../utils/languageUtils";
import "./CourseImageUpload.css";

function EditCourse() {
    const [courseId, setCourseId] = useState('');
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
        tags: "#HTML #CSS #React #Web Development",
        courseImage: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [courseImageFile, setCourseImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Get course ID from URL
        const pathParts = window.location.pathname.split('/');
        const id = pathParts[pathParts.length - 1];
        setCourseId(id);

        // Fetch course data
        fetchCourseData(id);
    }, []);

    const fetchCourseData = async (id) => {
        try {
            const response = await getCourse(id);
            if (response.success) {
                const course = response.data.course;
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
                    tags: course.tags ? course.tags.join(' #') : "#HTML #CSS #React #Web Development",
                    courseImage: course.courseImage || course.thumbnail || '',
                    status: course.status || 'draft'
                });
                setImagePreview(course.courseImage || course.thumbnail || '');
            } else {
                setError('Course not found');
            }
        } catch (err) {
            setError('Failed to load course data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (name.includes('_')) {
            const [field, lang] = name.split('_');
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [lang]: value
                }
            }));
        } else if (type === 'number') {
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
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
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setCourseImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                setImagePreview(base64Image);
                setFormData({
                    ...formData,
                    courseImage: base64Image
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const courseData = {
                ...formData,
                tags: formData.tags.split('#').filter(tag => tag.trim()).map(tag => tag.trim()),
                requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
                whatYouWillLearn: Array.isArray(formData.whatYouWillLearn) ? formData.whatYouWillLearn : []
            };

            const response = await updateCourse(courseId, courseData);
            
            if (response.success) {
                setSuccess('Course updated successfully!');
            } else {
                setError(response.message || 'Failed to update course');
            }
        } catch (err) {
            setError(err.message || 'Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading course data...</p>
                </div>
            </div>
        );
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
                                            <NavLink to="/course" className="breadcrumb-link">
                                                Courses
                                            </NavLink>
                                        </li>
                                        <li
                                            className="breadcrumb-item active"
                                            aria-current="page"
                                        >
                                            Edit Course
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h3 className="fz-24">Edit Course</h3>
                        </div>

                        <div className="">
                            <NavLink to="/course" className="lg-white-btn">
                                Cancel <FontAwesomeIcon icon={faClose} /> 
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <form onSubmit={handleSubmit}>
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
                        <h3 className="innr-title">Course Information</h3>

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
                                        required
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
                                        required
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
                                        required
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
                                        required
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

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Category</label>
                                <select 
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="development">Development</option>
                                    <option value="business">Business</option>
                                    <option value="design">Design</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="it-software">IT & Software</option>
                                    <option value="personal-development">Personal Development</option>
                                    <option value="health-fitness">Health & Fitness</option>
                                    <option value="music">Music</option>
                                    <option value="academics">Academics</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Course Status</label>
                                <select 
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Price</label>
                                <input 
                                    type="number" 
                                    name="price"
                                    className="form-control" 
                                    placeholder="Course Price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Duration (months)</label>
                                <input 
                                    type="number" 
                                    name="duration"
                                    className="form-control" 
                                    placeholder="Course Duration in months"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    min="1"
                                    max="24"
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Course Image</label>
                                <div className="image-upload-container">
                                    <input 
                                        type="file" 
                                        id="courseImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="courseImage" className="image-upload-label">
                                        {imagePreview ? (
                                            <img 
                                                src={imagePreview} 
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
                                                <i className="fas fa-cloud-upload-alt"></i>
                                                <p>Click to upload course image</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="text-end mt-3">
                                <button type="submit" className="lg-thm-btn" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Course'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditCourse;
