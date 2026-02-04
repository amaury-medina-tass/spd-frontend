'use client';

import React from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Communes
import commune1Data from '@/data/communes/commune_1.json';
import commune2Data from '@/data/communes/commune_2.json';
import commune3Data from '@/data/communes/commune_3.json';
import commune4Data from '@/data/communes/commune_4.json';
import commune5Data from '@/data/communes/commune_5.json';
import commune6Data from '@/data/communes/commune_6.json';
import commune7Data from '@/data/communes/commune_7.json';
import commune8Data from '@/data/communes/commune_8.json';
import commune9Data from '@/data/communes/commune_9.json';
import commune10Data from '@/data/communes/commune_10.json';
import commune11Data from '@/data/communes/commune_11.json';
import commune12Data from '@/data/communes/commune_12.json';
import commune13Data from '@/data/communes/commune_13.json';
import commune14Data from '@/data/communes/commune_14.json';
import commune15Data from '@/data/communes/commune_15.json';
import commune16Data from '@/data/communes/commune_16.json';

// Corregimientos
import corregimiento50Data from '@/data/corregimientos/corregimiento_50.json';
import corregimiento60Data from '@/data/corregimientos/corregimiento_60.json';
import corregimiento70Data from '@/data/corregimientos/corregimiento_70.json';
import corregimiento80Data from '@/data/corregimientos/corregimiento_80.json';
import corregimiento90Data from '@/data/corregimientos/corregimiento_90.json';

// Configuration Constant
const COMMUNE_DATA = [
  // Comunas
  { id: '1', name: 'Comuna 1 - Popular', color: '#2ecc71', lineColor: '#27ae60', data: commune1Data, type: 'Comuna' },
  { id: '2', name: 'Comuna 2 - Santa Cruz', color: '#f1c40f', lineColor: '#f39c12', data: commune2Data, type: 'Comuna' },
  { id: '3', name: 'Comuna 3 - Manrique', color: '#9b59b6', lineColor: '#8e44ad', data: commune3Data, type: 'Comuna' },
  { id: '4', name: 'Comuna 4 - Aranjuez', color: '#1abc9c', lineColor: '#16a085', data: commune4Data, type: 'Comuna' },
  { id: '5', name: 'Comuna 5 - Castilla', color: '#e67e22', lineColor: '#d35400', data: commune5Data, type: 'Comuna' },
  { id: '6', name: 'Comuna 6 - Doce de Octubre', color: '#3498db', lineColor: '#2980b9', data: commune6Data, type: 'Comuna' },
  { id: '7', name: 'Comuna 7 - Robledo', color: '#e74c3c', lineColor: '#c0392b', data: commune7Data, type: 'Comuna' },
  { id: '8', name: 'Comuna 8 - Villa Hermosa', color: '#ff4d4d', lineColor: '#ff0000', data: commune8Data, type: 'Comuna' },
  { id: '9', name: 'Comuna 9 - Buenos Aires', color: '#4d4dff', lineColor: '#0000ff', data: commune9Data, type: 'Comuna' },
  { id: '10', name: 'Comuna 10 - La Candelaria', color: '#f39c12', lineColor: '#d35400', data: commune10Data, type: 'Comuna' },
  { id: '11', name: 'Comuna 11 - Laureles - Estadio', color: '#d35400', lineColor: '#ba4a00', data: commune11Data, type: 'Comuna' },
  { id: '12', name: 'Comuna 12 - La América', color: '#c0392b', lineColor: '#922b21', data: commune12Data, type: 'Comuna' },
  { id: '13', name: 'Comuna 13 - San Javier', color: '#d63031', lineColor: '#c0392b', data: commune13Data, type: 'Comuna' },
  { id: '14', name: 'Comuna 14 - Poblado', color: '#7f8c8d', lineColor: '#2c3e50', data: commune14Data, type: 'Comuna' },
  { id: '15', name: 'Comuna 15 - Guayabal', color: '#2c3e50', lineColor: '#1a252f', data: commune15Data, type: 'Comuna' },
  { id: '16', name: 'Comuna 16 - Belén', color: '#8e44ad', lineColor: '#5b2c6f', data: commune16Data, type: 'Comuna' },
  // Corregimientos
  { id: '50', name: 'San Sebastián de Palmitas', color: '#A04000', lineColor: '#6E2C00', data: corregimiento50Data, type: 'Corregimiento' },
  { id: '60', name: 'San Cristóbal', color: '#884EA0', lineColor: '#5b2c6f', data: corregimiento60Data, type: 'Corregimiento' },
  { id: '70', name: 'Altavista', color: '#2471A3', lineColor: '#1A5276', data: corregimiento70Data, type: 'Corregimiento' },
  { id: '80', name: 'San Antonio de Prado', color: '#17A589', lineColor: '#117864', data: corregimiento80Data, type: 'Corregimiento' },
  { id: '90', name: 'Santa Elena', color: '#D4AC0D', lineColor: '#9A7D0A', data: corregimiento90Data, type: 'Corregimiento' },
];

function Home() {
  const API_KEY = 'Up7CswQjdBiVje5gktOs'; 
  const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`;

  const onMapClick = (event: any) => {
    const feature = event.features?.[0];
    if (feature) {
      const layerId = feature.layer?.id;
      const region = COMMUNE_DATA.find(c => c.id === layerId);
      if (region) {
        console.log(`Has hecho clic en ${region.name}:`, feature.properties);
        alert(`${region.type === 'Corregimiento' ? 'Corregimiento ' : ''}${region.name}`);
      }
    }
  };

  const interactiveLayerIds = COMMUNE_DATA.map(c => c.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-7xl">
        
        {/* Map Container */}
        <div className="relative w-full h-[80vh]">
          <Map
            mapLib={maplibregl}
            initialViewState={{
              longitude: -75.5700,
              latitude: 6.2700,
              zoom: 10.8
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onClick={onMapClick}
            interactiveLayerIds={interactiveLayerIds}
            cursor="pointer"
            minZoom={10}
            maxBounds={[
              [-75.80, 6.00], // Southwest coordinates
              [-75.30, 6.50]  // Northeast coordinates
            ]}
          >
            {COMMUNE_DATA.map((region) => (
              <Source key={region.id} id={`source-${region.id}`} type="geojson" data={region.data as any}>
                <Layer 
                  id={region.id}
                  type="fill"
                  paint={{
                    'fill-color': region.color,
                    'fill-opacity': 0.4
                  }}
                />
                <Layer 
                  id={`${region.id}-line`}
                  type="line"
                  paint={{
                    'line-color': region.lineColor,
                    'line-width': 2
                  }}
                />
              </Source>
            ))}
          </Map>
        </div>

        {/* Legend / Chips */}
        <div className="p-6 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leyenda de Zonas</h3>
          <div className="flex flex-wrap gap-2">
            {COMMUNE_DATA.map((region) => (
              <div 
                key={region.id} 
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 shadow-sm"
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: region.color }} 
                />
                <span className="text-gray-700">
                  {region.name.replace(/Comuna \d+ - /, '')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;