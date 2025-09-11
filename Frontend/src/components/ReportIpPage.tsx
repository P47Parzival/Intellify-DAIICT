import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ReportIpPage = () => {
  const [ip, setIp] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Basic IP regex validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      setMessage('Please enter a valid IPv4 address.');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/report_ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');
      
      setMessage(data.message);
      setIsError(false);
      setIp('');
    } catch (error: any) {
      setMessage(error.message);
      setIsError(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Report Suspicious Activity</h1>
          <p className="text-slate-400 mt-2">If you've noticed a suspicious IP address, please report it below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="ip" className="text-sm font-medium text-slate-300">Suspicious IP Address</label>
            <input
              id="ip"
              name="ip"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 192.168.1.100"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900"
          >
            Submit Report
          </button>
        </form>
        {message && (
          <div className={`flex items-center p-4 rounded-md ${isError ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
            {isError ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIpPage;