import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Flag, Clock } from 'lucide-react';

const REPORT_CATEGORIES = [
  "DNS Compromise", "DNS Poisoning", "Fraud Orders", "DDoS Attack", 
  "Open Proxy", "Web Spam", "Email Spam", "Port Scan", "Spoofing", 
  "Brute-Force", "Bad Web Bot", "Exploited Host", "Web App Attack", 
  "SSH", "IoT Targeted", "FTP Brute-Force", "Ping of Death", "Phishing", 
  "Fraud VoIP", "Blog Spam", "VPN IP", "Hacking", "SQL Injection"
];

interface RecentReport {
  ip: string;
  last_reported_at: string;
  categories: string[];
}

const ReportIpPage = () => {
  const [ip, setIp] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);

  const fetchRecentReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reported_ips');
      const data = await response.json();
      // Add null check and ensure data is an array
      setRecentReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
      // Set empty array on error to prevent undefined issues
      setRecentReports([]);
    }
  };

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      setMessage('Please enter a valid IPv4 address.');
      setIsError(true);
      return;
    }
    if (selectedCategories.length === 0) {
      setMessage('Please select at least one reason for your report.');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/report_ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, categories: selectedCategories }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');
      
      setMessage(data.message);
      setIsError(false);
      setIp('');
      setSelectedCategories([]);
      fetchRecentReports(); // Refresh the list after successful submission
    } catch (error: any) {
      setMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-slate-900 py-12 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Reporting Form Card */}
        <div className="p-8 space-y-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Report Suspicious Activity</h1>
            <p className="text-slate-400 mt-2">Help secure our network by reporting suspicious IP addresses.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="ip" className="text-sm font-medium text-slate-300">Suspicious IP Address</label>
              <input id="ip" name="ip" type="text" value={ip} onChange={(e) => setIp(e.target.value)} required
                className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 192.168.1.100" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300">Reason for Report (select at least one)</label>
              <div className="mt-2 h-40 overflow-y-auto p-4 bg-slate-900 border border-slate-600 rounded-md grid grid-cols-2 md:grid-cols-3 gap-2 custom-scrollbar">
                {REPORT_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-blue-600 focus:ring-blue-500" />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleSubmit} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900">
              Submit Report
            </button>
          </div>
          {message && (
            <div className={`flex items-center p-4 rounded-md ${isError ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
              {isError ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
              <span className="text-sm">{message}</span>
            </div>
          )}
        </div>

        {/* Recently Reported IPs Card */}
        <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><Clock className="w-6 h-6 mr-3 text-slate-400"/>Recently Reported IPs</h2>
          <div className="space-y-4">
            {recentReports && recentReports.length > 0 ? recentReports.map((report, index) => (
              <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-mono text-lg text-orange-400">{report?.ip || 'Unknown IP'}</p>
                  <p className="text-xs text-slate-500">
                    {report?.last_reported_at ? new Date(report.last_reported_at).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Add null check for categories */}
                  {report?.categories && Array.isArray(report.categories) ? 
                    report.categories.map(cat => (
                      <span key={cat} className="px-2 py-1 text-xs font-semibold text-cyan-200 bg-cyan-800/50 rounded-full">{cat}</span>
                    )) : (
                      <span className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-700/50 rounded-full">No categories</span>
                    )
                  }
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-center py-4">No recent reports. Be the first to submit one!</p>
            )}
          </div>
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }`}</style>
    </div>
  );
};

export default ReportIpPage;