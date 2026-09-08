import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { apiCall } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date(Date.now()-30*86400000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const loadReport = async () => {
    setLoading(true);
    try { const d = await apiCall(`/sales/report?from=${fromDate}&to=${toDate}`); setReport(d); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, []);

  const totalRevenue = report?.byBrand?.reduce((s, b) => s + b.revenue, 0) || 0;
  const totalItems = report?.byBrand?.reduce((s, b) => s + b.qty, 0) || 0;
  const totalTxn = report?.bySeller?.reduce((s, x) => s + x.transactions, 0) || 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1><p className="text-slate-500 mt-1">Detailed sales insights</p></div>
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field" /></div>
          <button onClick={loadReport} className="btn-primary">Generate Report</button>
        </div>
      </div>
      {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div> : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card"><p className="text-sm text-slate-500 font-medium">Total Revenue</p><p className="text-2xl font-bold text-emerald-600 mt-1">Rs. {totalRevenue.toLocaleString()}</p></div>
            <div className="stat-card"><p className="text-sm text-slate-500 font-medium">Items Sold</p><p className="text-2xl font-bold text-sky-600 mt-1">{totalItems}</p></div>
            <div className="stat-card"><p className="text-sm text-slate-500 font-medium">Transactions</p><p className="text-2xl font-bold text-violet-600 mt-1">{totalTxn}</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sales by Item</h3>
              {report.byBrand.length > 0 ? <div className="space-y-3">{report.byBrand.map((b, i) => { const pct = totalRevenue > 0 ? (b.revenue / totalRevenue * 100) : 0; return (<div key={i} className="space-y-1"><div className="flex justify-between"><span className="font-medium text-slate-700">{b.brand}</span><span className="text-sm text-slate-500">{b.qty} pcs - Rs. {b.revenue.toLocaleString()}</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className={`h-2 rounded-full ${b.itemType==='cigarette'?'bg-amber-500':b.itemType==='water'?'bg-blue-500':'bg-emerald-500'}`} style={{width:`${pct}%`}}></div></div></div>);})}</div> : <p className="text-slate-400 text-center py-8">No data</p>}
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sales by Staff</h3>
              {report.bySeller.length > 0 ? <div className="space-y-3">{report.bySeller.map((s, i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-sky-700">{s.name?.charAt(0)}</span></div><div><p className="font-medium">{s.name}</p><p className="text-xs text-slate-500">{s.transactions} txns</p></div></div><p className="font-bold text-emerald-600">Rs. {s.revenue.toLocaleString()}</p></div>))}</div> : <p className="text-slate-400 text-center py-8">No data</p>}
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Breakdown</h3>
            {report.dailySales.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200"><th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th><th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Items</th><th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Revenue</th></tr></thead><tbody>{report.dailySales.map((d, i) => (<tr key={i} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4 text-sm font-medium">{d.date}</td><td className="py-3 px-4 text-sm text-right">{d.items}</td><td className="py-3 px-4 text-sm font-semibold text-emerald-600 text-right">Rs. {d.revenue.toLocaleString()}</td></tr>))}</tbody></table></div>
            ) : <p className="text-slate-400 text-center py-8">No data</p>}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
