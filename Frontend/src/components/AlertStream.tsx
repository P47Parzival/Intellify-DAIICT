import React, { useEffect, useState } from 'react';

// Define a type for your log objects for better type safety
interface LogEntry {
  [key: string]: any; // A simple flexible type for the log object
}

const AlertStream = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/raw');
    
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      // Use the functional update form to prepend the new log to the array
      setLogs(prevLogs => [newLog, ...prevLogs]);
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <div className="w-1/2 p-4 overflow-y-auto h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4 sticky top-0 bg-gray-900 py-2">Raw Alerts</h2>
      <div className="bg-gray-800 p-4 rounded-lg flex-grow">
        {/* Since we are prepending, we no longer need to slice or reverse */}
        {logs.map((log, index) => (
          <div key={index} className="text-sm p-2 border-b border-gray-700 font-mono">
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertStream;