import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Bookings = () => {
  const { apiCall } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadBookings = async () => {
    try {
      const data = await apiCall('/bookings');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiCall(`/bookings?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      completed: 'bg-sky-100 text-sky-700 border-sky-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500 mt-1">Manage futsal court bookings</p>
        </div>
        <a
          href="/book"
          target="_blank"
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Booking Page
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-sky-600 mt-1">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            Rs. {bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + parseFloat(b.total_price), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['all', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === f
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-slate-400">#{booking.id}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-semibold text-slate-800">{booking.customer_name}</p>
                      <p className="text-sm text-slate-600">{booking.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date & Time</p>
                      <p className="font-semibold text-slate-800">{booking.booking_date}</p>
                      <p className="text-sm text-slate-600">{booking.booking_time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="font-semibold text-slate-800">{booking.duration} hour(s)</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-bold text-emerald-600 text-lg">Rs. {booking.total_price}</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{booking.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 lg:flex-col">
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => updateStatus(booking.id, 'completed')}
                        className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-all"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500">No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;
