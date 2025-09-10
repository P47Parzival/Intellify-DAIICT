import React from 'react';
import { ShieldAlert, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface MaliciousAlertsPanelProps {
  logs: LogEntry[];
}

const MaliciousAlertsPanel: React.FC<MaliciousAlertsPanelProps> = ({ logs }) => {
  
  const getRiskLevel = (score: number) => {
    if (score > 70) return { 
      color: 'bg-red-500', 
      textColor: 'text-red-100', 
      borderColor: 'border-red-500/50',
      level: 'CRITICAL' 
    };
    if (score > 30) return { 
      color: 'bg-orange-500', 
      textColor: 'text-orange-100', 
      borderColor: 'border-orange-500/50',
      level: 'HIGH' 
    };
    return { 
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-100', 
      borderColor: 'border-yellow-500/50',
      level: 'MEDIUM' 
    };
  };

  const getThreatIcon = (riskScore: number) => {
    if (riskScore > 70) return <ShieldAlert className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-orange-400" />;
  };

  return (
    <div className="bg-slate-800/20 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-red-900/30 to-orange-900/20 border-b border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Security Threats</span>
            <span className="text-xs text-red-400">({logs.length} alerts)</span>
          </div>
          {logs.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-400 font-mono">ACTIVE</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Alerts Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-green-400 text-sm font-medium">All Clear</p>
            <p className="text-slate-400 text-xs mt-1">No security threats detected</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {logs.map((log, index) => {
              const riskInfo = getRiskLevel(log.risk_score || 0);
              
              return (
                <div 
                  key={index} 
                  className={`group bg-slate-900/40 hover:bg-slate-800/60 border ${riskInfo.borderColor} rounded-lg p-4 transition-all duration-200`}
                >
                  {/* Alert Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getThreatIcon(log.risk_score || 0)}
                      <span className="text-sm font-mono text-red-300">
                        ALERT #{String(logs.length - index).padStart(4, '0')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${riskInfo.color} ${riskInfo.textColor}`}>
                        {riskInfo.level}
                      </span>
                      <span className="text-xs text-slate-400">{log.risk_score || 0}</span>
                    </div>
                  </div>

                  {/* Alert Details */}
                  <div className="space-y-2 mb-3">
                    {/* Threat Reason */}
                    {log.reason && (
                      <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-1">
                              Threat Detected
                            </h4>
                            <p className="text-sm text-red-200">{log.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IP and Location Info */}
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      {log.ip && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="font-mono">{log.ip}</span>
                        </div>
                      )}
                      {log.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{log.location.country || 'Unknown'}</span>
                        </div>
                      )}
                      {log.timestamp && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Raw Log Data (Collapsible) */}
                  <details className="group/details">
                    <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300 transition-colors">
                      <span className="select-none">View Raw Data</span>
                    </summary>
                    <div className="mt-2 bg-slate-950/50 border border-slate-700/30 rounded p-2">
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar-small">
                        {JSON.stringify(log, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
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
          background: rgba(239, 68, 68, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.5);
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

export default MaliciousAlertsPanel;