import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Map } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapMarker {
  coordinates: [number, number];
  ip: string;
}

interface MaliciousMapProps {
  markers: MapMarker[];
}

const MaliciousMap: React.FC<MaliciousMapProps> = ({ markers }) => {
  return (
    <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <Map className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-bold text-red-300">Malicious Traffic Origins</h3>
      </div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
        }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#4A0404" // Dark red fill for countries
                stroke="#220000" // Even darker stroke
              />
            ))
          }
        </Geographies>
        {markers.map(({ ip, coordinates }) => (
          <Marker key={ip} coordinates={coordinates}>
            <circle r={4} fill="#FF0000" stroke="#FFF" strokeWidth={1} />
            <circle r={8} fill="#FF0000" fillOpacity={0.3} stroke="none" className="animate-ping" />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default MaliciousMap;