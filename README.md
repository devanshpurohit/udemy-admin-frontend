# Udemy Admin Frontend

A modern React-based admin dashboard for managing courses, students, and analytics for the Udemy platform.

## Features

- **Dashboard Analytics**
  - Revenue tracking and charts
  - Course performance metrics
  - Student enrollment statistics
  - Real-time data visualization

- **Course Management**
  - Create and edit courses
  - Upload thumbnails and videos
  - Manage course content
  - Set pricing and availability
  - Track student progress

- **Student Management**
  - View student profiles
  - Track learning progress
  - Manage enrollments
  - Generate certificates

- **Authentication**
  - Secure login system
  - Email verification with OTP
  - Password reset functionality
  - Role-based access control

- **Announcement System**
  - Create targeted announcements
  - Schedule announcements
  - Track read status

- **Coupon Management**
  - Create discount coupons
  - Set usage limits
  - Track coupon performance

- **Certificate Management**
  - Generate certificates
  - Verify certificates
  - Download PDF certificates

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Bootstrap 5
- **Routing**: React Router DOM
- **Icons**: React Icons, Font Awesome
- **Charts**: ApexCharts
- **HTTP Client**: Axios (for API calls)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── assets/               # Images, CSS, JS files
│   │   ├── css/             # Stylesheets
│   │   ├── fonts/           # Font files
│   │   ├── images/          # Image assets
│   │   └── js/              # JavaScript files
│   ├── Componets/           # React components
│   │   ├── Auth/            # Authentication components
│   │   ├── Layouts/         # Layout components
│   │   └── Pages/           # Page components
│   ├── App.jsx              # Main App component
│   ├── Router.jsx           # Route configuration
│   ├── main.jsx             # Entry point
│   ├── App.css              # App styles
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Udemy Admin
```

## API Integration

The frontend is designed to work with the backend API. Make sure the backend server is running on `http://localhost:5000` before starting the frontend.

### API Endpoints Used

- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Students**: `/api/students/*`
- **Dashboard**: `/api/dashboard/*`
- **Announcements**: `/api/announcements/*`
- **Coupons**: `/api/coupons/*`
- **Certificates**: `/api/certificates/*`

## Pages Overview

### Authentication Pages
- **Login** (`/login`) - User login
- **Forgot Password** (`/forgot-password`) - Password reset
- **OTP Verification** (`/otp`) - Email verification
- **Set Password** (`/set-password`) - New password setup

### Main Dashboard
- **Dashboard** (`/`, `/dashboard`) - Main analytics dashboard
- **My Courses** (`/course`) - Course management
- **Student Management** (`/student-management`) - Student administration
- **Announcements** (`/announcement`) - Announcement management
- **Coupons** (`/coupon`) - Coupon management
- **Certificates** (`/certificate`) - Certificate management

### Course Management
- **New Course** (`/new-course`) - Create new course
- **Course Content** (`/course-content`) - Manage course lessons
- **Upload Thumbnail** (`/upload-thumbnail`) - Upload course thumbnail
- **Course Pricing** (`/course-pricing`) - Set course pricing
- **Add Quiz** (`/add-quiz`) - Create course quizzes

### Other Pages
- **Statements** (`/statement`) - Financial statements
- **Settings** (`/setting`) - Application settings
- **Student Profile** (`/student-profile`) - Student profile view

## Component Structure

### Layout Components
- **AppLayouts** - Main application layout with sidebar and header
- **LeftSidebar** - Navigation sidebar
- **TopHeader** - Header with user info and notifications

### Page Components
- **Dashboard** - Main dashboard with charts and stats
- **MyCourses** - Course listing and management
- **StudentManagement** - Student administration
- **NewCourses** - Course creation form
- And many more...

### Authentication Components
- **Login** - Login form
- **ForgotPassword** - Password reset form
- **Otp** - OTP verification
- **SetPassword** - New password form

## Styling

The application uses Bootstrap 5 for styling with custom CSS for specific components. The responsive design ensures the application works well on all device sizes.

## Charts and Visualizations

The dashboard uses ApexCharts for data visualization including:
- Revenue charts
- Enrollment trends
- Course performance metrics
- Student statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
