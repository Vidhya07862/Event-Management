import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, Calendar, MapPin, Ticket, CreditCard, ArrowLeft, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

const TicketQRCode = ({ bookingId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 120;
    canvas.width = size;
    canvas.height = size;

    // Clear and draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Draw QR Code Finder Patterns
    const drawAnchor = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 20, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 3, y + 3, 14, 14);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 6, y + 6, 8, 8);
    };

    drawAnchor(3, 3);          // Top-Left
    drawAnchor(97, 3);         // Top-Right
    drawAnchor(3, 97);         // Bottom-Left

    // Draw some random pixels representing data
    ctx.fillStyle = '#000000';
    const seed = bookingId * 17; // deterministic seed based on booking ID
    let randomVal = seed;

    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 30; col++) {
        // Exclude finder pattern regions
        const isFinder = (row < 6 && col < 6) || (row < 6 && col >= 24) || (row >= 24 && col < 6);
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
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shrink-0">
      <canvas ref={canvasRef} className="rounded-lg shadow-sm bg-white p-1"></canvas>
      <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400 mt-1 select-none">Scan Pass</span>
    </div>
  );
};

const BulkBookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get('ids') || '';
  const bookingIds = idsParam.split(',').map(id => id.trim()).filter(id => id);
  const nameParam = searchParams.get('name') || '';
  const phoneParam = searchParams.get('phone') || '';

  useEffect(() => {
    if (bookingIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAllBookingDetails = async () => {
      try {
        const results = await Promise.all(
          bookingIds.map(async (id) => {
            const bookingRes = await api.get(`/bookings/${id}`);
            const paymentRes = await api.get(`/bookings/${id}/payment`);
            return { booking: bookingRes.data, payment: paymentRes.data };
          })
        );
        setItems(results);

        // Trigger confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Error fetching bulk booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookingDetails();
  }, [idsParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500">Retrieving your ticket receipts...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 font-bold text-xl">No Bookings Found</div>
        <p className="text-slate-500">We couldn't retrieve any booking details.</p>
        <button onClick={() => navigate('/events')} className="px-4 py-2 bg-brand-500 text-white rounded-xl">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          nav, button, footer { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
          .print-card {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            margin-bottom: 2rem !important;
            background: white !important;
            color: black !important;
          }
          .print-card-header {
            background: #0d9488 !important; /* teal-600 */
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header Info */}
      <div className="text-center space-y-3">
        <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
        <h1 className="text-3xl font-extrabold font-display">Bulk Booking Confirmed!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Success! You have booked tickets for {items.length} events. Below are your official online entry passes and payment receipts. You can print this page or save it as a PDF.
        </p>
      </div>

      {/* Booking Passes List */}
      <div className="space-y-6 print-container">
        {items.map(({ booking, payment }) => (
          <div 
            key={booking.id} 
            className="glass-panel rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-800/50 print-card flex flex-col relative"
          >
            {booking.checkedIn && (
              <div className="bg-emerald-600 text-white text-center py-2 text-xs font-extrabold uppercase tracking-widest pointer-events-none select-none">
                ✓ Ticket Already Verified / Checked-In
              </div>
            )}
            {/* Ticket Header */}
            <div className="bg-gradient-brand px-6 py-4 text-white flex flex-col sm:flex-row items-center justify-between gap-2 print-card-header">
              <div>
                <p className="text-[9px] tracking-widest uppercase font-bold text-brand-200">Official Entry Pass</p>
                <h3 className="text-lg font-extrabold font-display leading-tight">{booking.event.title}</h3>
              </div>
              <div className="text-center sm:text-right shrink-0">
                <p className="text-[9px] tracking-widest uppercase font-bold text-brand-200 font-mono">Booking ID</p>
                <p className="font-mono font-bold text-xs">#EVT-{booking.id.toString().padStart(6, '0')}</p>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-450 font-bold uppercase tracking-wider text-[8px]">Attendee</p>
                    <p className="font-bold text-slate-800 dark:text-white">{nameParam || booking.user.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {booking.user.email} {phoneParam && `• ${phoneParam}`}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-450 font-bold uppercase tracking-wider text-[8px]">Ticket Quantity</p>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5 text-brand-500" />
                      {booking.ticketCount} {booking.ticketCount === 1 ? 'Pass' : 'Passes'}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px]">
                  <div className="flex items-center text-slate-650 dark:text-slate-450 gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      {new Date(booking.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} at{' '}
                      {new Date(booking.event.date).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center text-slate-650 dark:text-slate-450 gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{booking.event.location}</span>
                  </div>
                  <div className="flex items-center text-slate-650 dark:text-slate-450 gap-1.5">
                    <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      Amount Paid: <strong className="font-extrabold text-slate-800 dark:text-white">${payment.amount.toFixed(2)}</strong> ({payment.paymentMethod})
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <TicketQRCode bookingId={booking.id} />
            </div>
          </div>
        ))}
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
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all hover:scale-[1.02] hover-shine"
        >
          <Printer className="h-4 w-4" /> Print All Passes / Save PDF
        </button>
      </div>

    </div>
  );
};

export default BulkBookingConfirmation;
