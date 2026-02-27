import { useState, useEffect } from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosNotifications } from "react-icons/io";
import { IoBook } from "react-icons/io5";
import { getStoredUser, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import adminUsr from '../../assets/images/admin-usr.png';


function TopHeader() {
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get user data on component mount and when localStorage changes
        const getUserData = () => {
            const userData = getStoredUser();
            console.log('TopHeader - Getting user data:', userData);
            setUser(userData);
        };

        getUserData();

        // Listen for storage changes
        const handleStorageChange = (e) => {
            console.log('TopHeader - Storage change detected:', e.key, e.newValue);
            if (e.key === 'user') {
                getUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        let overlay = document.querySelector(".mobile-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.classList.add("mobile-overlay");
            document.body.appendChild(overlay);
        }

        const dashboard = document.querySelector(".dashboard-left-side");
        const menuBtn = document.querySelector(".tp-mobile-menu-btn");
        const closeBtns = document.querySelectorAll(
            ".tp-mobile-close-btn, .mobile-overlay",
        );

        const handleMenuClick = (e) => {
            e.preventDefault();
            if (window.innerWidth < 992) {
                dashboard.classList.add("mobile-show");
                overlay.classList.add("show");
            }
        };

        const handleClose = () => {
            dashboard.classList.remove("mobile-show");
            overlay.classList.remove("show");
        };

        menuBtn?.addEventListener("click", handleMenuClick);
        closeBtns.forEach((btn) => btn.addEventListener("click", handleClose));

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            menuBtn?.removeEventListener("click", handleMenuClick);
            closeBtns.forEach((btn) => btn.removeEventListener("click", handleClose));
        };
    }, []); // Empty dependency array - only run once

    // Handle logout with React Router
    const handleLogout = () => {
        console.log('TopHeader - Logging out, clearing user data');
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="tp-header-section d-flex align-items-center justify-content-between w-100 py-2 px-3">
                <div className="dash-vendr-header-left-bx">
                    <a
                        href="#"
                        className="tp-mobile-menu-btn me-lg-0 me-sm-3"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen((prev) => !prev);
                        }}
                    >
                        <FontAwesomeIcon icon={faBars} className="fa-lg" />
                        {/* <FontAwesomeIcon icon={faChevronLeft} className="fa-lg" /> */}
                        {/* <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} className="fa-lg" /> */}
                    </a>
                </div>

                <div className="">
                    <div className="tp-right-admin-bx d-flex align-items-center">
                        <div className="position-relative">
                            {/* <a href="javascript:void(0)" className="tp-bell-icon fz-24">
                                <IoIosNotifications className="" />
                                <div className="bell-nw-icon-alrt">
                                    <span className="bell-title">9</span>
                                </div>
                            </a> */}

                            <a
                                href="javascript:void(0)"
                                className="tp-bell-icon fz-24"
                                id="userMenu"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <IoIosNotifications className="" />
                                <div className="bell-nw-icon-alrt">
                                    <span className="bell-title">9</span>
                                </div>
                            </a>

                            <ul className="dropdown-menu notification-card p-0" aria-labelledby="userMenu">
                                <div className="notification-header">
                                    <h5 className="lg_title mb-0">Notifications</h5>
                                </div>

                                <div className="notification-content">
                                    <div className="notification-parent-bx">
                                        <div>
                                            <span className="notification-icon"><IoBook /> </span>
                                        </div>
                                        <div>
                                            <p>New Course Purchase #ORD123456 has been placed.</p>
                                            <h6>26,july 2026</h6>
                                        </div>

                                    </div>

                                    <div className="notification-parent-bx">
                                        <div>
                                            <span className="notification-icon"><IoBook /> </span>
                                        </div>
                                        <div>
                                            <p>New Course Purchase #ORD123456 has been placed.</p>
                                            <h6>26,july 2026</h6>
                                        </div>

                                    </div>
                                    <div className="notification-parent-bx">
                                        <div>
                                            <span className="notification-icon"><IoBook /> </span>
                                        </div>
                                        <div>
                                            <p>New Course Purchase #ORD123456 has been placed.</p>
                                            <h6>26,july 2026</h6>
                                        </div>

                                    </div>

                                </div>

                                <div className="notification-footer">
                                    <div className="text-center">
                                        <button className="thm-btn">See All Notifications </button>

                                    </div>
                                </div>



                            </ul>
                        </div>

                        <div className="header-user dropdown tp-right-admin-details d-flex align-items-center">
                            <a
                                href="#"
                                className="user-toggle d-flex align-items-center"
                                id="userMenu"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <div className="admn-icon me-2">
                                    <img src={user?.profile?.profileImage && user?.profile?.profileImage.startsWith('http') ? user?.profile?.profileImage : (user?.profile?.profileImage ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}${user?.profile?.profileImage}` : adminUsr)} alt="" />
                                </div>
                            </a>

                            <ul
                                className="dropdown-menu dropdown-menu-end user-dropdown sallr-drop-box p-0"
                                aria-labelledby="userMenu"
                            >
                                <div className="profile-card-box">
                                    <div className="profile-top-section">
                                        <img
                                            src={user?.profile?.profileImage && user?.profile?.profileImage.startsWith('http') ? user?.profile?.profileImage : (user?.profile?.profileImage ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://udemy-latest-backend-1.onrender.com'}${user?.profile?.profileImage}` : adminUsr)}
                                            alt="Profile"
                                            className="profile-image"
                                        />
                                        <div className="profile-info">
                                            <span className="profile-role">{user?.role?.toUpperCase() || 'USER'}</span>
                                            <h4 className="profile-name">{user?.profile?.firstName || user?.username || 'Admin'}</h4>
                                            <p className="profile-id">ID : {user?._id?.slice(-6) || user?.id?.slice(-6) || '998787'}</p>
                                        </div>
                                    </div>
                                    <div className="profile-logout-box">
                                        <a href="#" className="logout-btn" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                                            <i className="fas fa-sign-out-alt"></i> Logout
                                        </a>
                                    </div>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TopHeader;
