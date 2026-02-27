import { NavLink } from 'react-router-dom'

function Otp() {
    return (
        <>
            <section className="admin-login-section">
                <div className="container-fluid ">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 px-0 mb-sm-3 mb-lg-0">
                            <div className="admin-picture-box">
                                <img src="/src/assets/images/auth-image.png" alt="OTP" />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-sm-12 my-auto">
                            <div className="login-container">
                                <div className="login-header-content">
                                    <div className="lg_sub_content">
                                        <p>Verification Code</p>
                                        <h3>We sent OTP to your given email address </h3>
                                        <h6>XYZ@gmail.com</h6>
                                    </div>

                                    <form action="">
                                        <div className="otp-wrapper custom-frm-bx">
                                            <input type="number" className="otp-input" />
                                            <input type="number" className="otp-input" />
                                            <input type="number" className="otp-input" />
                                            <input type="number" className="otp-input" />
                                        </div>

                                        <div className='lg_thm_bx'>
                                            <NavLink to="/set-password" className="lg-thm-btn w-100">
                                                Submit
                                            </NavLink>

                                            <div className=''>
                                                <NavLink to="/forgot-password" className='back-btn'>Back</NavLink>

                                            </div>

                                            <div className='resend-content'>
                                                <p>Didn’t receive the code? <span> <a href="javascript:void(0)" className='resend-btn'>Resend</a> </span> <span className='resend-time'>in 30s</span> </p>
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

export default Otp