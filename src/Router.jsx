import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Error from './Componets/Pages/Error';
import AppLayouts from './Componets/Layouts/AppLayouts';
import Dashboard from './Componets/Pages/Dashboard';
import MyCourses from './Componets/Pages/MyCourses';
import StudentManagement from './Componets/Pages/StudentManagement';
import Announcement from './Componets/Pages/Announcement';
import Coupon from './Componets/Pages/Coupon';
import SimpleWizard from './Componets/Pages/SimpleWizard';
import Certificate from './Componets/Pages/Certificate';
import NewCourses from './Componets/Pages/NewCourses';
import EditCourse from './Componets/Pages/EditCourse';
import CourseContent from './Componets/Pages/CourseContent';
import CourseMedia from './Componets/Pages/CourseMedia';
import CoursePublish from './Componets/Pages/CoursePublish';
import CoursePricing from './Componets/Pages/CoursePricing';
import UploadThumbnail from './Componets/Pages/UploadThumbnail';
import AddQuiz from './Componets/Pages/AddQuiz';
import Statements from './Componets/Pages/Statements';
import Settings from './Componets/Pages/Settings';
import StudentProfile from './Componets/Pages/StudentProfile';
import Profile from './Componets/Pages/Profile';
import LiveChat from "./Componets/Pages/AIChat";
import AICardGenerator from './Componets/Pages/AICardGenerator';
import SiteSettings from './Componets/Pages/SiteSettings';
import NewsletterSubscribers from './Componets/Pages/NewsletterSubscribers';
import Login from './Componets/Auth/Login';
import ForgotPassword from './Componets/Auth/ForgotPassword';
import Otp from './Componets/Auth/Otp';
import SetPassword from './Componets/Auth/SetPassword';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayouts />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/my-courses",
        element: <MyCourses />,
      },
      {
        path: "/course",
        element: <MyCourses />,
      },
      {
        path: "/ai-chat",
        element: <LiveChat />,
      },
      {
        path: "/student-management",
        element: <StudentManagement />,
      },
      {
        path: "/announcement",
        element: <Announcement />,
      },
      {
        path: "/coupon",
        element: <Coupon />,
      },
      {
        path: "/certificate",
        element: <Certificate />,
      },
      {
        path: "/new-course",
        element: <NewCourses />,
      },
      {
        path: "/simple-wizard",
        element: <SimpleWizard />,
      },
      {
        path: "/new-course/:courseId",
        element: <NewCourses />,
      },
      {
        path: "/edit-course/:id",
        element: <EditCourse />,
      },
      {
        path: "/course-content",
        element: <CourseContent />,
      },
      {
        path: "/course-content/:courseId",
        element: <CourseContent />,
      },
      {
        path: "/course-media",
        element: <CourseMedia />,
      },
      {
        path: "/course-media/:courseId",
        element: <CourseMedia />,
      },
      {
        path: "/course-pricing",
        element: <CoursePricing />,
      },
      {
        path: "/course-pricing/:courseId",
        element: <CoursePricing />,
      },
      {
        path: "/course-publish/:courseId",
        element: <CoursePublish />,
      },
      {
        path: "/upload-thumbnail",
        element: <UploadThumbnail />,
      },
      {
        path: "/add-quiz",
        element: <AddQuiz />,
      },
      {
        path: "/statement",
        element: <Statements />,
      },
      {
        path: "/setting",
        element: <Settings />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/student-profile/:id",
        element: <StudentProfile />,
      },
      {
        path: "/ai-card-generator",
        element: <AICardGenerator />,
      },
      {
        path: "/site-settings",
        element: <SiteSettings />,
      },
      {
        path: "/newsletter",
        element: <NewsletterSubscribers />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/otp",
    element: <Otp />,
  },
  {
    path: "/set-password",
    element: <SetPassword />,
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
