import React from 'react';
import { BarChart } from 'lucide-react';

interface TopIPsProps {
  ipCounts: { [key: string]: number };
}

const TopIPs: React.FC<TopIPsProps> = ({ ipCounts }) => {
  const sortedIPs = Object.entries(ipCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-blue-300">Top 10 Traffic Sources</h3>
      </div>
      <ul className="space-y-2">
        {sortedIPs.map(([ip, count]) => (
          <li key={ip} className="flex justify-between items-center text-sm font-mono">
            <span className="text-blue-300">{ip}</span>
            <span className="text-blue-400 bg-blue-900/50 px-2 py-1 rounded">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopIPs;