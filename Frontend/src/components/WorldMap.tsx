import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// You can find world map topojson files online. This is a common one.
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapMarker {
  coordinates: [number, number];
  ip: string;
}

interface WorldMapProps {
  markers: MapMarker[];
}

const WorldMap: React.FC<WorldMapProps> = ({ markers }) => {
  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-1">
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
                fill="#2C5282"
                stroke="#1A365D"
              />
            ))
          }
        </Geographies>
        {markers.map(({ ip, coordinates }) => (
          <Marker key={ip} coordinates={coordinates}>
            <circle r={3} fill="#F56565" stroke="#FFF" strokeWidth={1} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default WorldMap;