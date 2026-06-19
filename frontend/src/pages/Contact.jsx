import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate contact submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Contact Us</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Have questions or need assistance? Get in touch with our team.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Contact info list */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h2 className="font-bold text-lg font-display">Support Channels</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Email Support</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">support@eventmgmt.com</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Phone Hotline</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">+1 (800) 555-EVNT</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mon - Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">HQ Office</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    100 Event Plaza, Suite 400<br />New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50 space-y-6">
            <h2 className="font-bold text-xl font-display">Send a Message</h2>
            
            {submitted ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 rounded-2xl text-center space-y-3">
                <MessageSquare className="h-10 w-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400">Message Sent Successfully</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                  Thank you for reaching out. A support representative has received your ticket and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Message Details</label>
                  <textarea
                    required
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Type your questions or inquiries here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="h-4.5 w-4.5" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Contact;
