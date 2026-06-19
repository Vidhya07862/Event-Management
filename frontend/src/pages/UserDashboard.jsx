import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, MapPin, Ticket, User as UserIcon, Phone, ShieldAlert, Award, FileText, ArrowLeft } from 'lucide-react';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile editing state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Fetch profile and bookings
    const fetchData = async () => {
      try {
        const bookingsRes = await api.get('/bookings/my');
        setBookings(bookingsRes.data);

        // Fetch self data to populate phone
        const meRes = await api.get('/auth/me');
        setPhone(meRes.data.phone || '');
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: '', type: '' });

    try {
      await updateProfile(name, phone);
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      // Update local state
      setBookings(bookings.map(b => b.id === bookingId ? response.data : b));
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const isUpcoming = (eventDate) => new Date(eventDate) > new Date();

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const upcomingBookings = activeBookings.filter(b => isUpcoming(b.event.date));
  const pastBookings = activeBookings.filter(b => !isUpcoming(b.event.date));
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-in fade-in duration-300">
      
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>

      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full filter blur-xl"></div>
        <div className="space-y-2 relative">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Attendee Portal</span>
          <h1 className="text-3xl font-extrabold font-display">Hello, {user?.name}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg">
            Manage your profile, view upcoming bookings, download tickets, or cancel reservation.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-brand-500/5 dark:bg-brand-500/15 border border-brand-500/20 px-6 py-4 rounded-2xl">
          <Ticket className="h-10 w-10 text-brand-500 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-brand-500">Total Booked Tickets</p>
            <p className="text-2xl font-extrabold">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left: Bookings List */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" /> Upcoming Events
            </h2>
            
            {loading ? (
              <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          booking.status === 'CONFIRMED' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#EVT-{booking.id.toString().padStart(6, '0')}</span>
                      </div>
                      <h3 className="font-bold text-base">{booking.event.title}</h3>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(booking.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ticket className="h-3.5 w-3.5" />
                          {booking.ticketCount} {booking.ticketCount === 1 ? 'ticket' : 'tickets'}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-stretch gap-2 w-full sm:w-auto shrink-0">
                      <Link
                        to={`/bookings/${booking.id}/confirmation`}
                        className="flex-1 sm:flex-none py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl text-center shadow-sm"
                      >
                        View Pass
                      </Link>
                      {booking.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 sm:flex-none py-2 px-4 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
                No upcoming events booked yet. <Link to="/events" className="text-brand-500 font-semibold hover:underline">Find events</Link>
              </div>
            )}
          </div>

          {/* Past Bookings Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-slate-400">Past Bookings</h2>
            
            {pastBookings.length > 0 && (
              <div className="space-y-3 opacity-70">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="glass-card p-5 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{booking.event.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(booking.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {booking.ticketCount} tickets
                      </p>
                    </div>
                    <Link
                      to={`/bookings/${booking.id}/confirmation`}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg transition-all"
                    >
                      Receipt
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Update Profile Settings */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-brand-500" /> Account Settings
            </h2>

            {profileMessage.text && (
              <div className={`p-3 rounded-xl text-xs border ${
                profileMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-600 dark:text-red-400'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-1 opacity-60">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email (Locked)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-2.5 bg-gradient-brand text-white font-semibold rounded-xl text-sm transition-all"
              >
                {profileLoading ? 'Saving changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
