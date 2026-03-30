import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { FaPlus } from "react-icons/fa";
import { FaMoneyBill } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { FaStar } from "react-icons/fa";
import Chart from "react-apexcharts";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../../services/dashboardService";
import { getCourses } from "../../services/courseService";
import { getStoredUser } from "../../services/authService";
import { getStudents } from "../../services/studentService";
import { getLangText } from "../../utils/languageUtils";

const getImageUrl = (url) => {
    if (!url) return "/pic_01.jpg";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api').replace('/api', '');
    let cleanPath = url.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${baseUrl}${cleanPath}`;
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState(null);
    const [studentsData, setStudentsData] = useState([]);

    useEffect(() => {
        // Get logged-in user data
        const userData = getStoredUser();
        console.log('Dashboard - Getting user data:', userData);
        setUser(userData);
        
        // Fetch dashboard stats
        fetchDashboardStats();
        
        // Fetch courses
        fetchCourses();
        
        // Fetch students
        fetchStudents();
        
        // Listen for storage changes to sync across components
        const handleStorageChange = (e) => {
            console.log('Dashboard - Storage change detected:', e.key, e.newValue);
            if (e.key === 'user') {
                const userData = getStoredUser();
                setUser(userData);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();
            console.log('Dashboard - Stats response:', response);
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setStats({
                totalRevenue: 0,
                averageRating: 4.5,
                monthlyRevenue: [210, 170, 195, 215, 255, 220, 280, 160, 120, 140, 165],
                coursePerformance: [40, 60]
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await getCourses();
            if (response.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await getStudents({ limit: 1000 }); // Get all students
            console.log('Dashboard - Students response:', response);
            if (response.success) {
                setStudentsData(response.data.students || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const options = {
        chart: {
            type: "bar",
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                borderRadiusApplication: "end",
                columnWidth: "45%"
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ["#2172CF"],
        xaxis: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May",
                "June", "July", "Aug", "Sep", "Nov", "Dec"
            ]
        },
        yaxis: {
            tickAmount: 5
        }
    };

    const series = [
        {
            name: "Sales",
            data: stats?.monthlyRevenue || [210, 170, 195, 215, 255, 220, 280, 160, 120, 140, 165]
        }
    ];

    const optionsNew = {
        labels: ["Enrollment", "Revenue"],
        colors: ["#5B6B79", "#6293FF"],
        legend: { show: false },
        dataLabels: {
            formatter: (val) => `${Math.round(val)}%`,
        }
    };

    const seriesNew = stats?.coursePerformance || [40, 60];

    return (
        <>
            <div className="main-content flex-grow-1 p-3 overflow-auto">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row justify-content-between mb-2">
                            <div>
                                <h3 className="lg_title">Welcome, {user?.profile?.firstName || user?.username || 'Admin'}!</h3>
                                <p className="text-muted">Here's what's happening with your courses today</p>
                            </div>
                            <div className="col-lg-3">
                               
                            </div>

                            <div className="col-lg-4">
                                <div className="text-end">
                                    <NavLink to="/new-course" className="thm-btn"><FaPlus />  Create New Course   </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                <div className="earning-box">
                                    <div className="earning-sub-box">
                                        <div>
                                            <span className="icon-card"> <FaMoneyBill />  </span>
                                        </div>
                                        <div className="earn-content">
                                            <p>Total Earning</p>
                                            <div className="ammount-content">
                                                <h6>${stats?.totalRevenue || 0}</h6>
                                                <h5>0%</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                <div className="earning-box">
                                    <div className="earning-sub-box ">
                                        <div>
                                            <span className="icon-card active-icon-card"> <FaBook /></span>
                                        </div>
                                        <div className="earn-content">
                                            <p>Active Course</p>
                                            <div className="ammount-content active-ammount-content">
                                                <h6>{courses.filter(course => course.status === 'published').length || 0}</h6>
                                                <h5>10.6%</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                <div className="earning-box">
                                    <div className="earning-sub-box ">
                                        <div>
                                            <span className="icon-card student-icon"> <PiStudentBold /> </span>
                                        </div>
                                        <div className="earn-content">
                                            <p>Total Students</p>
                                            <div className="ammount-content student-content">
                                                <h6>{studentsData.length || 0}</h6>
                                                <h5>30.6%</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
                                <div className="earning-box">
                                    <div className="earning-sub-box ">
                                        <div>
                                            <span className="icon-card rating-icon"> <FaStar />
                                            </span>
                                        </div>
                                        <div className="earn-content">
                                            <p>Average Rating</p>
                                            <div className="ammount-content">
                                                <h6>{stats?.averageRating || 4.5}</h6>
                                                <h5>10.6%</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-lg-6 mb-3">
                                <div className="chart-card">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="innr-title mb-0">Course Sales Graph</h4>
                                        <div className="">
                                            <select className="chart-month">
                                                <option>Monthly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Chart options={options} series={series} type="bar" height={320} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 mb-3">
                                <div className="chart-card">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="innr-title mb-0">Course Performance</h4>
                                        <div>
                                            <select className="chart-month">
                                                <option>Monthly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Chart options={optionsNew} series={seriesNew} type="pie" height={260} />
                                    <div className="bottom-cards">
                                        <div className="info-card">
                                            <p className="enroll-title">Enrollment</p>
                                            <h5>{(stats?.coursePerformance?.[0] || 0)}%</h5>
                                        </div>
                                        <div className="info-card">
                                            <p className="revenue-title">Revenue</p>
                                            <h5>{(stats?.coursePerformance?.[1] || 0)}%</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="table-section">
                                    <h5 className="innr-title mb-0">Top Popular Courses</h5>
                                    <div className="table table-responsive mb-0">
                                        <table className="table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>S.No</th>
                                                    <th>Course </th>
                                                    <th>Students</th>
                                                    <th>Revenue</th>
                                                    <th>Rating</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courses
                                                    .slice(0, 5)
                                                    .map((course, index) => (
                                                    <tr key={course._id}>
                                                        <td>{index + 1}.</td>
                                                        <td>
                                                            <div className="admin-table-bx">
                                                                <div className="admin-table-sub-bx">
                                                                    <img 
                                                                        src={getImageUrl(course.courseImage || course.thumbnail)} 
                                                                        alt={getLangText(course.title)}
                                                                        style={{ 
                                                                            width: '60px', 
                                                                            height: '60px', 
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                    />
                                                                    <div className="admin-table-sub-details doctor-title">
                                                                        <h6>{getLangText(course.title)}</h6>
                                                                        <p>{course.category} - {course.level}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                         <td>{course.students || course.totalEnrollments || 0}</td>
                                                        <td>${course.price || 0}</td>
                                                        <td>{course.rating || 4.5}</td>
                                                        <td>
                                                            <span className="public-title">{course.status || 'Published'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default Dashboard
