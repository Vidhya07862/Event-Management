import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Calendar, MapPin, Ticket, CreditCard, ArrowLeft, Printer, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

const TicketQRCode = ({ bookingId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 160;
    canvas.width = size;
    canvas.height = size;

    // Clear and draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw QR Code Finder Patterns (anchors at three corners)
    const drawAnchor = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 28, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 4, y + 4, 20, 20);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 8, y + 8, 12, 12);
    };

    drawAnchor(4, 4);          // Top-Left
    drawAnchor(128, 4);        // Top-Right
    drawAnchor(4, 128);        // Bottom-Left

    // Draw some random pixels representing data
    ctx.fillStyle = '#000000';
    const seed = bookingId * 17; // deterministic seed based on booking ID
    let randomVal = seed;
    
    for (let row = 0; row < 40; row++) {
      for (let col = 0; col < 40; col++) {
        // Exclude finder pattern regions
        const isFinder = (row < 8 && col < 8) || (row < 8 && col >= 32) || (row >= 32 && col < 8);
        if (isFinder) continue;

        // Deterministic pseudo-random logic
        randomVal = (randomVal * 9301 + 49297) % 233280;
        if (randomVal / 233280 > 0.5) {
          ctx.fillRect(col * 4, row * 4, 4, 4);
        }
      }
    }
  }, [bookingId]);

  return (
    <div className="flex flex-col items-center justify-center space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shrink-0">
      <canvas ref={canvasRef} className="rounded-lg shadow-sm bg-white p-1.5"></canvas>
      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 select-none">Scan at Entrance</span>
    </div>
  );
};

const BookingConfirmation = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingRes = await api.get(`/bookings/${id}`);
        setBooking(bookingRes.data);
        const paymentRes = await api.get(`/bookings/${id}/payment`);
        setPayment(paymentRes.data);
        
        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500">Retrieving booking receipt...</p>
      </div>
    );
  }

  if (!booking || !payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-bold text-xl">Booking Not Found</div>
        <p className="text-slate-500">We couldn't retrieve details for this booking.</p>
        <button onClick={() => navigate('/events')} className="px-4 py-2 bg-brand-500 text-white rounded-xl">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          nav, button, footer { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
          .print-header { text-align: center; }
        }
      `}</style>

      {/* Header Info */}
      <div className="text-center space-y-3">
        <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
        <h1 className="text-3xl font-extrabold font-display">Booking Confirmed!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Thank you for your purchase. Your ticket has been generated. You can download or print this page as your official entry ticket.
        </p>
      </div>

      {/* Ticket Layout Card */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 print-container relative">
        {booking.checkedIn && (
          <div className="bg-emerald-600 text-white text-center py-2.5 text-xs font-extrabold uppercase tracking-widest">
            ✓ Ticket Already Verified / Checked-In
          </div>
        )}
        
        {/* Ticket Header */}
        <div className="bg-gradient-brand px-8 py-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 print-header">
          <div>
            <p className="text-[10px] tracking-widest uppercase font-bold text-brand-200">Official Ticket</p>
            <h2 className="text-2xl font-extrabold font-display mt-0.5">EventHub Entry Pass</h2>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[10px] tracking-widest uppercase font-bold text-brand-200">Booking ID</p>
            <p className="font-mono font-bold text-sm">#EVT-{booking.id.toString().padStart(6, '0')}</p>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8 grid md:grid-cols-3 gap-8 items-center">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-500">Event Pass</span>
              <h3 className="text-xl font-bold font-display">{booking.event.title}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Attendee</p>
                <p className="font-bold text-slate-800 dark:text-white">{booking.user.name}</p>
                <p className="text-slate-500">{booking.user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Ticket Count</p>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <Ticket className="h-3.5 w-3.5 text-brand-500" />
                  {booking.ticketCount} {booking.ticketCount === 1 ? 'Person' : 'People'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 gap-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>
                  {new Date(booking.event.date).toLocaleDateString(undefined, { dateStyle: 'full' })} at{' '}
                  {new Date(booking.event.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 gap-2">
                <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>{booking.event.location}</span>
              </div>
              <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 gap-2">
                <CreditCard className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>
                  Paid <strong className="font-bold text-slate-800 dark:text-white">${payment.amount.toFixed(2)}</strong> via{' '}
                  {payment.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <TicketQRCode bookingId={booking.id} />

        </div>

      </div>

      {/* Button Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2">
        <button
          onClick={() => navigate('/user-dashboard')}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-sm font-semibold transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Go to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
      </div>

    </div>
  );
};

export default BookingConfirmation;
