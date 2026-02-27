import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

function UploadThumbnail() {
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
                            <h3 className="fz-24">Create New Courses</h3>
                        </div>

                        <div className="">
                            <button className="lg-white-btn">Cancel <FontAwesomeIcon icon={faClose} /> </button>
                        </div>

                    </div>

                </div>

                <div className="row justify-content-center mb-3">
                    <div className="col-lg-10">
                        <div className="account-step-main-bx">
                            <NavLink to="/new-course">
                                <div className="account-step-crd account-step-one active-step">
                                    <div className="account-step-bx nw-step-bx ">
                                        <span className="account-step-icon nw-step-icon">1</span>
                                    </div>
                                    <h6>Basic Information</h6>
                                </div>
                            </NavLink>

                            <NavLink to="/course-content">
                                <div className="account-step-crd account-step-one active-step">
                                    <div className="account-step-bx nw-step-bx ">
                                        <span className="account-step-icon nw-step-icon">2</span>
                                    </div>
                                    <h6>Course Content</h6>
                                </div>
                            </NavLink>

                            <NavLink to="/upload-thumbnail">
                                <div className="account-step-crd account-step-one active-step">
                                    <div className="account-step-bx nw-step-bx ">
                                        <span className="account-step-icon nw-step-icon">3</span>
                                    </div>
                                    <h6>Media Asset</h6>
                                </div>
                            </NavLink>

                            <NavLink to="/course-pricing">
                                <div className="account-step-crd account-step-one">
                                    <div className="account-step-bx account-unstep-card">
                                        <span className="account-step-icon">4</span>
                                    </div>
                                    <h6>Pricing</h6>
                                </div>
                            </NavLink>

                            <NavLink to="/course-publish">
                                <div className="account-step-crd">
                                    <div className="account-step-bx account-unstep-card">
                                        <span className="account-step-icon">5</span>
                                    </div>
                                    <h6>Publish</h6>
                                </div>
                            </NavLink>
                        </div>

                    </div>

                </div>


                <div className="row">
                    <form action="">
                        <h3 className="innr-title ">Course Media</h3>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label htmlFor="" className="fw-500">Course Thumbnail</label>
                                <input type="text" className="form-control" placeholder="No File selected" readOnly />
                            </div>
                        </div>

                        <div className="col-lg-12">
                            <div className="custom-frm-bx">
                                <label htmlFor="">Upload Template</label>
                                <div class="upload-wrapper ">
                                    <input type="file" id="fileUpload" accept="application/pdf" hidden />

                                    <label for="fileUpload" class=" nw-upload-box">
                                        <span class="upload-btn">Upload</span>
                                        <p class="upload-text">JPEG, PNG, GIF, and WebP formats, up to 2 MB</p>
                                    </label>
                                </div>

                            </div>

                        </div>




                        <div className="col-lg-12">
                            <div className="mt-5 d-flex align-items-center justify-content-between">
                                <div>
                                    <button className="lg-thm-btn outline">Previous</button>
                                </div>
                                <div>
                                    <button className="lg-thm-btn ">Next</button>
                                </div>
                            </div>
                        </div>


                    </form>
                </div>




            </div>
        </>
    )
}

export default UploadThumbnail