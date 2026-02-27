import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCourse, updateCourse } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";
import "./CourseImageUpload.css";

function EditCourse() {
    const [courseId, setCourseId] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'development',
        level: 'beginner',
        price: 99.99,
        duration: 3,
        language: 'English',
        requirements: [],
        whatYouWillLearn: [],
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
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || 'development',
                    level: course.level || 'beginner',
                    price: course.price || 99.99,
                    duration: course.duration || 3,
                    language: course.language || 'English',
                    requirements: course.requirements || [],
                    whatYouWillLearn: course.whatYouWillLearn || [],
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
        
        if (type === 'number') {
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0
            });
        } else if (name === 'requirements' || name === 'whatYouWillLearn') {
            setFormData({
                ...formData,
                [name]: value.split('\n').filter(item => item.trim())
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
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

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label className="fw-500">Course Title</label>
                                <input 
                                    type="text" 
                                    name="title"
                                    className="form-control" 
                                    placeholder="Enter Course Title" 
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label>Course Description</label>
                                <textarea 
                                    name="description"
                                    className="form-control text-form" 
                                    placeholder="Describe What student learn with this course"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
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
