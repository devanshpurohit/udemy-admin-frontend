import {
  faArrowLeft,
  faRocket,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getCourseDraft,
  validateCourse,
  publishCourse
} from "../../services/courseService";

function CoursePublish() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // 🔹 Safe number formatter
  const formatPrice = (value) =>
    typeof value === "number" ? value.toFixed(2) : "0.00";

  // 🔹 Load course data
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await getCourseDraft(courseId);
        if (res.success) {
          setCourse(res.data);
        } else {
          setError("Failed to load course.");
        }
      } catch (err) {
        setError("Error loading course.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // 🔹 Publish handler
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError("");
      setSuccess("");

      // Step 1: Validate
      const validationRes = await validateCourse(courseId);

      if (!validationRes.success) {
        setValidationErrors(validationRes.validationErrors || []);
        setPublishing(false);
        return;
      }

      // Step 2: Publish
      const publishRes = await publishCourse(courseId);

      if (publishRes.success) {
        setSuccess("Course published successfully!");
        setTimeout(() => navigate("/course"), 2000);
      } else {
        setError(publishRes.message || "Publish failed.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!course) return <div className="p-4 text-danger">Course not found.</div>;

  return (
    <div className="main-content flex-grow-1 p-3">
      <h3 className="mb-4">Publish Course</h3>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-warning">
          <strong>Please fix these issues:</strong>
          <ul>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Summary */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>{course.title}</h4>
          <p className="text-muted">{course.description}</p>

          <div className="d-flex gap-3 mb-3">
            <span className="badge bg-primary">
              {course.lessons?.length || 0} Lessons
            </span>
            <span className="badge bg-success">
              {course.duration} Months
            </span>
            <span className="badge bg-info">{course.level}</span>
          </div>

          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt="thumbnail"
              style={{ maxHeight: 150 }}
              className="img-fluid rounded"
            />
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <span>Regular Price:</span>
            <strong>${formatPrice(course.price)}</strong>
          </div>

          <div className="d-flex justify-content-between">
            <span>Discounted Price:</span>
            <strong className="text-success">
              ${formatPrice(course.discountedPrice)}
            </strong>
          </div>

          <hr />

          <div className="text-center">
            <h4>
              $
              {formatPrice(
                course.discountedPrice &&
                  course.discountedPrice < course.price
                  ? course.discountedPrice
                  : course.price
              )}
            </h4>
            <small>Final Price</small>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/course-pricing/${courseId}`)}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <button
          className="btn btn-success"
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? (
            "Publishing..."
          ) : (
            <>
              <FontAwesomeIcon icon={faRocket} /> Publish Course
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CoursePublish;
