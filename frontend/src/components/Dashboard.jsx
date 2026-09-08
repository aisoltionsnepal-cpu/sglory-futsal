import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { apiCall, isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, todayData] = await Promise.all([
        apiCall('/api/sales/summary'),
        apiCall('/api/sales/today')
      ]);
      setSummary(summaryData);
      setTodaySales(todayData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  const stats = [
    { label: "Today's Revenue", value: `Rs. ${(summary?.today?.total || 0).toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: "Items Sold Today", value: summary?.today?.items || 0, color: 'text-brand-600', bg: 'bg-brand-50', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: "This Month", value: `Rs. ${(summary?.month?.total || 0).toLocaleString()}`, color: 'text-violet-600', bg: 'bg-violet-50', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: "Active Items", value: summary?.today?.byBrand?.length || 0, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of today's activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sales by Brand */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Sales by Item</h3>
          {summary?.today?.byBrand?.length > 0 ? (
            <div className="space-y-3">
              {summary.today.byBrand.map((brand, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${brand.itemType === 'cigarette' ? 'bg-amber-500' : brand.itemType === 'water' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                    <span className="font-medium text-slate-700">{brand.brand}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">Rs. {brand.revenue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{brand.qty} pcs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No sales today</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h3>
          {todaySales.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {todaySales.slice(0, 10).map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-700">{sale.inventoryId?.brand}</p>
                    <p className="text-xs text-slate-500">{sale.quantity} pcs by {sale.soldBy?.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">Rs. {sale.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{sale.saleTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No transactions today</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
