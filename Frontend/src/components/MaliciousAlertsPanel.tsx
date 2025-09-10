// import React, { useEffect, useState } from 'react';

// interface LogEntry {
//   [key: string]: any;
// }

// const MaliciousAlertsPanel = () => {
//   const [logs, setLogs] = useState<LogEntry[]>([]);

//   useEffect(() => {
//     const ws = new WebSocket('ws://localhost:8000/ws/processed');
//     ws.onmessage = (event) => {
//       const newLog = JSON.parse(event.data);
//       setLogs(prevLogs => [newLog, ...prevLogs]);
//     };
//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.close();
//       }
//     };
//   }, []); // The empty dependency array ensures this effect runs only once

//   return (
//     <div className="w-1/2 p-4 overflow-y-auto">
//       <h2 className="text-xl font-bold mb-4">Malicious Alerts</h2>
//       <div className="bg-gray-800 p-4 rounded-lg">
//         {logs.map((log, index) => (
//           <div key={index} className="text-sm p-2 border-b border-red-500/50 text-red-400">
//             <span className="font-bold">⚠️ </span><pre className="inline">{JSON.stringify(log, null, 2)}</pre>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MaliciousAlertsPanel;

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

const MaliciousAlertsPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/processed');
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prevLogs => [newLog, ...prevLogs]);
    };
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <div className="w-1/2 p-4 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-r border-red-500/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 p-4 rounded-t-lg border border-red-500/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-300 tracking-wide">THREAT DETECTION</h2>
              <p className="text-xs text-red-400/70 uppercase tracking-wider">High Priority Alerts</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-400 font-mono">{logs.length} ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Alerts Container */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-500/20 shadow-2xl">
        <div className="p-3 bg-gradient-to-r from-red-900/20 to-transparent border-b border-red-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-300 font-semibold uppercase tracking-wider">Malicious Activity Detected</span>
            <span className="text-red-400/70 font-mono">LIVE FEED</span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto malicious-scrollbar">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-red-400/30 mx-auto mb-3" />
              <p className="text-red-400/50 text-sm font-mono">MONITORING FOR THREATS...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="border-b border-red-500/10 hover:bg-red-900/10 transition-colors duration-200">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-300 font-semibold text-sm uppercase tracking-wide">⚠️ CRITICAL ALERT</span>
                        <span className="text-red-400/70 text-xs font-mono">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-red-200/90 text-xs font-mono bg-red-950/20 p-3 rounded border border-red-500/20 overflow-x-auto whitespace-pre-wrap">
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

      {/* Custom Scrollbar Styles */}
      <style>{`
        .malicious-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .malicious-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .malicious-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.4);
          border-radius: 2px;
        }
        .malicious-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.6);
        }
      `}</style>
    </div>
  );
};

export default MaliciousAlertsPanel;