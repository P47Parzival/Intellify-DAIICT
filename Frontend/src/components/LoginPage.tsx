import React, { useState } from 'react';
import { ShieldCheck, User, X } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'soc' | 'user') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSocModal, setShowSocModal] = useState(false);
  const [socId, setSocId] = useState('');
  const [socPassword, setSocPassword] = useState('');
  const [error, setError] = useState('');

  const handleSocLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demonstration
    if (socId === '123456' && socPassword === '1234') {
      onLogin('soc');
    } else {
      setError('Invalid SOC ID or Password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center p-10 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to the Security Monitor</h1>
        <p className="text-slate-400 mb-8">Please select your role to continue.</p>
        <div className="flex flex-col md:flex-row gap-6">
          {/* SOC Team Member Button */}
          <button
            onClick={() => setShowSocModal(true)}
            className="group flex flex-col items-center justify-center p-8 bg-blue-900/30 border-2 border-blue-500/50 rounded-lg hover:bg-blue-900/50 hover:border-blue-500 transition-all duration-300"
          >
            <ShieldCheck className="w-16 h-16 text-blue-400 mb-4 transition-transform group-hover:scale-110" />
            <h2 className="text-2xl font-semibold text-white">SOC Team Member</h2>
            <p className="text-blue-300/70">Access the full security dashboard.</p>
          </button>
          {/* Normal User Button */}
          <button
            onClick={() => onLogin('user')}
            className="group flex flex-col items-center justify-center p-8 bg-green-900/30 border-2 border-green-500/50 rounded-lg hover:bg-green-900/50 hover:border-green-500 transition-all duration-300"
          >
            <User className="w-16 h-16 text-green-400 mb-4 transition-transform group-hover:scale-110" />
            <h2 className="text-2xl font-semibold text-white">Normal User</h2>
            <p className="text-green-300/70">Report a suspicious IP address.</p>
          </button>
        </div>
      </div>

      {/* SOC Login Modal */}
      {showSocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-8 w-full max-w-sm relative">
            <button onClick={() => setShowSocModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">SOC Authentication</h2>
            <form onSubmit={handleSocLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">SOC ID</label>
                <input
                  type="text"
                  value={socId}
                  onChange={(e) => setSocId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500"
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={socPassword}
                  onChange={(e) => setSocPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-blue-500"
                  placeholder="••••"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;