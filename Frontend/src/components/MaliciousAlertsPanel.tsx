import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface MaliciousAlertsPanelProps {
  logs: LogEntry[];
}

const MaliciousAlertsPanel: React.FC<MaliciousAlertsPanelProps> = ({ logs }) => {
  
  const getRiskColor = (score: number) => {
    if (score > 70) return 'bg-red-500 text-red-100';
    if (score > 40) return 'bg-orange-500 text-orange-100';
    return 'bg-yellow-500 text-yellow-100';
  };

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
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-red-300">⚠️ ALERT #{String(logs.length - index).padStart(4, '0')}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskColor(log.risk_score)}`}>
                    RISK: {log.risk_score}
                  </span>
                  <span className="text-red-400/70 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-300">Reason</h4>
                    <p className="text-red-400/90 text-xs">{log.reason}</p>
                  </div>
                </div>
              </div>

              <pre className="inline-block w-full text-xs font-mono bg-slate-900/50 p-3 rounded border border-slate-700 overflow-x-auto whitespace-pre-wrap">
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