import React from 'react';
import { Eye, Clock, Activity } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface AlertStreamProps {
  logs: LogEntry[];
}

const AlertStream: React.FC<AlertStreamProps> = ({ logs }) => {
  return (
    <div className="bg-slate-800/20 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden h-full">
      {/* Stream Container */}
      <div className="flex flex-col h-full">
        {/* Stream Header */}
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">Live Traffic</span>
              <span className="text-xs text-slate-500">({logs.length}/100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-mono">LIVE</span>
            </div>
          </div>
        </div>

        {/* Stream Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-400 text-sm">Waiting for network traffic...</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="group bg-slate-900/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 transition-all duration-200 hover:border-blue-500/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-blue-300">
                        #{String(logs.length - index).padStart(4, '0')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {log.ip || 'Unknown IP'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'No timestamp'}
                    </span>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded border border-slate-700/30 p-2 overflow-hidden">
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar-small">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
        .custom-scrollbar-small::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-small::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .custom-scrollbar-small::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default AlertStream;