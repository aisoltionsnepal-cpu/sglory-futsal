import { useState } from 'react';

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    bookingDate: '',
    bookingTime: '',
    duration: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  const pricePerHour = 1000;
  const totalPrice = pricePerHour * formData.duration;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingDetails(data.booking);
      setSuccess(true);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        bookingDate: '',
        bookingTime: '',
        duration: 1,
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-6 shadow-2xl shadow-emerald-500/40 animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Booking Confirmed!</h2>
            <p className="text-emerald-300 text-lg mb-6">Your court has been reserved</p>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-6 text-left border border-white/10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/80">Booking ID</span>
                  <span className="text-white font-bold text-lg">#{bookingDetails?.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/80">Date</span>
                  <span className="text-white font-semibold">{bookingDetails?.booking_date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/80">Time</span>
                  <span className="text-white font-semibold">{bookingDetails?.booking_time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/80">Duration</span>
                  <span className="text-white font-semibold">{bookingDetails?.duration} hour(s)</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-emerald-200 font-medium text-lg">Total Paid</span>
                  <span className="text-emerald-400 font-black text-3xl">Rs. {bookingDetails?.total_price}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => { setSuccess(false); setBookingDetails(null); }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Book Another Slot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Background Image */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-sky-900/30" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-3xl rotate-6 opacity-60 blur-xl" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-sky-500 rounded-3xl w-28 h-28 flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-black text-white tracking-tighter">SG</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">
            S-GLORY
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">FUTSAL</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-light">
            Premium futsal experience. Book your court and play like a pro.
          </p>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gradient-to-b from-black to-slate-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Rs. 1,000</h3>
                <p className="text-white/60">Per Hour</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-emerald-500/20 to-sky-500/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-2 shadow-2xl shadow-emerald-500/20">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Instant</h3>
                <p className="text-white/60">Booking Confirmation</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Team</h3>
                <p className="text-white/60">Booking Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="relative bg-gradient-to-b from-slate-900 to-black py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Book Your Court</h2>
            <p className="text-xl text-white/60">Reserve your slot in just a few clicks</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-sky-500 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Reserve Your Slot</h3>
                      <p className="text-white/80">Fill in the details below</p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-white/30"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-white/30"
                            placeholder="98XXXXXXXX"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-white/70 mb-2">Email (Optional)</label>
                        <input
                          type="email"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-white/30"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Date *</label>
                          <input
                            type="date"
                            name="bookingDate"
                            value={formData.bookingDate}
                            onChange={handleChange}
                            min={getMinDate()}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Time *</label>
                          <select
                            name="bookingTime"
                            value={formData.bookingTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white"
                            required
                          >
                            <option value="" className="bg-slate-900">Select time</option>
                            {timeSlots.map(time => (
                              <option key={time} value={time} className="bg-slate-900">{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-white/70 mb-3">Duration *</label>
                        <div className="flex items-center gap-6">
                          <button
                            type="button"
                            onClick={() => formData.duration > 1 && setFormData(prev => ({ ...prev, duration: prev.duration - 1 }))}
                            className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all text-white font-bold text-2xl hover:border-emerald-500/50"
                          >
                            -
                          </button>
                          <div className="flex-1 text-center">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">{formData.duration}</span>
                            <span className="text-white/50 ml-3 text-lg">hour(s)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => formData.duration < 12 && setFormData(prev => ({ ...prev, duration: prev.duration + 1 }))}
                            className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center transition-all text-white font-bold text-2xl hover:border-emerald-500/50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Special Requests (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-white placeholder-white/30"
                        placeholder="Any special requirements..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    Booking Summary
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Rate</span>
                      <span className="text-white font-semibold">Rs. {pricePerHour.toLocaleString()}/hr</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Duration</span>
                      <span className="text-white font-semibold">{formData.duration} hr</span>
                    </div>
                    {formData.bookingDate && (
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/60">Date</span>
                        <span className="text-white font-semibold">{formData.bookingDate}</span>
                      </div>
                    )}
                    {formData.bookingTime && (
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/60">Time</span>
                        <span className="text-white font-semibold">{formData.bookingTime}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-2xl p-6 border border-emerald-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 font-medium">Total Amount</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 font-black text-4xl">
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-4">Quick Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/70">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">Premium Futsal Court</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">6:00 AM - 11:00 PM</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Instant Confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30">
            <span className="text-2xl font-black text-white">SG</span>
          </div>
          <p className="text-white/40 text-sm mb-2">&copy; 2026 S-Glory Futsal. All rights reserved.</p>
          <p className="text-white/30 text-xs">Premium Futsal Experience</p>
        </div>
      </footer>
    </div>
  );
};

export default Booking;
