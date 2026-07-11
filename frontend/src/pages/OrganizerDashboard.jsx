import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, DollarSign, Users, Trash2, Plus, Edit3, X, Eye, FileText, BarChart2, ArrowLeft, QrCode, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import QRScanner from '../components/QRScanner';

const PRESET_IMAGES = [
  { name: 'Rock Concert Stage', category: 'Music & Concert', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
  { name: 'Live DJ Performance', category: 'Music & Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' },
  { name: 'Outdoor Music Festival', category: 'Music & Concert', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80' },
  
  { name: 'Developer Coding Workspace', category: 'Tech & Coding', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { name: 'Artificial Intelligence Expo', category: 'Tech & Coding', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { name: 'Modern Tech Summit', category: 'Tech & Coding', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80' },

  { name: 'Peaceful Yoga Studio', category: 'Yoga & Health', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Sunset Group Meditation', category: 'Yoga & Health', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80' },
  { name: 'Wellness Healthy Diet', category: 'Yoga & Health', url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80' },

  { name: 'Graffiti Canvas painting', category: 'Art & Painting', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80' },
  { name: 'Watercolor Creative Studio', category: 'Art & Painting', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pottery & Ceramics Workshop', category: 'Art & Painting', url: 'https://images.unsplash.com/photo-1565192647048-f997ed87f5e2?w=800&auto=format&fit=crop&q=80' },

  { name: 'Fine Dining Gourmet Meal', category: 'Food & Drink', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
  { name: 'Luxury Wine Tasting', category: 'Food & Drink', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80' },
  { name: 'Artisan Coffee Roastery', category: 'Food & Drink', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80' },

  { name: 'Professional Running Track', category: 'Sports & Fitness', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80' },
  { name: 'Crossfit Athletes Training', category: 'Sports & Fitness', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' },
  { name: 'Mountain Cycling Adventure', category: 'Sports & Fitness', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80' },

  { name: 'Business Boardroom Presentation', category: 'Business & Pitch', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Executive Meeting Pitch', category: 'Business & Pitch', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=800&auto=format&fit=crop&q=80' },
  { name: 'Co-Working Startup Hub', category: 'Business & Pitch', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },

  { name: 'Nightclub Crowd Dance', category: 'Party & Nightlife', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80' },
  { name: 'Classy Cocktail Lounge', category: 'Party & Nightlife', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Celebration Confetti Party', category: 'Party & Nightlife', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80' },

  { name: 'University Lecture Seminar', category: 'Education & Seminar', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80' },
  { name: 'Collaborative Whiteboard Session', category: 'Education & Seminar', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80' },

  { name: 'Retro Cinema Seats', category: 'Movies & Cinema', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80' },
  { name: 'Red Carpet Gala Event', category: 'Movies & Cinema', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80' },

  { name: 'Wilderness Camping Tents', category: 'Nature & Outdoors', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80' },
  { name: 'Sandy Beach Sunset', category: 'Nature & Outdoors', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' }
];


const extractKeywords = (text) => {
  if (!text) return '';
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here',
    'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in',
    'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor',
    'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats',
    'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll',
    'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt',
    'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which',
    'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll',
    'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves', 'join', 'exciting', 'great', 'event', 'meetup',
    'welcome', 'everyone', 'free', 'get', 'ready', 'e.g', 'learn', 'teach', 'how', 'want', 'need', 'give', 'pictures',
    'details', 'schedule', 'highlights', 'experience'
  ]);
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 4).join(',');
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  // Scanner states
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Smart suggestions states
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [suggestedIndex, setSuggestedIndex] = useState(0);
  const [suggestQuery, setSuggestQuery] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [imageConfirmed, setImageConfirmed] = useState(false);
  const [selectedCoverCat, setSelectedCoverCat] = useState('All');

  const fetchImageSuggestions = async (query) => {
    if (!query || !query.trim()) return;
    setIsSuggesting(true);
    setImageConfirmed(false);
    try {
      const response = await api.get('/images/search', { params: { q: query.trim() } });
      const images = response.data || [];
      setSuggestedImages(images);
      setSuggestedIndex(0);
      if (images.length > 0) {
        setImageUrl(images[0]);
      }
    } catch (err) {
      console.error('Failed to fetch image suggestions', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    const combinedText = `${title} ${description}`.trim();
    if (!combinedText || imageConfirmed) return;

    const delayDebounceFn = setTimeout(() => {
      const keywords = extractKeywords(combinedText);
      if (keywords) {
        const queryStr = keywords.replace(/,/g, ' ');
        setSuggestQuery(queryStr);
        fetchImageSuggestions(queryStr);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [title, description]);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  // Mailbox/Message states
  const [messages, setMessages] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMailboxModal, setShowMailboxModal] = useState(false);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await api.get('/messages/inbox');
      const data = res.data || [];
      setMessages(data);
      setUnreadMessagesCount(data.filter(m => !m.read).length);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleMarkMessageAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
      setUnreadMessagesCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark message as read', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setUnreadMessagesCount(prev => {
        const wasUnread = messages.find(m => m.id === messageId && !m.read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(null);
        setShowMailboxModal(false);
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const fetchOrganizerData = async () => {
    try {
      const eventsRes = await api.get('/events/organizer');
      setEvents(eventsRes.data);
      
      const bookingsRes = await api.get('/bookings/organizer');
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to load organizer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrganizerData();
      fetchNotifications();
      fetchMessages();
    }
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setDate('');
    setPrice(0);
    setImageUrl('');
    setSuggestedImages([]);
    setSuggestedIndex(0);
    setSuggestQuery('');
    setIsSuggesting(false);
    setImageConfirmed(false);
    setEditEventId(null);
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      title,
      description,
      location,
      date,
      price: parseFloat(price),
      imageUrl: imageUrl.trim() || null
    };

    try {
      if (editEventId) {
        await api.put(`/events/${editEventId}`, payload);
        alert('Event updated successfully! Note: Unapproved events will go back to pending status.');
      } else {
        await api.post('/events', payload);
        alert('Event created successfully! It is pending approval by the Admin.');
      }
      setShowFormModal(false);
      resetForm();
      fetchOrganizerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (event) => {
    setEditEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || '');
    setLocation(event.location);
    // Format LocalDateTime string "2026-06-12T19:00:00" to "2026-06-12T19:00" for input datetime-local
    const formattedDate = event.date ? event.date.substring(0, 16) : '';
    setDate(formattedDate);
    setPrice(event.price);
    setImageUrl(event.imageUrl || '');
    setImageConfirmed(event.imageUrl ? true : false);

    const combinedText = `${event.title} ${event.description || ''}`.trim();
    if (combinedText) {
      const keywords = extractKeywords(combinedText);
      if (keywords) {
        const q = keywords.replace(/,/g, ' ');
        setSuggestQuery(q);
        fetchImageSuggestions(q);
      }
    }
    setShowFormModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove any bookings.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e.id !== eventId));
      alert('Event deleted successfully.');
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setShowAttendeeModal(true);
  };

  const handleScanVerify = async (e, manualCode = null) => {
    if (e) e?.preventDefault();
    const inputVal = manualCode || scanInput;
    if (!inputVal || !inputVal.trim()) return;

    // Clean up input: extract digit ID if formatted like #EVT-000012
    const cleanId = inputVal.replace(/#?EVT-/i, '').replace(/\D/g, '');
    if (!cleanId) {
      setScanResult({
        success: false,
        status: 'error',
        message: 'Invalid code format. Please enter a valid booking number (e.g. #EVT-000012 or 12).'
      });
      return;
    }

    setScanLoading(true);
    setScanResult(null);
    try {
      const response = await api.post(`/bookings/${cleanId}/checkin`);
      const booking = response.data;
      setScanResult({
        success: true,
        status: 'success',
        message: 'Access Granted! Ticket checked in successfully.',
        details: booking
      });
      
      const newScan = {
        id: booking.id,
        eventTitle: booking.event.title,
        attendeeName: booking.user.name,
        time: new Date().toLocaleTimeString()
      };
      setRecentScans(prev => [newScan, ...prev.slice(0, 4)]);
      setScanInput('');
      fetchOrganizerData(); // Refresh list to show checked in
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      let message = 'Failed to scan ticket.';
      if (status === 400) {
        message = 'ACCESS DENIED ⚠️ Ticket already scanned or invalid!';
      } else if (status === 404) {
        message = 'INVALID TICKET ❌ Ticket booking record not found.';
      } else if (status === 403) {
        message = 'ACCESS DENIED 🚫 You are not authorized to check-in this ticket.';
      } else {
        message = err.response?.data?.message || message;
      }
      setScanResult({
        success: false,
        status: status === 404 ? 'invalid' : 'already_used',
        message: message
      });
    } finally {
      setScanLoading(false);
    }
  };

  // Calculations for analytics
  const totalBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const totalAttendeesCount = totalBookings.reduce((sum, b) => sum + b.ticketCount, 0);
  const totalRevenueVal = totalBookings.reduce((sum, b) => sum + (b.ticketCount * b.event.price), 0);

  const selectedEventBookings = selectedEvent 
    ? bookings.filter(b => b.event.id === selectedEvent.id && b.status === 'CONFIRMED')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-in fade-in duration-300">
      
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] animate-in slide-in-from-left duration-300"
      >
        <ArrowLeft className="h-4 w-4 text-brand-500" /> Back to Home
      </button>
      {/* Welcome & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display">Organizer Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create, manage, and track attendees for your hosted events.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowFormModal(true); }}
          className="flex items-center gap-1.5 px-5 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all shrink-0"
        >
          <Plus className="h-5 w-5" /> Host New Event
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'events'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          📅 Manage Events
        </button>
        <button
          onClick={() => {
            setActiveTab('scanner');
            setScanResult(null);
            setScanInput('');
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'scanner'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          📷 QR Entry Scanner
        </button>
        <button
          onClick={() => {
            setActiveTab('notifications');
            markNotificationsAsRead();
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          🔔 Notifications
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('mailbox');
            fetchMessages();
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'mailbox'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          📬 Mailbox
          {unreadMessagesCount > 0 && (
            <span className="bg-brand-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'events' ? (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3.5 bg-blue-500/10 text-blue-600 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Hosted Events</p>
                <p className="text-2xl font-extrabold">{events.length}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Tickets Sold</p>
                <p className="text-2xl font-extrabold">{totalAttendeesCount}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3.5 bg-brand-500/10 text-brand-600 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-extrabold">${totalRevenueVal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Events List Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-850 flex justify-between items-center">
              <h2 className="font-bold text-lg font-display">Your Events</h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500">
                {events.length} active listings
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse">Loading events data...</div>
            ) : events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Venue</th>
                      <th className="px-6 py-4">Tickets & Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850">
                    {events.map((event) => {
                      const eventTickets = bookings
                        .filter(b => b.event.id === event.id && b.status === 'CONFIRMED')
                        .reduce((sum, b) => sum + b.ticketCount, 0);

                      return (
                        <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="h-10 w-14 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&auto=format&fit=crop&q=60'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
                              <p className="text-xs text-brand-500">${event.price.toFixed(2)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                            {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs line-clamp-1 mt-3">
                            {event.location}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                event.approved
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                              }`}>
                                {event.approved ? 'Approved' : 'Pending Approval'}
                              </span>
                              <p className="text-[10px] text-slate-400">{eventTickets} tickets sold</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewAttendees(event)}
                                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-500 transition-colors"
                                title="View Attendees"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(event)}
                                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-500 transition-colors"
                                title="Edit Event"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">
                No events hosted yet. Click "Host New Event" to create your first event!
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'scanner' ? (
        /* Scanner Simulator Tab */
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Scanner Simulator Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full filter blur-xl"></div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-650 dark:text-teal-400">Entry Gate Verification</span>
                <h2 className="text-2xl font-black font-display flex items-center justify-center gap-1.5">
                  📷 Ticket Verification Scanner
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Verify digital entry passes. Enter a booking code or scan to validate ticket check-in.
                </p>
              </div>

              {/* Real QR Code Scanner Component */}
              <QRScanner
                onScanSuccess={(decodedText) => handleScanVerify(null, decodedText)}
                onScanFailure={(error) => console.log('Scanner error:', error)}
              />

              {/* Scan input Form */}
              <form onSubmit={handleScanVerify} className="w-full max-w-[340px] space-y-3 pt-4 border-t border-slate-250 dark:border-slate-850">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Or enter Booking Code manually</label>
                  <input
                    type="text"
                    required
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="e.g. #EVT-000033"
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-center font-mono font-bold tracking-wide"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scanLoading}
                  className="w-full py-3 bg-gradient-brand text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:shadow-brand-500/20 transition-all active:scale-[0.98]"
                >
                  {scanLoading ? 'Verifying Code...' : '⚡ Validate Ticket'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Scan Result & Recent Logs */}
          <div className="space-y-6">
            {/* Scan Result Alert */}
            {scanResult && (
              <div className="animate-in zoom-in-95 duration-200">
                {scanResult.success ? (
                  /* Success Pass Card */
                  <div className="p-6 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-405 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-emerald-500 text-white rounded-full text-xs">🎉</span>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight font-display">ACCESS GRANTED</h3>
                        <p className="text-[9px] font-bold tracking-wide uppercase text-emerald-600 dark:text-emerald-500">Ticket Validated Successfully</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-emerald-200/50 dark:border-emerald-900/30 pt-3">
                      <div className="flex justify-between">
                        <span className="opacity-70">Event:</span>
                        <strong className="font-extrabold text-slate-800 dark:text-white">{scanResult.details.event.title}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Attendee:</span>
                        <strong className="font-extrabold text-slate-800 dark:text-white">{scanResult.details.user.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Tickets Count:</span>
                        <strong className="font-extrabold text-slate-800 dark:text-white">{scanResult.details.ticketCount} {scanResult.details.ticketCount === 1 ? 'Person' : 'People'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Booking ID:</span>
                        <strong className="font-mono">#EVT-{scanResult.details.id.toString().padStart(6, '0')}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Failure Card */
                  <div className={`p-6 border rounded-3xl space-y-4 shadow-xl ${
                    scanResult.status === 'already_used'
                      ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-amber-800 dark:text-amber-400'
                      : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-800 dark:text-red-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`p-2 text-white rounded-full text-xs ${
                        scanResult.status === 'already_used' ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        {scanResult.status === 'already_used' ? '⚠️' : '❌'}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base leading-tight font-display">
                          {scanResult.status === 'already_used' ? 'ACCESS DENIED' : 'INVALID TICKET'}
                        </h3>
                        <p className={`text-[9px] font-bold tracking-wide uppercase ${
                          scanResult.status === 'already_used' ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500'
                        }`}>
                          {scanResult.status === 'already_used' ? 'Ticket Code Already Used' : 'Validation Error'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{scanResult.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions / Available bookings simulator list */}
            <div className="glass-panel p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                  🎟️ Click to Scan (Simulator)
                </h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                  {bookings.filter(b => b.status === 'CONFIRMED' && !b.checkedIn).length} active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Click "Scan Pass" next to any attendee ticket to simulate scanning their QR code.
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bookings.filter(b => b.status === 'CONFIRMED').map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/20 text-xs">
                    <div className="space-y-0.5 text-left">
                      <p className="font-bold text-slate-850 dark:text-white line-clamp-1">{b.event.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{b.user.name} ({b.ticketCount} tix)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.checkedIn ? (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                          Checked-In
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setScanInput(`#EVT-${b.id.toString().padStart(6, '0')}`);
                            setScanResult(null);
                          }}
                          className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm"
                        >
                          Scan Pass
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Scans Panel */}
            <div className="glass-panel p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 space-y-4">
              <h3 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                📋 Recent Scans Log
              </h3>
              
              {recentScans.length > 0 ? (
                <div className="space-y-3">
                  {recentScans.map((scan, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-200/60 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 text-xs animate-in slide-in-from-right duration-200">
                      <div className="space-y-0.5 text-left">
                        <p className="font-bold text-slate-850 dark:text-white line-clamp-1">{scan.eventTitle}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Attendee: {scan.attendeeName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                          #EVT-{scan.id.toString().padStart(6, '0')}
                        </span>
                        <p className="text-[9px] text-slate-400 font-medium mt-1">{scan.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No tickets verified in this session yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'notifications' ? (
        /* Notifications Tab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-850">
            <div>
              <h2 className="font-bold text-lg font-display">Notification Center</h2>
              <p className="text-xs text-slate-405 dark:text-slate-400 mt-0.5">Updates regarding event approvals and ticket cancellations.</p>
            </div>
            <button
              onClick={markNotificationsAsRead}
              className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 px-3.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-slate-700"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-150 dark:divide-slate-850 space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className={`py-4 flex gap-4 items-start transition-all ${!notif.read ? 'bg-slate-50/50 dark:bg-slate-900/30 px-3.5 rounded-xl border-l-4 border-brand-500' : 'px-3.5'}`}>
                  <span className="text-lg mt-0.5 shrink-0">
                    {notif.message.includes('reject') ? '❌' : '⚠️'}
                  </span>
                  <div className="space-y-1 text-left flex-1">
                    <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 leading-normal">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm">
              No notifications received yet.
            </div>
          )}
        </div>
      ) : (
        /* Mailbox Tab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-850">
            <div>
              <h2 className="font-bold text-lg font-display flex items-center gap-2">
                📬 Organizer Mailbox
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Emails and inquiries sent by attendees regarding your hosted events.
              </p>
            </div>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500 font-bold">
              {unreadMessagesCount} unread • {messages.length} total
            </span>
          </div>

          {messagesLoading ? (
            <div className="p-16 text-center text-slate-400 animate-pulse">
              Loading mailbox messages...
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !msg.read
                      ? 'border-brand-500/40 bg-brand-500/[0.02] dark:bg-brand-500/[0.04]'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/20'
                  }`}
                >
                  <div className="space-y-2 text-left flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                      )}
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        #MSG-{msg.id.toString().padStart(6, '0')}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-105 text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                        Event: {msg.event.title}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-base text-slate-850 dark:text-white leading-tight">
                      {msg.subject}
                    </h3>
                    
                    <div className="text-xs text-slate-505 dark:text-slate-400 space-y-0.5">
                      <p>
                        From: <strong className="font-semibold text-slate-750 dark:text-slate-300">{msg.senderName}</strong> ({msg.senderEmail})
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        Received on: {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedMessage(msg);
                        setShowMailboxModal(true);
                        if (!msg.read) {
                          handleMarkMessageAsRead(msg.id);
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
                    >
                      Read Letter
                    </button>
                    {!msg.read && (
                      <button
                        onClick={() => handleMarkMessageAsRead(msg.id)}
                        className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-slate-500 hover:text-brand-500 transition-colors"
                        title="Mark as Read"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
                      title="Delete Message"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-sm">
              Your inbox is clean! No email letters received yet.
            </div>
          )}
        </div>
      )}

      {/* Form Modal for Creating/Editing Event */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-brand-500" /> Back
              </button>
              <h3 className="font-extrabold text-sm sm:text-base font-display">
                {editEventId ? 'Edit Event Listing' : 'Host New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Developer Summit 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ticket Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Venue Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Grand Convention Center Hall A"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Event Image URL</label>
                    {imageConfirmed && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 animate-in fade-in duration-200">
                        ✓ Cover Picture Confirmed
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageConfirmed(false);
                    }}
                    className={`block w-full px-3 py-2.5 border rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all ${
                      imageConfirmed 
                        ? 'border-emerald-500 focus:ring-emerald-500' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                    placeholder="e.g. https://domain.com/banner.jpg"
                  />
                </div>

                {/* Smart Suggestion UI */}
                <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-brand-500 dark:text-brand-400 flex items-center gap-1.5">
                      ✨ Auto-Suggested Event Covers
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Powered by Openverse Search
                    </span>
                  </div>

                  {isSuggesting ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-6 text-center animate-pulse flex flex-col items-center justify-center h-44 gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Searching relevant event covers...</p>
                    </div>
                  ) : suggestedImages.length > 0 ? (
                    <div className="space-y-3">
                      {/* Live cover suggestion preview */}
                      <div className="relative rounded-xl overflow-hidden h-44 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner group">
                        <img 
                          src={suggestedImages[suggestedIndex]} 
                          alt="Suggested Cover" 
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-[10px] font-bold">
                          Suggestion {suggestedIndex + 1} of {suggestedImages.length}
                        </div>
                        
                        {/* Overlay if currently set */}
                        {imageConfirmed && imageUrl === suggestedImages[suggestedIndex] && (
                          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white space-y-1 animate-in fade-in duration-200">
                            <span className="p-3 bg-emerald-500 rounded-full text-white text-lg shadow-lg">✓</span>
                            <span className="text-xs font-black uppercase tracking-wider">Selected as Cover Picture</span>
                          </div>
                        )}

                        {/* Navigation Overlay Buttons */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={suggestedIndex === 0}
                            onClick={() => {
                              const prevIdx = suggestedIndex - 1;
                              setSuggestedIndex(prevIdx);
                              setImageUrl(suggestedImages[prevIdx]);
                              setImageConfirmed(false);
                            }}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105"
                          >
                            ◀
                          </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={suggestedIndex === suggestedImages.length - 1}
                            onClick={() => {
                              const nextIdx = suggestedIndex + 1;
                              setSuggestedIndex(nextIdx);
                              setImageUrl(suggestedImages[nextIdx]);
                              setImageConfirmed(false);
                            }}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-105"
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          disabled={suggestedIndex === 0}
                          onClick={() => {
                            const prevIdx = suggestedIndex - 1;
                            setSuggestedIndex(prevIdx);
                            setImageUrl(suggestedImages[prevIdx]);
                            setImageConfirmed(false);
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                        >
                          ⏪ Previous Picture
                        </button>
                        <button
                          type="button"
                          disabled={suggestedIndex === suggestedImages.length - 1}
                          onClick={() => {
                            const nextIdx = suggestedIndex + 1;
                            setSuggestedIndex(nextIdx);
                            setImageUrl(suggestedImages[nextIdx]);
                            setImageConfirmed(false);
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                        >
                          🔄 Next Picture
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl(suggestedImages[suggestedIndex]);
                            setImageConfirmed(true);
                          }}
                          className={`px-5 py-2 font-bold text-xs rounded-xl transition-all shadow-md ${
                            imageConfirmed && imageUrl === suggestedImages[suggestedIndex]
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                          }`}
                        >
                          {imageConfirmed && imageUrl === suggestedImages[suggestedIndex] ? '✓ Okay, Set!' : '✓ Okay (Select)'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 leading-normal">
                      No suggested covers yet. Please write a descriptive Title or Description, or type custom search terms below!
                    </div>
                  )}

                  {/* Manual search query */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-850">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      🔍 Adjust Keywords / Search:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={suggestQuery}
                        onChange={(e) => setSuggestQuery(e.target.value)}
                        placeholder="e.g. graffiti art workshop, coding hackathon"
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => fetchImageSuggestions(suggestQuery)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700 shrink-0"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Categories */}
                <div className="space-y-1.5 pt-0.5">
                {/* Premium Curated Cover Photo Library */}
                <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    🖼️ Curated Premium Cover Gallery
                  </span>
                  
                  {/* Category tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['All', 'Music & Concert', 'Tech & Coding', 'Yoga & Health', 'Art & Painting', 'Food & Drink', 'Sports & Fitness', 'Business & Pitch', 'Party & Nightlife', 'Education & Seminar', 'Movies & Cinema', 'Nature & Outdoors'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCoverCat(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap border shrink-0 transition-all ${
                          selectedCoverCat === cat
                            ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Horizontal scrolling grid of matches */}
                  <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none max-h-36">
                    {PRESET_IMAGES.filter(img => selectedCoverCat === 'All' || img.category === selectedCoverCat).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setImageUrl(img.url);
                          setImageConfirmed(true);
                        }}
                        className={`relative rounded-xl overflow-hidden h-20 w-32 shrink-0 border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
                          imageUrl === img.url
                            ? 'border-teal-500 ring-2 ring-teal-550/25'
                            : 'border-transparent'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 hover:bg-transparent flex items-end p-1 transition-colors">
                          <span className="text-[8px] font-bold text-white line-clamp-1">{img.name}</span>
                        </div>
                        {imageUrl === img.url && (
                          <div className="absolute inset-0 bg-teal-500/30 flex items-center justify-center text-white font-extrabold text-sm shadow-inner">
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Describe details, schedule, highlights..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md transition-all"
              >
                {formLoading ? 'Saving listing...' : editEventId ? 'Update Event Details' : 'Submit Event Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendees List Modal */}
      {showAttendeeModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <div>
                <h3 className="font-extrabold text-lg font-display">Attendee Records</h3>
                <p className="text-xs text-slate-400">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setShowAttendeeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedEventBookings.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2 text-center">Tickets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-850">
                      {selectedEventBookings.map((b) => (
                        <tr key={b.id}>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{b.user.name}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{b.user.email}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{b.user.phone || 'N/A'}</td>
                          <td className="px-4 py-3 text-center font-bold text-brand-600 dark:text-brand-400">{b.ticketCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 text-sm">
                No tickets booked yet for this event.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mailbox Details Modal */}
      {showMailboxModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <div>
                <h3 className="font-extrabold text-lg font-display flex items-center gap-1.5">
                  📬 Read Email Letter
                </h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">
                  #MSG-{selectedMessage.id.toString().padStart(6, '0')}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowMailboxModal(false);
                  setSelectedMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm text-left">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Event Subject</span>
                  <p className="font-extrabold text-slate-850 dark:text-white text-base">{selectedMessage.subject}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">From Attendee</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedMessage.senderName}</p>
                    <p className="text-xs text-slate-450 dark:text-slate-400">{selectedMessage.senderEmail}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Regarding Event</span>
                    <p className="font-semibold text-brand-600 dark:text-brand-400">{selectedMessage.event.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedMessage.event.id}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Received Date</span>
                  <p className="text-xs text-slate-600 dark:text-slate-350">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Message Content</span>
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed text-slate-750 dark:text-slate-300 min-h-[120px] whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-850">
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-650 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowMailboxModal(false);
                    setSelectedMessage(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold text-xs rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrganizerDashboard;

