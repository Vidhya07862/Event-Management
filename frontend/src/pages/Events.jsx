import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, MapPin, SlidersHorizontal, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
  const [bookingAll, setBookingAll] = useState(false);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [bulkTicketCount, setBulkTicketCount] = useState(1);

  useEffect(() => {
    if (user) {
      setAttendeeName(user.name || '');
      setAttendeePhone(user.phone || '+777888999');
    }
  }, [user]);

  const handleBookAllEventsClick = () => {
    if (!user) {
      alert('Please log in to book tickets.');
      navigate('/login');
      return;
    }
    if (user.role !== 'ROLE_USER') {
      alert('Only regular attendees can book tickets.');
      return;
    }
    setValidationError('');
    setShowBulkPaymentModal(true);
  };

  const handleConfirmBulkBookingAndPayment = async () => {
    setValidationError('');
    
    // Validate attendee details
    if (!attendeeName.trim()) {
      setValidationError('Attendee Name is required.');
      return;
    }
    if (!attendeePhone.trim()) {
      setValidationError('Attendee Phone is required.');
      return;
    }

    // Validate payment details
    if (paymentMethod === 'Credit Card') {
      if (!cardHolderName.trim()) {
        setValidationError('Cardholder Name is required.');
        return;
      }
      const rawCardNo = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(rawCardNo)) {
        setValidationError('Card Number must be exactly 16 digits.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        setValidationError('Expiry Date must be in MM/YY format.');
        return;
      }
      if (!/^\d{3}$/.test(cardCvv)) {
        setValidationError('CVV Code must be exactly 3 digits.');
        return;
      }
    } else if (['PhonePe', 'Google Pay', 'Navi'].includes(paymentMethod)) {
      if (!upiId.trim()) {
        setValidationError('UPI ID is required.');
        return;
      }
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        setValidationError('Invalid UPI ID format (e.g. name@upi).');
        return;
      }
    }

    setBookingAll(true);
    try {
      // 1. Send bulk booking requests
      const bookingRequests = filteredEvents.map(event => ({
        eventId: event.id,
        ticketCount: bulkTicketCount
      }));

      const bookingRes = await api.post('/bookings/bulk', bookingRequests);
      const createdBookings = bookingRes.data;

      // 2. Process payments in bulk for each booking
      const chosenMethod = paymentMethod === 'Credit Card' ? 'Credit Card' : `UPI (${paymentMethod})`;
      const paymentRequests = createdBookings.map(booking => ({
        bookingId: booking.id,
        paymentMethod: chosenMethod
      }));

      await api.post('/bookings/payment/bulk', paymentRequests);

      // Close modal
      setShowBulkPaymentModal(false);

      // Clear inputs
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardHolderName('');
      setUpiId('');

      // 3. Redirect to bulk booking confirmation/receipts
      const bookingIds = createdBookings.map(b => b.id).join(',');
      navigate(`/bookings/bulk/confirmation?ids=${bookingIds}&name=${encodeURIComponent(attendeeName)}&phone=${encodeURIComponent(attendeePhone)}`);
    } catch (err) {
      console.error('Failed to book all events:', err);
      alert(err.response?.data?.message || 'Failed to complete booking for all events.');
    } finally {
      setBookingAll(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('search') || '';
        const response = await api.get(`/events${query ? `?search=${encodeURIComponent(query)}` : ''}`);
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search.trim() ? { search: search.trim() } : {});
  };

  const filteredEvents = events.filter((event) => {
    if (priceFilter === 'free') return event.price === 0;
    if (priceFilter === 'paid') return event.price > 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Discover Events</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Explore and book tickets for upcoming events.</p>
        </div>
        {filteredEvents.length > 0 && (
          <button
            onClick={handleBookAllEventsClick}
            disabled={bookingAll}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-brand text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/20 text-xs transition-all duration-300 hover:scale-[1.02] hover-shine flex items-center justify-center gap-2"
          >
            🎟️ {bookingAll ? 'Booking all...' : 'Book All Available Events'}
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md">
          <div className="flex p-1.5 rounded-xl glass-panel shadow-sm w-full">
            <input
              type="text"
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm pl-2 py-1.5"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full md:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden h-96 animate-pulse p-4 flex flex-col justify-between">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="space-y-3 flex-1 pt-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-all">
              <div className="relative h-48 bg-slate-100 dark:bg-slate-900">
                <img
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&auto=format&fit=crop&q=60'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 border border-slate-200/20 shadow-sm">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide">
                    {event.price === 0 ? 'Community' : 'Premium'}
                  </span>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{event.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{event.description}</p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
                <Link
                  to={`/events/${event.id}`}
                  className="w-full py-2.5 bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-850 dark:hover:bg-brand-500 dark:text-slate-200 text-center font-semibold text-xs rounded-xl transition-all"
                >
                  Book Ticket
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-slate-400" />
          <h3 className="text-lg font-bold">No Events Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We couldn't find any events matching your criteria. Try searching for something else or browse all categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSearchParams({});
              setPriceFilter('all');
            }}
            className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Bulk Payment / Person Details Modal */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <h3 className="font-extrabold text-lg flex items-center gap-2 font-display">
                <CreditCard className="h-5 w-5 text-brand-500" />
                Bulk Checkout Modal
              </h3>
              <button
                onClick={() => {
                  setShowBulkPaymentModal(false);
                  setValidationError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl space-y-2.5 text-xs text-slate-550 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Events to Book:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{filteredEvents.length} Events</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tickets count per event:</span>
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setBulkTicketCount(Math.max(1, bulkTicketCount - 1))}
                    className="font-bold text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 text-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs w-4 text-center text-slate-900 dark:text-slate-100">{bulkTicketCount}</span>
                  <button
                    type="button"
                    onClick={() => setBulkTicketCount(bulkTicketCount + 1)}
                    className="font-bold text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-brand-600 dark:text-brand-400 font-extrabold text-base">
                  ${(filteredEvents.reduce((sum, e) => sum + e.price, 0) * bulkTicketCount).toFixed(2)}
                </span>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                ⚠️ {validationError}
              </div>
            )}

            {/* Attendee / Person Details Fields */}
            <div className="space-y-3.5 pt-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Person / Attendee Details
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Attendee Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Option */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Select Payment Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Credit Card', 'PhonePe', 'Google Pay', 'Navi'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all ${
                      paymentMethod === method
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bulkPaymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => {
                          setPaymentMethod(method);
                          setValidationError('');
                        }}
                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
                      />
                      <span className="text-xs font-semibold">{method}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs Based on Choice */}
            {paymentMethod === 'Credit Card' ? (
              <div className="space-y-3.5 animate-in slide-in-from-top duration-200">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Card Number</label>
                  <input
                    type="text"
                    maxLength="19"
                    required
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength="5"
                      required
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">CVV Code</label>
                    <input
                      type="password"
                      maxLength="3"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top duration-200">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Enter your {paymentMethod} UPI ID
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="username@upi"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    A payment request will be sent to your UPI app.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmBulkBookingAndPayment}
              disabled={bookingAll}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {bookingAll ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Booking All Tickets...
                </>
              ) : (
                `Confirm & Pay $${(filteredEvents.reduce((sum, e) => sum + e.price, 0) * bulkTicketCount).toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
