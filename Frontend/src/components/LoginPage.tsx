import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'soc' | 'user') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center p-10 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to the Security Monitor</h1>
        <p className="text-slate-400 mb-8">Please select your role to continue.</p>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => onLogin('soc')}
            className="group flex flex-col items-center justify-center p-8 bg-blue-900/30 border-2 border-blue-500/50 rounded-lg hover:bg-blue-900/50 hover:border-blue-500 transition-all duration-300"
          >
            <ShieldCheck className="w-16 h-16 text-blue-400 mb-4 transition-transform group-hover:scale-110" />
            <h2 className="text-2xl font-semibold text-white">SOC Team Member</h2>
            <p className="text-blue-300/70">Access the full security dashboard.</p>
          </button>
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
    </div>
  );
};

export default LoginPage;