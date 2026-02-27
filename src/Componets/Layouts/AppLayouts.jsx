import { Outlet, useLocation, Navigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import TopHeader from "./TopHeader";
import { isLoggedIn, getStoredUser } from "../../services/authService";

function AppLayouts() {
  const location = useLocation();
  const path = location.pathname;

  const staticRoute = [
    "/login",
    "/forgot-password",
    "/otp",
    "/set-password",
  ];

  const isProtectedRoute = !staticRoute.includes(path);
  const userLoggedIn = isLoggedIn();
  const currentUser = getStoredUser();

  // Check user role for protected routes
  if (isProtectedRoute && userLoggedIn && currentUser?.role !== 'admin') {
    console.log('❌ Access denied: User is not admin');
    return <Navigate to="/login" replace />;
  }

  if (isProtectedRoute && !userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isProtectedRoute && userLoggedIn && path === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="all-tp-main-section d-flex">
      {!staticRoute.includes(path) && <LeftSidebar />}
      
      <div className="dashboard-right-side">
        {!staticRoute.includes(path) && <TopHeader />}
        
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayouts;