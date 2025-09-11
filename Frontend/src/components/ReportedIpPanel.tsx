import React, { useState, useEffect } from 'react';
import { Flag } from 'lucide-react';

interface ReportedIp {
  id: number;
  ip: string;
  report_count: number;
  last_reported_at: string;
  status: string;
}

const ReportedIpPanel = () => {
  const [reportedIps, setReportedIps] = useState<ReportedIp[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:8000/api/reported_ips')
        .then(res => res.json())
        .then(data => setReportedIps(data))
        .catch(err => console.error("Failed to fetch reported IPs:", err));
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/30 shadow-lg">
      <div className="px-6 py-5 bg-slate-900/60 border-b border-slate-700/40">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
          <Flag className="w-6 h-6 text-cyan-400" />
          <span>User-Reported IPs</span>
        </h3>
      </div>
      <div className="max-h-80 overflow-y-auto custom-scrollbar p-4">
        {reportedIps.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No IPs reported by users yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="text-left py-2 px-3">IP Address</th>
                <th className="text-center py-2 px-3">Reports</th>
                <th className="text-left py-2 px-3">Last Seen</th>
                <th className="text-right py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {reportedIps.map(item => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                  <td className="py-3 px-3 font-mono">{item.ip}</td>
                  <td className="py-3 px-3 text-center font-bold text-orange-400">{item.report_count}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(item.last_reported_at).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-1 text-xs font-semibold text-cyan-200 bg-cyan-800/50 rounded-full">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportedIpPanel;