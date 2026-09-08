import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { apiCall, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showRestock, setShowRestock] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState({ itemName: 'Cigarette', itemType: 'cigarette', brand: '', pricePerPiece: '', packSize: 20, stockInPieces: 0 });
  const [restockPacks, setRestockPacks] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await apiCall('/api/inventory');
      setItems(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/api/inventory', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Item added successfully');
      setShowAdd(false);
      setForm({ itemName: 'Cigarette', itemType: 'cigarette', brand: '', pricePerPiece: '', packSize: 20, stockInPieces: 0 });
      loadItems();
    } catch (err) { setMessage(err.message); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/api/inventory/${showEdit._id}`, { method: 'PUT', body: JSON.stringify(showEdit) });
      setMessage('Item updated successfully');
      setShowEdit(null);
      loadItems();
    } catch (err) { setMessage(err.message); }
  };

  const handleRestock = async () => {
    try {
      await apiCall('/api/inventory/restock', { method: 'POST', body: JSON.stringify({ id: showRestock._id, packs: parseInt(restockPacks) }) });
      setMessage(`Restocked ${showRestock.brand} successfully`);
      setShowRestock(null);
      setRestockPacks('');
      loadItems();
    } catch (err) { setMessage(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiCall(`/api/inventory/${id}`, { method: 'DELETE' });
      setMessage('Item deleted');
      loadItems();
    } catch (err) { setMessage(err.message); }
  };

  const itemTypeLabel = (type) => {
    const labels = { cigarette: 'Cigarette', water: 'Water', energy_drink: 'Energy Drink' };
    return labels[type] || type;
  };

  const itemTypeColor = (type) => {
    const colors = { cigarette: 'bg-amber-100 text-amber-700', water: 'bg-blue-100 text-blue-700', energy_drink: 'bg-emerald-100 text-emerald-700' };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Manage stock and pricing for all items</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Item
          </button>
        )}
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
          <button onClick={() => setMessage('')} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${itemTypeColor(item.itemType)}`}>
                  {itemTypeLabel(item.itemType)}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{item.brand}</h3>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => setShowEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Price per piece</span>
                <span className="font-semibold text-slate-800">Rs. {item.pricePerPiece}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pack size</span>
                <span className="font-medium text-slate-700">{item.packSize} pcs/pack</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Stock</span>
                <span className={`font-bold ${item.stockInPieces <= 10 ? 'text-red-600' : item.stockInPieces <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {item.stockInPieces} pieces
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Packs in stock</span>
                <span className="font-medium text-slate-700">{Math.floor(item.stockInPieces / item.packSize)} packs</span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => { setShowRestock(item); setRestockPacks(''); }}
                className="mt-4 w-full btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Restock
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Item</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Type</label>
                <select value={form.itemType} onChange={(e) => {
                  const type = e.target.value;
                  const packSize = type === 'cigarette' ? 20 : type === 'water' ? 12 : 24;
                  setForm({...form, itemType: type, packSize, itemName: type === 'cigarette' ? 'Cigarette' : type === 'water' ? 'Water Bottle' : 'Energy Drink'});
                }} className="input-field">
                  <option value="cigarette">Cigarette</option>
                  <option value="water">Water</option>
                  <option value="energy_drink">Energy Drink</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} className="input-field" placeholder="e.g., Shikhar" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per Piece (Rs.)</label>
                  <input type="number" value={form.pricePerPiece} onChange={(e) => setForm({...form, pricePerPiece: e.target.value})} className="input-field" required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pack Size</label>
                  <input type="number" value={form.packSize} onChange={(e) => setForm({...form, packSize: e.target.value})} className="input-field" required min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock (pieces)</label>
                <input type="number" value={form.stockInPieces} onChange={(e) => setForm({...form, stockInPieces: e.target.value})} className="input-field" min="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit {showEdit.brand}</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                <input type="text" value={showEdit.brand} onChange={(e) => setShowEdit({...showEdit, brand: e.target.value})} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per Piece (Rs.)</label>
                  <input type="number" value={showEdit.pricePerPiece} onChange={(e) => setShowEdit({...showEdit, pricePerPiece: e.target.value})} className="input-field" required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock (pieces)</label>
                  <input type="number" value={showEdit.stockInPieces} onChange={(e) => setShowEdit({...showEdit, stockInPieces: e.target.value})} className="input-field" min="0" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(null)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Restock {showRestock.brand}</h3>
            <p className="text-sm text-slate-500 mb-4">Each pack contains {showRestock.packSize} pieces</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Packs</label>
                <input type="number" value={restockPacks} onChange={(e) => setRestockPacks(e.target.value)} className="input-field" min="1" placeholder="Enter packs to add" />
              </div>
              {restockPacks && (
                <div className="p-3 bg-brand-50 rounded-lg">
                  <p className="text-sm text-brand-700">Will add <strong>{parseInt(restockPacks) * showRestock.packSize}</strong> pieces to stock</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowRestock(null)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handleRestock} disabled={!restockPacks || restockPacks <= 0} className="flex-1 btn-primary disabled:opacity-50">Restock</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
