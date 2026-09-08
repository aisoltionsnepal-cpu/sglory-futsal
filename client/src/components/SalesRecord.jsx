import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SalesRecord = () => {
  const { apiCall } = useAuth();
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [todayTotal, setTodayTotal] = useState(0);

  const loadData = async () => {
    try {
      const [i, s, sum] = await Promise.all([apiCall('/inventory'), apiCall('/sales/today'), apiCall('/sales/summary')]);
      setItems(i); setSales(s); setTodayTotal(sum?.today?.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    setSubmitting(true); setMessage('');
    try {
      await apiCall('/sales', { method: 'POST', body: JSON.stringify({ inventoryId: parseInt(selectedItem), quantity: parseInt(quantity) }) });
      setMessage('Sale recorded!'); setSelectedItem(''); setQuantity(''); loadData();
    } catch (err) { setMessage(err.message); }
    finally { setSubmitting(false); }
  };

  const sel = items.find(i => i.id === parseInt(selectedItem));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">Record Sale</h1><p className="text-slate-500 mt-1">Log a new sale transaction</p></div>
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl p-5 text-white shadow-lg shadow-sky-600/20">
        <div className="flex items-center justify-between">
          <div><p className="text-sky-200 text-sm font-medium">Today's Total Sales</p><p className="text-3xl font-bold mt-1">Rs. {todayTotal.toLocaleString()}</p></div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">New Sale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={selectedItem} onChange={(e) => { setSelectedItem(e.target.value); setQuantity(''); }} className="input-field">
              <option value="">Choose item...</option>
              {items.map(i => <option key={i.id} value={i.id} disabled={i.stock_in_pieces <= 0}>{i.brand} - Rs.{i.price_per_piece}/pc ({i.stock_in_pieces} stock)</option>)}
            </select>
            {sel && <div className="p-4 bg-slate-50 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Price/piece</span><span className="font-medium">Rs. {sel.price_per_piece}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Stock</span><span className={`font-medium ${sel.stock_in_pieces<=10?'text-red-600':'text-emerald-600'}`}>{sel.stock_in_pieces} pcs</span></div>
            </div>}
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" placeholder="Quantity" min="1" max={sel?.stock_in_pieces||0} required />
            {sel && quantity > 0 && <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200"><div className="flex justify-between items-center"><span className="text-emerald-700 font-medium">Total</span><span className="text-2xl font-bold text-emerald-700">Rs. {(sel.price_per_piece * parseInt(quantity)).toLocaleString()}</span></div></div>}
            {message && <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('recorded') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message}</div>}
            <button type="submit" disabled={submitting || !selectedItem || !quantity} className="w-full btn-success py-3 text-base font-semibold disabled:opacity-50">
              {submitting ? 'Processing...' : 'Record Sale'}
            </button>
          </form>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Sales ({sales.length})</h3>
          {sales.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sales.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div><p className="font-medium text-slate-800">{s.brand}</p><p className="text-xs text-slate-500">{s.quantity} pcs by {s.seller_name}</p></div>
                  <div className="text-right"><p className="font-bold text-emerald-600">Rs. {s.total_price}</p><p className="text-xs text-slate-400">{s.sale_time}</p></div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-center py-12">No sales today</p>}
        </div>
      </div>
    </div>
  );
};

export default SalesRecord;
