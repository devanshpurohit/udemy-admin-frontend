import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

function AddQuiz() {
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
                                            <NavLink to="/course-content" className="breadcrumb-link">
                                                New Courses
                                            </NavLink>
                                        </li>
                                        <li className="breadcrumb-item active" aria-current="page">
                                            Add Quiz
                                        </li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="fz-24">Quiz Questions</h3>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="question-box">
                            <div className="custom-frm-bx-second">
                                <div className="d-flex align-items-center justify-content-between">
                                    <label htmlFor="">Q1 Enter Question</label>
                                    <button className="course-delete-btn">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name=""
                                    id=""
                                    className="form-control"
                                    placeholder="What does HTML stand for?"
                                />
                            </div>

                            <div class="row level-box">
                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Hyper Text Markup Language"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Hyper Tool Multi Language"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Hyper Trainer Marking Language"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="High Text Machine Language"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-12">
                        <div className="question-box">
                            <div className="custom-frm-bx-second">
                                <div className="d-flex align-items-center justify-content-between">
                                    <label htmlFor="">Q1 Enter Question</label>
                                    <button className="course-delete-btn">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name=""
                                    id=""
                                    className="form-control"
                                    placeholder="Enter Your Question"
                                />
                            </div>

                            <div class="row level-box">
                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Option A"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Option B"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Option C"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div className="custom-frm-bx">
                                        <label class="custom-radio w-100">
                                            <input type="radio" name="question1" />
                                            <span class="checkmark"></span>
                                            <input
                                                type="text"
                                                class="form-control option-input"
                                                value="Option D"
                                                readonly
                                            />
                                        </label>
                                    </div>
                                </div>



                            </div>
                        </div>
                    </div>

                    <div className="col-lg-12">
                        <div>
                            <button className="add-more-btn"> <FaPlus /> Add More Question</button>
                        </div>

                        <div className="text-end mt-4">
                            <button className="lg-thm-btn">Submit</button>
                        </div>

                    </div>



                </div>
            </div>
        </>
    );
}

export default AddQuiz;
