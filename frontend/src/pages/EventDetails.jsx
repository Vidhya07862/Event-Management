import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, MapPin, DollarSign, User as UserIcon, Ticket, ArrowLeft, ShieldCheck, CreditCard, ChevronRight, CheckCircle2, Trash2, Mail } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking states
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Credit Card & UPI details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [userBooking, setUserBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setContactName(user.name || '');
      setContactEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchEventAndBooking = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        
        // Fetch active user booking if attendee
        if (user && user.role === 'ROLE_USER') {
          const bookingsRes = await api.get('/bookings/my');
          const booking = bookingsRes.data.find(b => b.event.id === parseInt(id) && (b.status === 'CONFIRMED' || b.status === 'PENDING'));
          if (booking) {
            setUserBooking(booking);
          }
        }
      } catch (err) {
        setError('Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndBooking();
  }, [id, user]);

  const handleCancelBooking = async () => {
    if (!userBooking) return;
    if (!window.confirm('Are you sure you want to cancel your booking for this event?')) {
      return;
    }

    setCancelLoading(true);
    try {
      await api.post(`/bookings/${userBooking.id}/cancel`);
      alert('Booking cancelled successfully.');
      setUserBooking(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove all bookings and cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete(`/events/${event.id}`);
      alert('Event deleted successfully.');
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      alert('Subject and Message are required.');
      return;
    }
    setContactLoading(true);
    try {
      await api.post('/messages', {
        eventId: event.id,
        senderName: contactName,
        senderEmail: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      alert('Your email letter has been successfully sent to the organizer!');
      setContactSubject('');
      setContactMessage('');
      setShowContactModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  };


  const handleBookTickets = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'ROLE_USER') {
      alert("Only Attendees (Users) can book tickets!");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.post('/bookings', {
        eventId: event.id,
        ticketCount: ticketCount
      });
      
      setBookingId(response.data.id);
      
      if (event.price > 0) {
        // Show payment gateway
        setShowPaymentModal(true);
      } else {
        // Free event: process payment immediately with mock UPI / zero payment
        await api.post('/bookings/payment', {
          bookingId: response.data.id,
          paymentMethod: 'Free Ticket'
        });
        navigate(`/bookings/${response.data.id}/confirmation`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setValidationError('');
    
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

    setPaymentLoading(true);
    try {
      await api.post('/bookings/payment', {
        bookingId: bookingId,
        paymentMethod: paymentMethod === 'Credit Card' ? 'Credit Card' : `UPI (${paymentMethod})`
      });
      setShowPaymentModal(false);
      
      // Clear inputs
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardHolderName('');
      setUpiId('');
      
      navigate(`/bookings/${bookingId}/confirmation`);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-bold text-xl">Error</div>
        <p className="text-slate-500">{error || 'Event could not be found.'}</p>
        <button onClick={() => navigate('/events')} className="px-4 py-2 bg-brand-500 text-white rounded-xl">
          Back to Events
        </button>
      </div>
    );
  }

  const isOrganizerOrAdmin = user && (user.role === 'ROLE_ORGANIZER' || user.role === 'ROLE_ADMIN');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to events
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden h-[400px] bg-slate-100 dark:bg-slate-900 border border-slate-200/20 shadow-lg">
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
              📆 Upcoming Event
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">{event.title}</h1>
            
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                {event.organizer.name.charAt(0)}
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Organized by</p>
                <p className="font-semibold">{event.organizer.name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold font-display">About Event</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
              {event.description || 'No description provided for this event.'}
            </p>
          </div>
        </div>

        {/* Right Side: Sticky Booking Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl shadow-xl sticky top-24 space-y-6 border border-slate-200/50 dark:border-slate-800/50">
            <div className="space-y-4">
              <h3 className="font-bold text-lg font-display">Event Info</h3>
              
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Date & Time</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(event.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Venue Location</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Ticket Price</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {event.price === 0 ? 'Free Entry' : `$${event.price} per person`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Actions */}
            {!isOrganizerOrAdmin ? (
              userBooking ? (
                <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 rounded-2xl flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                      <p className="font-bold">You are registered!</p>
                      <p className="mt-0.5">You have booked {userBooking.ticketCount} {userBooking.ticketCount === 1 ? 'ticket' : 'tickets'} for this event.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/bookings/${userBooking.id}/confirmation`)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold rounded-xl text-xs text-center transition-all"
                    >
                      View Ticket Pass
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelLoading}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {cancelLoading ? 'Cancelling Ticket...' : 'Cancel Booking'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                      <button
                        onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                        className="font-bold text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 text-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm w-4 text-center text-slate-900 dark:text-slate-100">{ticketCount}</span>
                      <button
                        onClick={() => setTicketCount(ticketCount + 1)}
                        className="font-bold text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 text-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="font-medium text-slate-500">Total Price:</span>
                    <span className="font-bold text-lg text-gradient">
                      {event.price === 0 ? 'Free' : `$${(event.price * ticketCount).toFixed(2)}`}
                    </span>
                  </div>

                  <button
                    onClick={handleBookTickets}
                    disabled={bookingLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 text-white bg-gradient-brand shadow-sm hover:shadow-brand-500/20 font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    <Ticket className="h-4 w-4" />
                    {bookingLoading ? 'Processing...' : user ? 'Book Tickets' : 'Sign In to Book'}
                  </button>
                </div>
              )
            ) : (
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-4">
                <div className="p-3.5 bg-brand-50/50 border border-brand-200/40 dark:bg-brand-950/20 dark:border-brand-900/40 rounded-2xl flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-brand-800 dark:text-brand-300">
                    <p className="font-bold">Staff View</p>
                    <p className="mt-0.5">Booking options are disabled for organizers and admins.</p>
                  </div>
                </div>
                {user && (user.role === 'ROLE_ADMIN' || event.organizer.id === user.id) && (
                  <button
                    onClick={handleDeleteEvent}
                    disabled={deleteLoading}
                    className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteLoading ? 'Deleting event...' : 'Delete Event'}
                  </button>
                )}
              </div>
            )}

            {(!user || user.id !== event.organizer.id) && (
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                    } else {
                      setShowContactModal(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-slate-700 dark:text-slate-250 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  <Mail className="h-4 w-4 text-brand-500" />
                  Report Issue / Contact Organizer
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mock Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <h3 className="font-extrabold text-lg flex items-center gap-2 font-display">
                <CreditCard className="h-5 w-5 text-brand-500" />
                Payment Gateway
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setValidationError('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Event:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{event.title}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tickets count:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{ticketCount}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-2 font-semibold">
                <span>Total Amount:</span>
                <span className="text-brand-600 dark:text-brand-400">${(event.price * ticketCount).toFixed(2)}</span>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                ⚠️ {validationError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Select Payment Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        name="paymentMethod"
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
                      // Format digits with space every 4 characters
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
              onClick={handleProcessPayment}
              disabled={paymentLoading}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {paymentLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay $${(event.price * ticketCount).toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contact Organizer Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850">
              <h3 className="font-extrabold text-lg flex items-center gap-2 font-display">
                <Mail className="h-5 w-5 text-brand-500" />
                Contact Organizer
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Booking issue, event questions, etc."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Message</label>
                <textarea
                  required
                  rows="4"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default EventDetails;
