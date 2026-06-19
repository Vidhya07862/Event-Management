import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sun, Moon, Calendar, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ROLE_ADMIN':
        return '/admin-dashboard';
      case 'ROLE_ORGANIZER':
        return '/organizer-dashboard';
      default:
        return '/user-dashboard';
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Events', path: '/events' },
    { label: 'Contact Us', path: '/contact' }
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-display text-2xl font-black text-gradient">
              <Calendar className="h-6 w-6 text-teal-500 dark:text-teal-400" />
              <span>EventHub</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-all relative py-1 hover:text-teal-500 dark:hover:text-teal-400 ${
                  isActive(link.path) 
                    ? 'text-teal-600 dark:text-teal-450 font-extrabold' 
                    : 'text-slate-800 dark:text-slate-250'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-full"></span>
                )}
              </Link>
            ))}

            {user && (
              <Link
                to={getDashboardLink()}
                className={`text-sm font-bold transition-all relative py-1 hover:text-teal-500 dark:hover:text-teal-400 ${
                  isActive(getDashboardLink()) 
                    ? 'text-teal-600 dark:text-teal-450 font-extrabold' 
                    : 'text-slate-850 dark:text-slate-250'
                }`}
              >
                Dashboard
                {isActive(getDashboardLink()) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-full"></span>
                )}
              </Link>
            )}
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850 transition-colors border border-slate-200 dark:border-slate-800"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-teal-500" />
                  Hi, <strong>{user.name.split(' ')[0]}</strong>
                  <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-900 dark:bg-teal-900/50 dark:text-teal-350 border border-teal-200/50 dark:border-teal-800/50">
                    {user.role.replace('ROLE_', '')}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-250 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800/50 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 dark:text-slate-250 hover:text-teal-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-brand rounded-xl shadow-md hover:shadow-teal-500/20 transition-all duration-300 hover-shine"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-850 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top duration-200 bg-white/95 dark:bg-slate-950/95">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-bold ${
                  isActive(link.path)
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'
                    : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-bold ${
                  isActive(getDashboardLink())
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'
                    : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 px-3">
                <div className="text-sm font-extrabold text-slate-950 dark:text-white mb-1">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 mb-3">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-900/50 text-sm font-bold rounded-xl text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-brand rounded-xl hover-shine"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
