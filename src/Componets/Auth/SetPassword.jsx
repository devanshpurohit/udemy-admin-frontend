import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'
// Add import
import authImage from '../assets/images/auth-image.png';

function SetPassword() {
    return (
        <>
            <section className="admin-login-section">
                <div className="container-fluid ">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 px-0 mb-sm-3 mb-lg-0">
                            <div className="admin-picture-box">
                               <img src={authImage} alt="Set Password" />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-sm-12 my-auto">
                            <div className="login-container">
                                <div className="login-header-content">
                                    <div className="lg_sub_content">
                                        <p>Secure Your Code</p>
                                        <h3>Set a new password</h3>
                                    </div>

                                    <form action="">

                                        <div className="custom-frm-bx">
                                            <input
                                                type="password"
                                                className="form-control profile-control pe-5"
                                                placeholder="Enter Password"
                                            />

                                            <div className="pass-toggle-box">
                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} /> </button>
                                            </div>
                                        </div>

                                        <div className="custom-frm-bx">
                                            <input
                                                type="password"
                                                className="form-control profile-control pe-5"
                                                placeholder="Enter Confirm Password"
                                            />

                                            <div className="pass-toggle-box">
                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} /> </button>
                                            </div>
                                        </div>



                                        <div className='lg_thm_bx'>
                                            <NavLink to="/login" className="lg-thm-btn w-100">
                                                Confirm
                                            </NavLink>

                                            <div className=''>
                                                <NavLink to="/otp" className='back-btn'>Back</NavLink>

                                            </div>

                                        </div>


                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SetPassword