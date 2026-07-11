import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, Calendar, MapPin, ArrowRight, Star, Compass, Award, 
  Activity, Users, CheckCircle2, TrendingUp, ShieldCheck, Globe, Building2
} from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('attendee'); // 'attendee' or 'organizer'
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest events
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        // Show first 3 approved events on home page
        const approvedEvents = response.data.filter(e => e.approved || e.status === 'APPROVED' || !e.hasOwnProperty('approved')).slice(0, 3);
        setEvents(approvedEvents.length > 0 ? approvedEvents : response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    fetchEvents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const categories = [
    { name: 'Technology', icon: Compass, color: 'bg-blue-500/10 text-blue-650 dark:text-blue-400', hover: 'hover:border-blue-500/40 hover:shadow-blue-500/5' },
    { name: 'Music', icon: Activity, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', hover: 'hover:border-pink-500/40 hover:shadow-pink-500/5' },
    { name: 'Business', icon: Award, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', hover: 'hover:border-amber-500/40 hover:shadow-amber-500/5' },
    { name: 'Sports', icon: Star, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5' }
  ];

  const stats = [
    { label: 'Tickets Booked', value: '15,400+', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Events Hosted', value: '980+', icon: Calendar, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Active Organizers', value: '120+', icon: Users, color: 'text-pink-500 bg-pink-500/10' },
    { label: 'Customer Satisfaction', value: '99.4%', icon: ShieldCheck, color: 'text-amber-500 bg-amber-500/10' }
  ];

  const partners = [
    'TechCorp', 'NovaMusic', 'GlobalSummit', 'VentureLabs', 'SportsCo', 'DesignWeek', 'SoundStage', 'EpicEvents'
  ];

  const liveBookings = [
    "🎟️ Sarah J. just booked Zen Yoga (CONFIRMED)",
    "🎟️ Michael K. registered for Global Tech Summit (CONFIRMED)",
    "🎟️ Elena R. booked Neon Beats Music (CONFIRMED)",
    "🎟️ Marcus T. booked Urban Canvas Graffiti (CONFIRMED)",
    "🎟️ David P. registered for Venture Pitch Day (CONFIRMED)"
  ];

  // Moving highlight cards data
  const highlightCards = [
    { title: "Global Tech Summit", tag: "Selling Fast", seats: "5 seats left", tagColor: "bg-red-500/10 text-red-500 border-red-500/30", type: "Tech" },
    { title: "Neon Beats Music", tag: "Trending #1", seats: "Acoustics Live", tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/30", type: "Music" },
    { title: "Zen Yoga Workshop", tag: "Best Seller", seats: "Fully Seeded", tagColor: "bg-amber-500/10 text-amber-500 border-amber-500/30", type: "Wellness" }
  ];

  const flowSteps = {
    attendee: [
      { title: 'Explore Events', desc: 'Browse hundreds of curated local and virtual gatherings matching your exact passions.', icon: Search, link: '/events', actionText: 'Browse Events →' },
      { title: 'Secure Tickets', desc: 'Book tickets seamlessly with a fast checkout flow and instant email confirmation.', icon: ShieldCheck, link: '/events', actionText: 'Book Tickets →' },
      { title: 'Attend & Scan', desc: 'Gain rapid access at the entrance with your live dashboard QR codes.', icon: CheckCircle2, link: '/user-dashboard', actionText: 'View My Tickets →' }
    ],
    organizer: [
      { title: 'Design Your Event', desc: 'Create beautiful event listings with custom pricing, tickets, venue, and graphics.', icon: Building2, link: '/organizer-dashboard', actionText: 'Create Event →' },
      { title: 'Admin Verification', desc: 'Events are reviewed swiftly by our support admins to guarantee highest quality listings.', icon: ShieldCheck, link: '/admin-dashboard', actionText: 'Verify Events →' },
      { title: 'Manage & Earn', desc: 'Track booking reports, revenue, attendee count, and manage tickets in real-time.', icon: TrendingUp, link: '/organizer-dashboard', actionText: 'View Sales Report →' }
    ]
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden grid-bg min-h-screen relative">
      {/* Full-Width Glass Showcase Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Full-width corporate background image with frosted glass overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-10 transition-opacity duration-700" 
          style={{ backgroundImage: "url('/business_hero.png')" }}
        ></div>
        
        {/* Frosted Glass Overlay (backdrop filter creates the clean luxury blur) */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/70 dark:bg-slate-950/80 pointer-events-none"></div>

        {/* Subtle Event Networking Watermark (Transparent, Elegant, and Low Intensity) */}
        <div 
          className="absolute top-[5%] right-[-5%] w-[600px] h-[600px] pointer-events-none opacity-[0.12] dark:opacity-[0.06] bg-contain bg-no-repeat bg-right-top select-none mix-blend-multiply dark:invert dark:mix-blend-screen z-0" 
          style={{ backgroundImage: "url('/event_watermark.png')" }}
        ></div>
        <div 
          className="absolute bottom-[2%] left-[-5%] w-[500px] h-[500px] pointer-events-none opacity-[0.10] dark:opacity-[0.05] bg-contain bg-no-repeat bg-left-bottom select-none transform rotate-180 mix-blend-multiply dark:invert dark:mix-blend-screen z-0" 
          style={{ backgroundImage: "url('/event_watermark.png')" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Text & Search Content */}
            <div className="lg:col-span-7 text-left space-y-8">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-teal-100/90 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-205/30 shadow-md transition-all duration-300 hover:scale-105">
                🎉 Premium Event Management & Ticketing Platform
              </span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display leading-[1.1] text-slate-950 dark:text-white">
                Elevate Your Next <br />
                <span className="text-gradient-teal dark:text-gradient">Extraordinary Experience</span>
              </h1>
              
              <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Discover verified local and global events or build your business as an organizer. A state-of-the-art ticket manager designed for modern enterprises.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-300 dark:border-slate-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-teal-500/50">
                  <div className="flex-1 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search events, locations, categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent border-0 focus:outline-none text-slate-950 dark:text-white placeholder-slate-400 text-sm py-2 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-brand text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/30 text-sm transition-all duration-300 hover:scale-[1.02] hover-shine"
                  >
                    Find Events
                  </button>
                </div>
              </form>

              {/* Moving Highlight Cards / Animated Tags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {highlightCards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel p-4 rounded-xl flex flex-col items-start justify-between border border-slate-200/60 dark:border-slate-800/85 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">{card.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${card.tagColor}`}>
                        {card.tag}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-950 dark:text-white truncate w-full">{card.title}</h4>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{card.seats}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Graphic Image */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Glowing Background Accent */}
              <div className="absolute w-72 h-72 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -top-10 -right-10"></div>
              <div className="absolute w-72 h-72 bg-emerald-500/15 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -bottom-10 -left-10"></div>
              
              {/* Glass Frame holding the Illustration */}
              <div className="relative glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/85 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-500 animate-blob">
                <img 
                  src="/event_watermark.png" 
                  alt="Event Hub Networking" 
                  className="w-full h-auto object-cover rounded-2xl opacity-90 dark:opacity-80 mix-blend-multiply dark:invert dark:mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Booking Ticker Tape Bar */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4">
        <div className="glass-panel py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 shrink-0 bg-teal-500/10 dark:bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/20">
              <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-pulse"></span>
              Live Activity
            </span>
            <div className="relative w-full overflow-hidden mask-gradient">
              <div className="flex w-[200%] gap-16 animate-marquee whitespace-nowrap">
                {/* First loop pass */}
                <div className="flex gap-16 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {liveBookings.map((bk, i) => (
                    <span key={i} className="flex items-center">{bk}</span>
                  ))}
                </div>
                {/* Second pass for loop transition */}
                <div className="flex gap-16 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {liveBookings.map((bk, i) => (
                    <span key={`dup-${i}`} className="flex items-center">{bk}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Partners Showcase */}
      <section className="border-y border-slate-200 dark:border-slate-800/80 py-10 bg-white/40 dark:bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-450 mb-6">
            Trusted by Industry Leading Gatherings
          </p>
          <div className="relative w-full overflow-hidden mask-gradient">
            <div className="flex w-[200%] gap-12 animate-marquee">
              {/* First pass */}
              {partners.map((partner, i) => (
                <div key={i} className="flex-1 flex items-center justify-center font-display text-lg sm:text-xl font-black text-slate-400/90 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300 cursor-default">
                  {partner}
                </div>
              ))}
              {/* Second pass for marquee loop */}
              {partners.map((partner, i) => (
                <div key={`dup-${i}`} className="flex-1 flex items-center justify-center font-display text-lg sm:text-xl font-black text-slate-400/90 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-300 cursor-default">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg border border-slate-300/60 dark:border-slate-800/80 transition-all duration-500 hover:scale-105"
            >
              <div className={`p-3 rounded-xl mb-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-black font-display text-slate-950 dark:text-white">{stat.value}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        {/* Subtle categories watermark */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] pointer-events-none opacity-[0.08] dark:opacity-[0.04] bg-contain bg-no-repeat bg-left-top select-none mix-blend-multiply dark:invert dark:mix-blend-screen z-0" 
          style={{ backgroundImage: "url('/event_watermark.png')" }}
        ></div>
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Popular Categories</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Explore trending events curated by field.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/events?search=${cat.name}`)}
                className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-2 transition-all duration-300 shadow-lg group border border-slate-200 dark:border-slate-800 ${cat.hover}`}
              >
                <div className={`p-4 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${cat.color}`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 mt-1.5 font-bold group-hover:underline">Explore →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        {/* Subtle featured events watermark */}
        <div 
          className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] pointer-events-none opacity-[0.08] dark:opacity-[0.04] bg-contain bg-no-repeat bg-right-bottom select-none mix-blend-multiply dark:invert dark:mix-blend-screen z-0 transform rotate-90" 
          style={{ backgroundImage: "url('/event_watermark.png')" }}
        ></div>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Featured Events</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Handpicked elite experiences scheduled this month.</p>
            </div>
            <Link
              to="/events"
              className="group font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors inline-flex items-center gap-1.5"
            >
              View All Events <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-800 shadow-xl group">
                  <div className="relative h-52 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&auto=format&fit=crop&q=60'}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-slate-950/90 backdrop-blur-sm rounded-lg text-xs font-extrabold text-amber-400 border border-amber-500/30 shadow-md">
                      {event.price === 0 ? 'Free Entry' : `$${event.price}`}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-lg leading-tight line-clamp-1 text-slate-900 dark:text-white">{event.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 font-bold gap-2">
                        <Calendar className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 font-bold gap-2">
                        <MapPin className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                    <Link
                      to={`/events/${event.id}`}
                      className="w-full py-3.5 bg-gradient-brand text-white text-center font-bold text-xs rounded-xl shadow-md hover:shadow-teal-500/20 transition-all duration-300 hover-shine"
                    >
                      Book Ticket
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Empty/Loading State
              [1, 2, 3].map((idx) => (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden h-96 animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="space-y-3 flex-1 pt-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Interactive how it works guide */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Seamless Management Platform</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Discover how EventHub operates dynamically whether you are booking ticket plans or hosting large conferences.
            </p>
          </div>

          {/* Interactive Switch Tab */}
          <div className="flex justify-center mb-10">
            <div className="relative p-1 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('attendee')}
                className={`relative z-10 px-6 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === 'attendee' ? 'text-white' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                For Attendees
              </button>
              <button
                onClick={() => setActiveTab('organizer')}
                className={`relative z-10 px-6 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === 'organizer' ? 'text-white' : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                For Organizers
              </button>
              {/* Sliding Capsule Indicator */}
              <div 
                className={`absolute top-1 bottom-1 left-1 rounded-lg bg-gradient-brand transition-all duration-300 shadow-md ${
                  activeTab === 'attendee' ? 'w-[105px] translate-x-0' : 'w-[108px] translate-x-[105px]'
                }`}
              />
            </div>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {flowSteps[activeTab].map((step, idx) => (
              <Link 
                key={idx} 
                to={step.link}
                className="flex flex-col items-center text-center space-y-4 group glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-teal-500/30"
              >
                <div className="p-4 rounded-full bg-teal-500/10 text-teal-650 dark:text-teal-400 border border-teal-500/20 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{step.desc}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 group-hover:underline mt-2">
                  {step.actionText}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
