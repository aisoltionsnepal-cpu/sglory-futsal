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

  useEffect(() => { apiCall('/inventory').then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await apiCall('/inventory', { method: 'POST', body: JSON.stringify(form) }); setMessage('Item added'); setShowAdd(false); setForm({ itemName: 'Cigarette', itemType: 'cigarette', brand: '', pricePerPiece: '', packSize: 20, stockInPieces: 0 }); apiCall('/inventory').then(setItems); }
    catch (err) { setMessage(err.message); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemName: showEdit.item_name,
        itemType: showEdit.item_type,
        brand: showEdit.brand,
        pricePerPiece: Number(showEdit.price_per_piece),
        packSize: Number(showEdit.pack_size),
        stockInPieces: Number(showEdit.stock_in_pieces)
      };
      await apiCall(`/inventory?id=${showEdit.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setMessage('Item updated');
      setShowEdit(null);
      apiCall('/inventory').then(setItems);
    } catch (err) { setMessage(err.message); }
  };

  const handleRestock = async () => {
    try { await apiCall('/inventory/restock', { method: 'POST', body: JSON.stringify({ id: showRestock.id, packs: parseInt(restockPacks) }) }); setMessage('Restocked'); setShowRestock(null); setRestockPacks(''); apiCall('/inventory').then(setItems); }
    catch (err) { setMessage(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await apiCall(`/inventory?id=${id}`, { method: 'DELETE' }); setMessage('Deleted'); apiCall('/inventory').then(setItems); }
    catch (err) { setMessage(err.message); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1><p className="text-slate-500 mt-1">Manage stock and pricing</p></div>
        {isAdmin && <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Item</button>}
      </div>
      {message && <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('added') || message.includes('updated') || message.includes('Restocked') || message.includes('Deleted') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message}<button onClick={() => setMessage('')} className="float-right font-bold">&times;</button></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.item_type === 'cigarette' ? 'bg-amber-100 text-amber-700' : item.item_type === 'water' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.item_type}</span>
              {isAdmin && <div className="flex gap-1"><button onClick={() => setShowEdit(item)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">Edit</button><button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">Del</button></div>}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.brand}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Price/piece</span><span className="font-semibold">Rs. {item.price_per_piece}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pack size</span><span className="font-medium">{item.pack_size} pcs</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Stock</span><span className={`font-bold ${item.stock_in_pieces <= 10 ? 'text-red-600' : 'text-emerald-600'}`}>{item.stock_in_pieces} pcs</span></div>
            </div>
            {isAdmin && <button onClick={() => { setShowRestock(item); setRestockPacks(''); }} className="mt-3 w-full btn-secondary text-sm">Restock</button>}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Add New Item</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <select value={form.itemType} onChange={(e) => { const t = e.target.value; setForm({...form, itemType: t, packSize: t==='cigarette'?20:t==='water'?12:24, itemName: t==='cigarette'?'Cigarette':t==='water'?'Water Bottle':'Energy Drink'}); }} className="input-field"><option value="cigarette">Cigarette</option><option value="water">Water</option><option value="energy_drink">Energy Drink</option></select>
              <input type="text" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} className="input-field" placeholder="Brand name" required />
              <div className="grid grid-cols-2 gap-4"><input type="number" value={form.pricePerPiece} onChange={(e) => setForm({...form, pricePerPiece: e.target.value})} className="input-field" placeholder="Price/piece" required min="1" /><input type="number" value={form.packSize} onChange={(e) => setForm({...form, packSize: e.target.value})} className="input-field" placeholder="Pack size" required /></div>
              <input type="number" value={form.stockInPieces} onChange={(e) => setForm({...form, stockInPieces: e.target.value})} className="input-field" placeholder="Initial stock" min="0" />
              <div className="flex gap-3"><button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">Cancel</button><button type="submit" className="flex-1 btn-primary">Add</button></div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Edit {showEdit.brand}</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="text" value={showEdit.brand} onChange={(e) => setShowEdit({...showEdit, brand: e.target.value})} className="input-field" required />
              <div className="grid grid-cols-2 gap-4"><input type="number" value={showEdit.price_per_piece} onChange={(e) => setShowEdit({...showEdit, price_per_piece: e.target.value})} className="input-field" required min="1" /><input type="number" value={showEdit.stock_in_pieces} onChange={(e) => setShowEdit({...showEdit, stock_in_pieces: e.target.value})} className="input-field" min="0" /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowEdit(null)} className="flex-1 btn-secondary">Cancel</button><button type="submit" className="flex-1 btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Restock {showRestock.brand}</h3>
            <p className="text-sm text-slate-500 mb-4">Pack size: {showRestock.pack_size} pcs</p>
            <input type="number" value={restockPacks} onChange={(e) => setRestockPacks(e.target.value)} className="input-field mb-2" min="1" placeholder="Number of packs" />
            {restockPacks && <p className="text-sm text-sky-600 mb-4">Will add {parseInt(restockPacks)*showRestock.pack_size} pieces</p>}
            <div className="flex gap-3"><button onClick={() => setShowRestock(null)} className="flex-1 btn-secondary">Cancel</button><button onClick={handleRestock} disabled={!restockPacks} className="flex-1 btn-primary disabled:opacity-50">Restock</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
