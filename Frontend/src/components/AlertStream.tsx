import React from 'react';
import { Eye, Clock } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface AlertStreamProps {
  logs: LogEntry[];
}

const AlertStream: React.FC<AlertStreamProps> = ({ logs }) => {
  // The component now just receives logs as a prop and renders them.
  // All WebSocket logic has been moved to App.tsx.

  return (
    <div className="w-1/2 p-4 overflow-y-auto h-[60vh] flex flex-col bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Header Section (remains the same) */}
      <div className="bg-gradient-to-r from-blue-900/50 to-cyan-800/30 p-4 rounded-t-lg border border-blue-500/30 mb-4 sticky top-0 z-10 bg-gray-900 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-300 tracking-wide">NETWORK MONITOR</h2>
              <p className="text-xs text-blue-400/70 uppercase tracking-wider">Raw Data Stream</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-mono">CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Stream Container (remains the same, but uses props.logs) */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20 shadow-2xl flex-grow flex flex-col">
        <div className="p-3 bg-gradient-to-r from-blue-900/20 to-transparent border-b border-blue-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300 font-semibold uppercase tracking-wider">Incoming Data Stream</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-blue-400/70" />
              <span className="text-blue-400/70 font-mono">REAL-TIME</span>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto stream-scrollbar">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-blue-400/50 text-sm font-mono">WAITING FOR DATA...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="border-b border-blue-500/10 hover:bg-blue-900/10 transition-colors duration-200">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">DATA PACKET #{String(logs.length - index).padStart(4, '0')}</span>
                        <span className="text-blue-400/70 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-blue-200/90 text-xs font-mono bg-blue-950/20 p-3 rounded border border-blue-500/20 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles (remains the same) */}
      <style>
        {`
          .stream-scrollbar::-webkit-scrollbar { width: 4px; }
          .stream-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
          .stream-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 2px; }
          .stream-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.6); }
        `}
      </style>
    </div>
  );
};

export default AlertStream;