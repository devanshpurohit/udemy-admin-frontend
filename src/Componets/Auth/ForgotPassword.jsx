import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'
import authImage from '../../assets/images/auth-image.png';

function ForgotPassword() {
    return (
        <>
            <section className="admin-login-section">
                <div className="container-fluid px-0">
                    <div className="row g-0">
                        <div className="col-lg-6 col-md-12 col-sm-12 px-0 mb-sm-3 mb-lg-0">
                            <div className="admin-picture-box">
                                <img src={authImage} alt="forgot Password" />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-sm-12 my-auto">
                            <div className="login-container">
                                <div className="login-header-content">
                                    <div className="lg_sub_content">
                                        <p>Forgot Password</p>
                                        <h3>Enter your email address for varification </h3>
                                    </div>

                                    <form action="">
                                        <div className="custom-frm-bx">
                                            <input
                                                type="email"
                                                className="form-control profile-control pe-5"
                                                placeholder="Enter Email Address"
                                            />

                                            <div className="pass-toggle-box">
                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEnvelope} /> </button>
                                            </div>

                                        </div>

                                        <div className='lg_thm_bx'>
                                            <NavLink to="/otp" className="lg-thm-btn w-100">
                                                Continue
                                            </NavLink>

                                            <div className=''>
                                                <NavLink to="/login" className='back-btn'>Back</NavLink>
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

export default ForgotPassword