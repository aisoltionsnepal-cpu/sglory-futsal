import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { apiCall } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadReport(); }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await apiCall(`/api/sales/report?from=${fromDate}&to=${toDate}`);
      setReport(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalRevenue = report?.byBrand?.reduce((sum, b) => sum + b.revenue, 0) || 0;
  const totalItems = report?.byBrand?.reduce((sum, b) => sum + b.qty, 0) || 0;
  const totalTransactions = report?.bySeller?.reduce((sum, s) => sum + s.transactions, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Detailed sales insights and performance</p>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input-field" />
          </div>
          <button onClick={loadReport} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
      ) : report ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-slate-500 font-medium">Total Items Sold</p>
              <p className="text-2xl font-bold text-brand-600 mt-1">{totalItems.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-slate-500 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-violet-600 mt-1">{totalTransactions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Item */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Sales by Item</h3>
              {report.byBrand.length > 0 ? (
                <div className="space-y-3">
                  {report.byBrand.map((brand, i) => {
                    const pct = totalRevenue > 0 ? (brand.revenue / totalRevenue * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700">{brand.brand}</span>
                          <span className="text-sm text-slate-500">{brand.qty} pcs - Rs. {brand.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${
                            brand.itemType === 'cigarette' ? 'bg-amber-500' :
                            brand.itemType === 'water' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No data for selected period</p>
              )}
            </div>

            {/* Sales by Seller */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Sales by Staff</h3>
              {report.bySeller.length > 0 ? (
                <div className="space-y-3">
                  {report.bySeller.map((seller, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-brand-700">{seller.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{seller.name}</p>
                          <p className="text-xs text-slate-500">{seller.transactions} transactions</p>
                        </div>
                      </div>
                      <p className="font-bold text-emerald-600">Rs. {seller.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No data for selected period</p>
              )}
            </div>
          </div>

          {/* Daily Sales */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Breakdown</h3>
            {report.dailySales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Items Sold</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailySales.map((day, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-700">{day.date}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 text-right">{day.items}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-emerald-600 text-right">Rs. {day.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No daily data for selected period</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
