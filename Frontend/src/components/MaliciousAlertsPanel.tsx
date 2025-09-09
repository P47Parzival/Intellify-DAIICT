import React, { useEffect, useState } from 'react';

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
    <div className="w-1/2 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Malicious Alerts</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        {logs.map((log, index) => (
          <div key={index} className="text-sm p-2 border-b border-red-500/50 text-red-400">
            <span className="font-bold">⚠️ </span><pre className="inline">{JSON.stringify(log, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaliciousAlertsPanel;
