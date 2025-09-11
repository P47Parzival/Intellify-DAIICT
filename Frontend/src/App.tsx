import { useState, useEffect } from 'react';
import AlertStream from './components/AlertStream';
import MaliciousAlertsPanel from './components/MaliciousAlertsPanel';
import WorldMap from './components/WorldMap';
import TopIPs from './components/TopIPs';
import MaliciousMap from './components/MaliciousMap';
import AssetPage from './components/AssetPage';
import ExecutiveDashboard from './components/ExecutiveDashboard';

interface LogEntry {
  [key: string]: any;
}

interface MapMarker {
  coordinates: [number, number];
  ip: string;
}

function App() {
  const [rawLogs, setRawLogs] = useState<LogEntry[]>([]);
  const [maliciousLogs, setMaliciousLogs] = useState<LogEntry[]>([]);
  const [ipCounts, setIpCounts] = useState<{ [key: string]: number }>({});
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [maliciousMarkers, setMaliciousMarkers] = useState<MapMarker[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'assets' | 'executive'>('dashboard'); // Added 'executive' to state type

  useEffect(() => {
    // --- WebSocket for ALL traffic ---
    const rawWs = new WebSocket('ws://localhost:8000/ws/raw');

    rawWs.onopen = () => setIsConnected(true);
    rawWs.onclose = () => setIsConnected(false);
    rawWs.onerror = () => setIsConnected(false);

    rawWs.onmessage = (event) => {
      const newLog: LogEntry = JSON.parse(event.data);

      setRawLogs(prev => [newLog, ...prev].slice(0, 100));

      setIpCounts(prev => ({
        ...prev,
        [newLog.ip]: (prev[newLog.ip] || 0) + 1,
      }));

      if (newLog.location) {
        const newMarker: MapMarker = {
          ip: newLog.ip,
          coordinates: [newLog.location.longitude, newLog.location.latitude],
        };
        setMapMarkers(prev => [...prev, newMarker].slice(-50));
      }
    };

    // --- WebSocket for MALICIOUS traffic ONLY ---
    const processedWs = new WebSocket('ws://localhost:8000/ws/processed');
    processedWs.onmessage = (event) => {
      const newLog: LogEntry = JSON.parse(event.data);
      setMaliciousLogs(prev => [newLog, ...prev].slice(0, 100));

      if (newLog.location) {
        const newMarker: MapMarker = {
          ip: newLog.ip,
          coordinates: [newLog.location.longitude, newLog.location.latitude],
        };
        setMaliciousMarkers(prev => [...prev, newMarker].slice(-50));
      }
    };

    // Cleanup on unmount
    return () => {
      rawWs.close();
      processedWs.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Network Security Monitor</h1>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('assets')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeView === 'assets'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Asset Inventory
            </button>
            <button
              onClick={() => setActiveView('executive')}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeView === 'executive'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Executive View
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className="text-sm text-slate-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Conditional Rendering based on activeView */}
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column: Network Traffic Overview */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Global Network Traffic</span>
                    </h2>
                    <span className="text-sm text-slate-400">{mapMarkers.length} active connections</span>
                  </div>
                </div>
                <div className="h-80">
                  <WorldMap markers={mapMarkers} />
                </div>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                  <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Live Traffic Stream</span>
                  </h2>
                </div>
                <div className="max-h-96 overflow-hidden">
                  <AlertStream logs={rawLogs} />
                </div>
              </div>
            </div>

            {/* Right Column: Security Analysis */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-red-900/50 to-orange-900/50 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>Attack Origins</span>
                    </h2>
                    <span className="text-sm text-red-300">{maliciousMarkers.length} threat sources</span>
                  </div>
                </div>
                <div className="h-80">
                  <MaliciousMap markers={maliciousMarkers} />
                </div>
              </div>

              {/* Security Alerts and Top IPs - Stacked Vertically */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="px-6 py-5 bg-gradient-to-r from-red-950/60 to-pink-950/60 border-b border-slate-700/40">
                    <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Security Alerts</span>
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <MaliciousAlertsPanel logs={maliciousLogs} />
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="px-6 py-5 bg-slate-900/60 border-b border-slate-700/40">
                    <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>Top IPs</span>
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    <TopIPs ipCounts={ipCounts} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'assets' ? (
          <AssetPage />
        ) : (
          <ExecutiveDashboard/>
        )}
      </main>
    </div>
  );
}

export default App;