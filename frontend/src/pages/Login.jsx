import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setDemoUsers(response.data || []);
      } catch (err) {
        console.error('Failed to fetch demo users', err);
      }
    };
    fetchUsers();
  }, []);

  const handleQuickLogin = (selectedUser) => {
    const emailKey = selectedUser.email.toLowerCase().trim();
    setEmail(selectedUser.email);
    
    // Look up saved password in localStorage
    const savedPassword = localStorage.getItem(`demo_pass_${emailKey}`);
    if (savedPassword) {
      setPassword(savedPassword);
    } else {
      // Fallback default passwords for pre-seeded users
      if (selectedUser.role === 'ROLE_ADMIN') {
        setPassword('admin123');
      } else if (selectedUser.role === 'ROLE_ORGANIZER') {
        setPassword('organizer123');
      } else {
        setPassword('user123');
      }
    }
  };

  // Mouse Tilt Gesture State
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Normalize coordinates for subtle rotation
    const rotateX = -(y / (box.height / 2)) * 4; // Max 4 degrees
    const rotateY = (x / (box.width / 2)) * 4;  // Max 4 degrees
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-in-out'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'ROLE_ORGANIZER') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden grid-bg">
      {/* Background visual blobs */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-teal-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>

      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="w-full max-w-md space-y-6 glass-panel p-8 rounded-3xl shadow-2xl animate-fade-in-up border border-slate-200/50 dark:border-slate-800/80 animate-glow-border preserve-3d"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-650 dark:text-teal-400 mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-gradient">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Sign in to access your bookings, tickets, and event controls.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-650 dark:text-red-400 transition-all duration-300">
            {error}
          </div>
        )}

        {/* Quick Demo Accounts Helper */}
        {demoUsers.length > 0 && (
          <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1">
              💡 Click to Autofill Demo Account
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 max-h-32">
              {demoUsers.map((u) => {
                let roleLabel = "Attendee";
                if (u.role === 'ROLE_ADMIN') roleLabel = "Admin";
                if (u.role === 'ROLE_ORGANIZER') roleLabel = "Organizer";

                const emailKey = u.email.toLowerCase().trim();
                const savedPassword = localStorage.getItem(`demo_pass_${emailKey}`);
                let displayPass = savedPassword;
                if (!displayPass) {
                  if (u.role === 'ROLE_ADMIN') displayPass = 'admin123';
                  else if (u.role === 'ROLE_ORGANIZER') displayPass = 'organizer123';
                  else displayPass = 'user123';
                }

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/10 dark:hover:bg-teal-950/20 transition-all group shrink-0 min-w-[130px] max-w-[170px] hover:scale-[1.03]"
                    title={`Email: ${u.email} | Password: ${displayPass}`}
                  >
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350 truncate w-full text-center">
                      {u.name}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 truncate w-full text-center">
                      {u.email}
                    </span>
                    <span className="text-[8px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Pass: {displayPass}
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-1.5 tracking-wider uppercase ${
                      u.role === 'ROLE_ADMIN' 
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                        : u.role === 'ROLE_ORGANIZER' 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-teal-500/10 text-teal-650 dark:text-teal-400'
                    }`}>
                      {roleLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 placeholder-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                placeholder="Email address"
              />
              <label
                htmlFor="email-address"
                className="absolute left-10 top-3.5 origin-[0] transform -translate-y-4 scale-75 text-slate-400 dark:text-slate-500 duration-300 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-teal-500 text-sm"
              >
                Email address
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer block w-full pl-10 pr-10 py-3.5 border border-slate-300 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 placeholder-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-10 top-3.5 origin-[0] transform -translate-y-4 scale-75 text-slate-400 dark:text-slate-500 duration-300 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-teal-500 text-sm"
              >
                Password
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-600 dark:text-slate-400 cursor-pointer font-semibold">
                Remember my session
              </label>
            </div>

            <div>
              <a href="#" className="font-bold text-teal-650 dark:text-teal-400 hover:underline">
                Reset password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-brand shadow-lg hover:shadow-teal-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 hover:scale-[1.01]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New to our platform?{' '}
            <Link
              to="/register"
              className="font-bold text-teal-650 dark:text-teal-400 hover:text-teal-500 hover:underline inline-flex items-center gap-0.5"
            >
              Sign Up For Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
