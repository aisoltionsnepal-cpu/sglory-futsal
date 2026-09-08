import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SalesRecord = () => {
  const { apiCall, isAdmin, user } = useAuth();
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [itemsData, salesData, summaryData] = await Promise.all([
        apiCall('/api/inventory'),
        apiCall('/api/sales/today'),
        apiCall('/api/sales/summary')
      ]);
      setItems(itemsData);
      setSales(salesData);
      setTodayTotal(summaryData?.today?.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;
    setSubmitting(true);
    setMessage('');
    try {
      await apiCall('/api/sales', {
        method: 'POST',
        body: JSON.stringify({ inventoryId: selectedItem, quantity: parseInt(quantity) })
      });
      setMessage('Sale recorded successfully!');
      setSelectedItem('');
      setQuantity('');
      loadData();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItemData = items.find(i => i._id === selectedItem);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Record Sale</h1>
        <p className="text-slate-500 mt-1">Log a new sale transaction</p>
      </div>

      {/* Today's Summary Bar */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-5 text-white shadow-lg shadow-brand-600/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-200 text-sm font-medium">Today's Total Sales</p>
            <p className="text-3xl font-bold mt-1">Rs. {todayTotal.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Form */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">New Sale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Item</label>
              <select value={selectedItem} onChange={(e) => { setSelectedItem(e.target.value); setQuantity(''); }} className="input-field">
                <option value="">Choose an item...</option>
                {items.map(item => (
                  <option key={item._id} value={item._id} disabled={item.stockInPieces <= 0}>
                    {item.brand} - Rs.{item.pricePerPiece}/pc ({item.stockInPieces} in stock)
                  </option>
                ))}
              </select>
            </div>

            {selectedItemData && (
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Item</span>
                  <span className="font-medium">{selectedItemData.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Price per piece</span>
                  <span className="font-medium">Rs. {selectedItemData.pricePerPiece}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Available stock</span>
                  <span className={`font-medium ${selectedItemData.stockInPieces <= 10 ? 'text-red-600' : 'text-emerald-600'}`}>{selectedItemData.stockInPieces} pieces</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity (pieces)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
                placeholder="Enter quantity"
                min="1"
                max={selectedItemData?.stockInPieces || 0}
                required
              />
            </div>

            {selectedItemData && quantity && quantity > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-700">Rs. {(selectedItemData.pricePerPiece * parseInt(quantity)).toLocaleString()}</span>
                </div>
              </div>
            )}

            {message && (
              <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedItem || !quantity}
              className="w-full btn-success py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Record Sale</>
              )}
            </button>
          </form>
        </div>

        {/* Today's Sales List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Sales ({sales.length})</h3>
          {sales.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      sale.inventoryId?.itemType === 'cigarette' ? 'bg-amber-100 text-amber-600' :
                      sale.inventoryId?.itemType === 'water' ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{sale.inventoryId?.brand}</p>
                      <p className="text-xs text-slate-500">{sale.quantity} pcs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">Rs. {sale.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{sale.saleTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400">No sales recorded today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesRecord;
