import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface MaliciousAlertsPanelProps {
  logs: LogEntry[];
}

const MaliciousAlertsPanel: React.FC<MaliciousAlertsPanelProps> = ({ logs }) => {
  // This component is now also simplified to just render the logs it receives.

  return (
    <div className="w-1/2 p-4 overflow-y-auto h-[60vh] flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 border-r border-red-500/20">
      <div className="bg-gradient-to-r from-red-900/50 to-orange-800/30 p-4 rounded-t-lg border border-red-500/30 mb-4 sticky top-0 z-10 bg-gray-900 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-300 tracking-wide">SECURITY ALERTS</h2>
              <p className="text-xs text-red-400/70 uppercase tracking-wider">Malicious Traffic Detected</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-500/20 shadow-2xl flex-grow overflow-y-auto stream-scrollbar">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-red-400/50 text-sm font-mono">NO MALICIOUS ACTIVITY DETECTED</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-sm p-4 border-b border-red-500/20 text-red-400 hover:bg-red-900/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-red-300">⚠️ ALERT #{String(logs.length - index).padStart(4, '0')}</span>
                <span className="text-red-400/70 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <pre className="inline-block w-full text-xs font-mono bg-red-950/20 p-3 rounded border border-red-500/20 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
      <style>
        {`
          .stream-scrollbar::-webkit-scrollbar { width: 4px; }
          .stream-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
          .stream-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 101, 101, 0.4); border-radius: 2px; }
          .stream-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 101, 101, 0.6); }
        `}
      </style>
    </div>
  );
};

export default MaliciousAlertsPanel;