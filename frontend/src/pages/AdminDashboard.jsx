import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, DollarSign, Check, X, ShieldAlert, BarChart3, Trash2, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals'); // approvals, users

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data);

      const pendingRes = await api.get('/admin/events/pending');
      setPendingEvents(pendingRes.data);

      const usersRes = await api.get('/admin/users');
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const handleApproveEvent = async (eventId) => {
    try {
      await api.put(`/admin/events/${eventId}/approve`);
      setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
      alert('Event approved successfully!');
      fetchAdminData(); // update stats
    } catch (err) {
      alert('Failed to approve event.');
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to reject and delete this event request?')) {
      return;
    }

    try {
      await api.delete(`/admin/events/${eventId}/reject`);
      setPendingEvents(pendingEvents.filter(e => e.id !== eventId));
      alert('Event request rejected.');
      fetchAdminData(); // update stats
    } catch (err) {
      alert('Failed to reject event.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setAllUsers(allUsers.filter(u => u.id !== userId));
      alert('User deleted successfully.');
      fetchAdminData(); // update stats
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-in fade-in duration-300">
      
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors animate-in slide-in-from-left duration-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>
      {/* Banner */}
      <div>
        <h1 className="text-3xl font-extrabold font-display flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-brand-600 dark:text-brand-400" /> Admin Control Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review organizer listings, monitor users, and check system performance metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-extrabold">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organizers</p>
            <p className="text-xl font-extrabold">{stats?.totalOrganizers || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bookings</p>
            <p className="text-xl font-extrabold">{stats?.totalBookings || 0}</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="p-3 bg-brand-500/10 text-brand-600 rounded-xl shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue</p>
            <p className="text-xl font-extrabold">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-850 flex gap-4">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'approvals'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Event Approvals ({pendingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Users ({allUsers.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading dashboard database records...</div>
        ) : activeTab === 'approvals' ? (
          // Approvals Tab
          pendingEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Requested Event</th>
                    <th className="px-6 py-4">Organizer</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Pricing</th>
                    <th className="px-6 py-4 text-right">Approve / Reject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850">
                  {pendingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-10 w-14 bg-slate-100 dark:bg-slate-850 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&auto=format&fit=crop&q=60'}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {event.organizer.name}
                        <p className="text-[10px] text-slate-400 font-mono">{event.organizer.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-3">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveEvent(event.id)}
                            className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                            title="Approve Event"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleRejectEvent(event.id)}
                            className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            title="Reject Event Request"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              No pending approval requests. All organizer events are live!
            </div>
          )
        ) : (
          // Users Tab
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Account Details</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4 text-right">Account Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{u.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                          : u.role === 'ROLE_ORGANIZER'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ROLE_ADMIN' ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Account
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic select-none pr-3">System Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
