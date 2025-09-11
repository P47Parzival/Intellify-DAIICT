import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, BarChart2, Shield, Clock } from 'lucide-react';

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

const ExecutiveDashboard = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:8000/api/kpis')
        .then(res => res.json())
        .then(data => {
          setKpis(data);
          setLoading(false);
        })
        .catch(err => console.error("Failed to fetch KPIs:", err));
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !kpis) {
    return <div className="text-center text-white p-10">Loading Executive Report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium">Total Alerts (24h)</h3>
          <p className="text-4xl font-bold text-white mt-2">{kpis.total_alerts_24h}</p>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium">Avg. Risk Score</h3>
          <p className="text-4xl font-bold text-orange-400 mt-2">{Math.round(kpis.average_risk_score)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-96">
          <h3 className="text-lg font-semibold text-white mb-4">Alerts by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={kpis.alerts_by_type} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {kpis.alerts_by_type.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-96">
          <h3 className="text-lg font-semibold text-white mb-4">Alerts by Asset Criticality</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.alerts_by_criticality}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Bar dataKey="value" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-96">
        <h3 className="text-lg font-semibold text-white mb-4">Alerts Over Time (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kpis.alerts_over_time}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Legend />
            <Line type="monotone" dataKey="alerts" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;