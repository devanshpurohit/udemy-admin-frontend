import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightToBracket, faClose, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { RiHome2Fill } from "react-icons/ri";
import { PiStudentFill } from "react-icons/pi";
import { BiSolidOffer } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";
import { FaCartShopping } from "react-icons/fa6";
import { PiCertificateFill } from "react-icons/pi";
import { IoSettingsSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function LeftSidebar() {
    const navigate = useNavigate();
    const handleLogout = () => {
    // 1️⃣ Remove token
    localStorage.removeItem("token");

    // Agar user info save kar rahe ho to:
    localStorage.removeItem("user");

    // 2️⃣ Redirect to login
    navigate("/login");
};

    return (
        <>
            <div className="dashboard-left-side text-white min-vh-100 flex-shrink-0">
                <div className="text-end admn-mob-close-bx">
                    <NavLink
                        href="#"
                        className="d-lg-none tp-mobile-close-btn modal-close-btn"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </NavLink>
                </div>

                <div className="task-vendr-left-title-bx p-3">
                    <div className="dashboard-logo-tp ">
                        <h4 className="mb-0">
                            <NavLink to="/" className="dash-hp-title">
                                <h5>Logo</h5>
                            </NavLink>
                        </h4>
                    </div>
                </div>

                <div className="d-flex flex-column p-3">
                    <div className="left-navigation flex-grow-1 overflow-auto">

                        <ul className="nav flex-column sidebar-nav">
                            <h6 className="mb-0">Navigation</h6>

                            <li className="nav-item">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active-nav" : ""}`
                                    }
                                >
                                    <RiHome2Fill className="fa-lg" />
                                    Dashboard
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/course" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <FaBook className="fa-lg" />
                                    Courses
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/student-management" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <PiStudentFill className="fa-lg" />
                                    Students Management
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/coupon" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <BiSolidOffer className="fa-lg" />
                                    Coupons
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/announcement" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <AiFillSound className="fa-lg" />
                                    Announcement
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/ai-chat" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <FaRobot className="fa-lg" />
                                    Live Chat
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/statement" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <FaCartShopping className="fa-lg" />
                                    Statements
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/certificate" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <PiCertificateFill className="fa-lg" />
                                    Certificate
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/profile" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <FontAwesomeIcon icon={faUser} className="fa-lg" />
                                    Profile
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/setting" className={({ isActive }) =>
                                    `nav-link ${isActive ? "active-nav" : ""}`
                                }>
                                    <IoSettingsSharp className="fa-lg" />
                                    Setting
                                </NavLink>
                            </li>

                            {/* Logout */}
                            <li className="nav-item">
                                <a
                                    href="#"
                                    className="nav-link"
                                    data-bs-toggle="modal"
                                    data-bs-target="#logout"
                                >
                                    <FontAwesomeIcon icon={faArrowRightToBracket} className="fa-lg" />
                                    Logout
                                </a>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>

            {/*Logout Popup Start  */}
            <div className="modal step-modal fade" id="logout" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1"
                aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-md">
                    <div className="modal-content custom-modal-box">
                        <div className="text-end">
                            <button type="button" className="modal-close-btn" data-bs-dismiss="modal" aria-label="Close">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        </div>
                        <div className="modal-body pt-0">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="logout-bx text-center" >
                                        <span className="logout-icon"><FiLogOut /></span>
                                        <p className="py-2">Are you sure you want to log out of your account?</p>

                                        <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                                            <button className="thm-lg-dg-btn outline" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                                           <button
    className="thm-lg-dg-btn"
    data-bs-dismiss="modal"
    onClick={handleLogout}
>
    Logout
</button>

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*  Logout Popup End */}

        </>
    )
}

export default LeftSidebar