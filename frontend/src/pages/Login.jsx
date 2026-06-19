import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
