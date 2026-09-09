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
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-6 shadow-lg shadow-emerald-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-emerald-200 mb-6">Your futsal court has been booked successfully</p>
            
            <div className="bg-white/10 rounded-2xl p-6 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Booking ID</span>
                  <span className="text-white font-semibold">#{bookingDetails?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Date</span>
                  <span className="text-white font-semibold">{bookingDetails?.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Time</span>
                  <span className="text-white font-semibold">{bookingDetails?.booking_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Duration</span>
                  <span className="text-white font-semibold">{bookingDetails?.duration} hour(s)</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-3 mt-3">
                  <span className="text-emerald-200 font-medium">Total Paid</span>
                  <span className="text-emerald-400 font-bold text-xl">Rs. {bookingDetails?.total_price}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => { setSuccess(false); setBookingDetails(null); }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              Book Another Slot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-emerald-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl mb-6 shadow-2xl shadow-sky-500/40">
              <span className="text-4xl font-black text-white tracking-tight">SG</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              S-GLORY <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">FUTSAL</span>
            </h1>
            <p className="text-xl text-sky-200 max-w-2xl mx-auto">
              Book your court now and experience premium futsal facilities
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center hover:bg-white/15 transition-all">
            <div className="w-14 h-14 bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sky-200 text-sm mb-1">Per Hour</p>
            <p className="text-3xl font-bold text-white">Rs. 1,000</p>
          </div>
          
          <div className="bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl p-6 border border-white/20 text-center shadow-2xl shadow-sky-500/30 scale-105">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/80 text-sm mb-1">Book Now</p>
            <p className="text-3xl font-bold text-white">Instant</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center hover:bg-white/15 transition-all">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-emerald-200 text-sm mb-1">Team Booking</p>
            <p className="text-3xl font-bold text-white">Available</p>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Book Your Court</h2>
                <p className="text-white/80">Fill in the details below</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      placeholder="98XXXXXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Booking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Booking Date *</label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Time *</label>
                    <select
                      name="bookingTime"
                      value={formData.bookingTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-white"
                      required
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Hours) *</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => formData.duration > 1 && setFormData(prev => ({ ...prev, duration: prev.duration - 1 }))}
                      className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all text-slate-600 font-bold text-xl"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-bold text-sky-600">{formData.duration}</span>
                      <span className="text-slate-500 ml-2">hour(s)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => formData.duration < 12 && setFormData(prev => ({ ...prev, duration: prev.duration + 1 }))}
                      className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all text-slate-600 font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Special Requests (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all resize-none"
                  placeholder="Any special requirements..."
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-6 border border-sky-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Rate per hour</span>
                  <span className="font-semibold text-slate-800">Rs. {pricePerHour.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-800">{formData.duration} hour(s)</span>
                </div>
                <div className="border-t border-sky-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                    <span className="text-3xl font-bold text-sky-600">Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center border-t border-white/10">
        <p className="text-sky-300/60 text-sm">
          &copy; 2026 S-Glory Futsal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Booking;
