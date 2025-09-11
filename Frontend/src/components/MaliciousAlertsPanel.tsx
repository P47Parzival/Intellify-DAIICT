import React, { useState, useEffect } from 'react';
import { ShieldAlert, Info, ListChecks, Ban, Server, ChevronDown } from 'lucide-react';

interface LogEntry {
  [key: string]: any;
}

interface MaliciousAlertsPanelProps {
  logs: LogEntry[];
}

interface Asset {
  owner: string;
  purpose: string;
  criticality: 'High' | 'Medium' | 'Low';
}

const MaliciousAlertsPanel: React.FC<MaliciousAlertsPanelProps> = ({ logs }) => {
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});
  const [expandedAlerts, setExpandedAlerts] = useState<number[]>([]); // State to track expanded alerts

  useEffect(() => {
    // Fetch asset data when the component mounts
    fetch('http://localhost:8000/api/assets')
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error('Failed to fetch assets:', err));
  }, []);

  const handleBlockIp = (ip: string) => {
    if (!blockedIPs.includes(ip)) {
      setBlockedIPs([...blockedIPs, ip]);
    }
  };

  const toggleDetails = (index: number) => {
    setExpandedAlerts(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'bg-red-500 text-red-100';
    if (score > 40) return 'bg-orange-500 text-orange-100';
    return 'bg-yellow-500 text-yellow-100';
  };

  const getCriticalityColor = (level: string) => {
    if (level === 'High') return 'text-red-400 border-red-500/50 bg-red-900/20';
    if (level === 'Medium') return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
    return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
  };

  return (
    <div className="w-full p-4 overflow-y-auto h-[60vh] flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-red-500/20 shadow-2xl flex-grow overflow-y-auto stream-scrollbar">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-red-400/50 text-sm font-mono">NO MALICIOUS ACTIVITY DETECTED</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const assetInfo = assets[log.ip]; // Get asset info for the alert's IP
            return (
              <div key={index} className="text-sm p-4 border-b border-red-500/20 text-red-400 hover:bg-red-900/20">
                {/* Alert Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-red-300">⚠️ ALERT #{String(logs.length - index).padStart(4, '0')}</span>
                  <div className="flex items-center space-x-2">
                    {assetInfo && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getCriticalityColor(assetInfo.criticality)}`}>
                        {assetInfo.criticality.toUpperCase()} ASSET
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskColor(log.risk_score)}`}>
                      RISK: {log.risk_score}
                    </span>
                    <span className="text-red-400/70 text-xs font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Asset Context Box */}
                {assetInfo && (
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-3">
                      <Server className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-300">Asset Context</h4>
                        <p className="text-slate-400/90 text-xs">
                          IP: <span className="font-mono">{log.ip}</span> | 
                          Owner: <span className="font-semibold">{assetInfo.owner}</span> | 
                          Purpose: <span className="font-semibold">{assetInfo.purpose}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Box */}
                <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-300">Reason</h4>
                      <p className="text-red-400/90 text-xs">{log.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Playbook / Recommended Actions */}
                <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <ListChecks className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-300">Recommended Actions</h4>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-blue-300/90 text-xs">
                        {log.playbook && log.playbook.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <button 
                    onClick={() => handleBlockIp(log.ip)}
                    disabled={blockedIPs.includes(log.ip)}
                    className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold text-white bg-red-600/50 rounded-md border border-red-500/80 hover:bg-red-600/80 transition-colors disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Ban className="w-3 h-3" />
                    <span>{blockedIPs.includes(log.ip) ? 'IP Blocked' : `Block IP: ${log.ip}`}</span>
                  </button>
                  {/* Additional action buttons can be added here */}
                  <button className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold text-white bg-orange-600/50 rounded-md border border-orange-500/80 hover:bg-orange-600/80 transition-colors">
                    <Server className="w-3 h-3" />
                    <span>Isolate Host</span>
                  </button>

                  {/* --- NEW: Details Dropdown Button --- */}
                  <button 
                    onClick={() => toggleDetails(index)}
                    className="flex items-center space-x-2 px-3 py-1 text-xs font-semibold text-white bg-slate-600/50 rounded-md border border-slate-500/80 hover:bg-slate-600/80 transition-colors"
                  >
                    <span>{expandedAlerts.includes(index) ? 'Hide Details' : 'Show Details'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedAlerts.includes(index) ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* --- NEW: Collapsible Details Panel --- */}
                {expandedAlerts.includes(index) && (
                  <div className="mt-4 bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                    <h5 className="font-bold text-slate-300 mb-2">Model Feature Data</h5>
                    <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap overflow-x-auto max-h-60 stream-scrollbar">
                      {JSON.stringify(log.features, null, 2)}
                    </pre>
                  </div>
                )}
  
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .stream-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .stream-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 3px;
        }
        .stream-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }
        .stream-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div >
  );
};

export default MaliciousAlertsPanel;