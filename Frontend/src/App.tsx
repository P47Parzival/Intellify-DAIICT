import { useState, useEffect } from 'react';
import AlertStream from './components/AlertStream';
import MaliciousAlertsPanel from './components/MaliciousAlertsPanel';
import WorldMap from './components/WorldMap';
import TopIPs from './components/TopIPs';

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

  useEffect(() => {
    // --- WebSocket for ALL traffic ---
    const rawWs = new WebSocket('ws://localhost:8000/ws/raw');
    rawWs.onmessage = (event) => {
      const newLog: LogEntry = JSON.parse(event.data);
      
      // Update raw logs list
      setRawLogs(prev => [newLog, ...prev]);

      // Update IP counts
      setIpCounts(prev => ({
        ...prev,
        [newLog.ip]: (prev[newLog.ip] || 0) + 1,
      }));

      // Add a marker to the map if location data exists
      if (newLog.location) {
        const newMarker: MapMarker = {
          ip: newLog.ip,
          coordinates: [newLog.location.longitude, newLog.location.latitude],
        };
        setMapMarkers(prev => [...prev, newMarker]);
      }
    };

    // --- WebSocket for MALICIOUS traffic ONLY ---
    const processedWs = new WebSocket('ws://localhost:8000/ws/processed');
    processedWs.onmessage = (event) => {
      const newLog: LogEntry = JSON.parse(event.data);
      setMaliciousLogs(prev => [newLog, ...prev]);
    };

    // Cleanup on unmount
    return () => {
      rawWs.close();
      processedWs.close();
    };
  }, []);

  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col p-4 gap-4">
      {/* Top Section: Map and Top IPs */}
      <section className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <WorldMap markers={mapMarkers} />
        </div>
        <div>
          <TopIPs ipCounts={ipCounts} />
        </div>
      </section>

      {/* Bottom Section: Log Streams */}
      <section className="flex-grow flex gap-4">
        <AlertStream logs={rawLogs} />
        <MaliciousAlertsPanel logs={maliciousLogs} />
      </section>
    </main>
  );
}

export default App;