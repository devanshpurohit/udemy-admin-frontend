import { useState, useEffect } from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosNotifications } from "react-icons/io";
import { IoBook } from "react-icons/io5";
import { getStoredUser, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";
import adminUsr from '../../assets/images/admin-usr.png';
import boyImg from '../../assets/images/boy.png';


function TopHeader() {
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
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
        window.addEventListener('userUpdated', getUserData);
        window.addEventListener('focus', getUserData);

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

        const fetchNotifications = async () => {
            try {
                const res = await notificationService.getNotifications();
                if (res.success) {
                    setNotifications(res.notifications);
                    setUnreadCount(res.notifications.filter(n => !n.isRead).length);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', getUserData);
            window.removeEventListener('focus', getUserData);
            menuBtn?.removeEventListener("click", handleMenuClick);
            closeBtns.forEach((btn) => btn.removeEventListener("click", handleClose));
            clearInterval(interval);
        };
    }, []); // Empty dependency array - only run once

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

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
                        className="tp-mobile-menu-btn d-lg-none me-lg-0 me-sm-3"
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
                                {unreadCount > 0 && (
                                    <div className="bell-nw-icon-alrt">
                                        <span className="bell-title">{unreadCount}</span>
                                    </div>
                                )}
                            </a>

                            <ul className="dropdown-menu notification-card p-0" aria-labelledby="userMenu">
                                <div className="notification-header">
                                    <h5 className="lg_title mb-0">Notifications</h5>
                                </div>

                                <div className="notification-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification._id} 
                                                className={`notification-parent-bx ${!notification.isRead ? 'unread-bg' : ''}`}
                                                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                                style={{ cursor: 'pointer', backgroundColor: !notification.isRead ? '#f0f7ff' : 'transparent' }}
                                            >
                                                <div>
                                                    <span className="notification-icon"><IoBook /> </span>
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: !notification.isRead ? '600' : 'normal' }}>
                                                        {notification.message}
                                                    </p>
                                                    <h6>{new Date(notification.createdAt).toLocaleString()}</h6>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center">
                                            <p className="mb-0">No new notifications</p>
                                        </div>
                                    )}
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
                                    {(() => {
                                        const rawImage = user?.profile?.profileImage;
                                        const defaultAvatar = boyImg;
                                        
                                        // If no image, or it's the default string, or picum placeholder
                                        if (!rawImage || rawImage === '/boy.png' || rawImage.includes('picsum.photos')) {
                                            return <img src={defaultAvatar} alt="Default" />;
                                        }

                                        // If it's already a full URL
                                        if (rawImage.startsWith('http')) {
                                            return <img src={rawImage} alt="Profile" />;
                                        }

                                        // Construct URL from backend base
                                        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
                                        const baseUrl = apiBase.replace('/api', '');
                                        const fullUrl = `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                                        
                                        return (
                                            <img 
                                                src={fullUrl} 
                                                alt="Profile" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = defaultAvatar;
                                                }}
                                            />
                                        );
                                    })()}
                                </div>
                            </a>

                            <ul
                                className="dropdown-menu dropdown-menu-end user-dropdown sallr-drop-box p-0"
                                aria-labelledby="userMenu"
                            >
                                <div className="profile-card-box">
                                    <div className="profile-top-section">
                                        {(() => {
                                            const rawImage = user?.profile?.profileImage;
                                            const defaultAvatar = boyImg; // Keep consistent with header
                                            
                                            let src;
                                            if (!rawImage || rawImage === '/boy.png' || rawImage.includes('picsum.photos')) {
                                                src = defaultAvatar;
                                            } else if (rawImage.startsWith('http')) {
                                                src = rawImage;
                                            } else {
                                                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';
                                                const baseUrl = apiBase.replace('/api', '');
                                                src = `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
                                            }
                                            
                                            return (
                                                <img
                                                    src={src}
                                                    alt="Profile"
                                                    className="profile-image"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = defaultAvatar;
                                                    }}
                                                />
                                            );
                                        })()}
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
