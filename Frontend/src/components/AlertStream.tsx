import React, { useEffect, useState } from 'react';

const AlertStream = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/raw');
    ws.onmessage = (event) => {
      setLogs(JSON.parse(event.data));
    };
    return () => ws.close();
  }, []);

  return (
    <div className="w-1/2 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Raw Alerts</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        {logs.slice(0).reverse().map((log, index) => (
          <div key={index} className="text-sm p-2 border-b border-gray-700">
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertStream;
