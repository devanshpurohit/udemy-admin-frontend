import { faEye, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback, useEffect } from 'react'
import { login } from '../../services/authService'

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const debounceTimeoutRef = useRef(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        console.log('🚨🚨🚨 LOGIN FORM SUBMITTED! 🚨🚨🚨');
        
        // Prevent page refresh
        e.stopPropagation();
        
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Debounce the login attempt
        debounceTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            setError('');

            // Manual test for debugging
            console.log('🧪 Manual localStorage test:');
            localStorage.setItem('test-user', JSON.stringify({username: 'test'}));
            console.log('🧪 Test item saved:', localStorage.getItem('test-user'));

            try {
                console.log('🚀 About to call login service...');
                const response = await login(formData);
                console.log('📥 Login service response:', response);
                
                if (response && response.success) {
                    console.log('✅ Login successful, checking user role...');
                    
                    // Check if user has admin role
                    const userRole = response.data?.user?.role || response.data?.data?.user?.role;
                    console.log('🔍 User role:', userRole);
                    
                    if (userRole !== 'admin') {
                        console.log('❌ Access denied: User is not admin');
                        setError('Access denied. Admin access required.');
                        setLoading(false);
                        return;
                    }
                    
                    console.log('✅ Admin access granted, navigating to dashboard...');
                    // Show success alert
                    alert('✅ ADMIN LOGIN SUCCESSFUL! Navigating to dashboard...');
                    // Use setTimeout to see logs before navigation
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    console.log('❌ Login failed:', response?.message);
                    setError(response?.message || 'Login failed');
                }
            } catch (err) {
                console.error('Login error:', err);
                // Provide more specific error message for rate limiting
                if (err.message?.includes('Too many requests')) {
                    setError(err.message);
                } else {
                    setError(err?.message || 'Login failed. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms debounce delay
    }, [formData, navigate]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <section className="admin-login-section">
                <div className="container-fluid ">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 px-0 mb-sm-3 mb-lg-0">
                            <div className="admin-picture-box">
                                <img src="/src/assets/images/auth-image.png" alt="Login" />
                            </div>
                        </div>

                        <div className="col-lg-6 col-md-12 col-sm-12 my-auto">
                            <div className="login-container">
                                <div className="login-header-content">
                                    <div className="lg_sub_content">
                                        <p>Welcome Back</p>
                                        <h3>Please log in with your authorized credentials to <span className='d-lg-block d-sm-inline'>continue.</span>  </h3>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        {error && (
                                            <div className="alert alert-danger">
                                                {error}
                                            </div>
                                        )}
                                        <div className="custom-frm-bx">
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="form-control profile-control pe-5"
                                                placeholder="Enter Username"
                                                autoComplete="username"
                                                required
                                            />

                                            <div className="pass-toggle-box">
                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faUser} /> </button>
                                            </div>

                                        </div>

                                        <div className="custom-frm-bx">
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="form-control profile-control pe-5"
                                                placeholder="Enter Password (min 6 characters)"
                                                autoComplete="current-password"
                                                required
                                            />

                                            <div className="pass-toggle-box">
                                                <button type="button" className="pass-eye-btn"> <FontAwesomeIcon icon={faEye} /> </button>
                                            </div>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <input type="checkbox" id="check1" className="custom-checkbox" />
                                                    <label htmlFor="check1" className='remember-lavel'>Remember Me</label>
                                                </div>
                                            </div>

                                            <div>
                                                <NavLink to="/forgot-password" className='reset-pass-btn'>Forgot Password</NavLink>
                                            </div>
                                        </div>

                                        <div className='lg_thm_bx'>
                                            <button 
                                                type="submit" 
                                                className="lg-thm-btn w-100" 
                                                disabled={loading}
                                                onClick={() => console.log('🔥🔥🔥 BUTTON CLICKED! 🔥🔥🔥')}
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
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

export default Login