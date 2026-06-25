import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, Phone, UserPlus, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ROLE_USER'); // Default ROLE_USER, can be ROLE_ORGANIZER
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
      const user = await register(name, email, password, role, phone);
      // Save password for quick login autofill on the login page
      localStorage.setItem(`demo_pass_${email.toLowerCase().trim()}`, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin-dashboard');
      } else if (user.role === 'ROLE_ORGANIZER') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already be taken.');
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
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-gradient">
            Join EventHub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Create a secure profile to organize features or book tickets.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl text-xs font-semibold text-red-650 dark:text-red-400 transition-all duration-300">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="relative">
              <input
                id="full-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 placeholder-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                placeholder="Full Name"
              />
              <label
                htmlFor="full-name"
                className="absolute left-10 top-3.5 origin-[0] transform -translate-y-4 scale-75 text-slate-400 dark:text-slate-500 duration-300 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-teal-500 text-sm"
              >
                Full Name
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <UserIcon className="h-5 w-5" />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Phone Number */}
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="peer block w-full pl-10 pr-3 py-3.5 border border-slate-300 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 placeholder-transparent text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                placeholder="Phone Number"
              />
              <label
                htmlFor="phone"
                className="absolute left-10 top-3.5 origin-[0] transform -translate-y-4 scale-75 text-slate-400 dark:text-slate-500 duration-300 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-teal-500 text-sm"
              >
                Phone Number
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Phone className="h-5 w-5" />
              </div>
            </div>

            {/* Password */}
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

          {/* Sliding Capsule Role Selector Indicator */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Choose Account Tier
            </span>
            <div className="relative p-1 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center border border-slate-200 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setRole('ROLE_USER')}
                className={`relative z-10 flex-1 py-3 text-xs font-bold rounded-lg transition-all duration-300 ${
                  role === 'ROLE_USER' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Attendee
                <span className="block text-[9px] font-normal opacity-85 mt-0.5">Explore & Book</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('ROLE_ORGANIZER')}
                className={`relative z-10 flex-1 py-3 text-xs font-bold rounded-lg transition-all duration-300 ${
                  role === 'ROLE_ORGANIZER' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Organizer
                <span className="block text-[9px] font-normal opacity-85 mt-0.5">Create & Host</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`relative z-10 flex-1 py-3 text-xs font-bold rounded-lg transition-all duration-300 ${
                  role === 'ROLE_ADMIN' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Admin
                <span className="block text-[9px] font-normal opacity-85 mt-0.5">Control Center</span>
              </button>
              
              {/* Sliding Background Capsule */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] rounded-lg bg-gradient-brand transition-all duration-300 shadow-md ${
                  role === 'ROLE_USER' ? 'left-1' : role === 'ROLE_ORGANIZER' ? 'left-[calc(33.33%+1px)]' : 'left-[calc(66.66%+2px)]'
                }`}
              />
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
                  Creating Profile...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-teal-650 dark:text-teal-400 hover:text-teal-500 hover:underline inline-flex items-center gap-0.5"
            >
              Sign In <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
