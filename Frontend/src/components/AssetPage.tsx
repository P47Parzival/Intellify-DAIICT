import React, { useState, useEffect } from 'react';
import { Server, User, Shield } from 'lucide-react';

interface Asset {
  owner: string;
  purpose: string;
  criticality: 'High' | 'Medium' | 'Low';
}

const AssetPage = () => {
  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});

  useEffect(() => {
    fetch('http://localhost:8000/api/assets')
      .then(res => res.json())
      .then(data => setAssets(data));
  }, []);

  const getCriticalityColor = (level: string) => {
    if (level === 'High') return 'text-red-400 border-red-500/50 bg-red-900/20';
    if (level === 'Medium') return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
    return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
  };

  return (
    <div className="p-4 bg-slate-900 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-300">Asset Inventory</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Criticality</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800/50 divide-y divide-slate-700/50">
            {Object.entries(assets).map(([ip, asset]) => (
              <tr key={ip}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-300">{ip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{asset.purpose}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{asset.owner}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCriticalityColor(asset.criticality)}`}>
                    {asset.criticality}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetPage;