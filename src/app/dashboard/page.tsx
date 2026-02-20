'use client';

import React, { useState, useCallback } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { X, MapPin } from 'lucide-react';
import { PlanTypeSelector } from '@/components/tabs/PlanTypeSelector';
import { Button } from '@heroui/react';
import { DashboardIndicativePlanTab } from '@/components/dashboard/DashboardIndicativePlanTab';
import { DashboardActionPlanTab } from '@/components/dashboard/DashboardActionPlanTab';
import { IndicatorVariablesModal } from '@/components/dashboard/IndicatorVariablesModal';
import { VariableAdvancesChartsSection } from '@/components/dashboard/VariableAdvancesChartsSection';
import { Indicator, ActionPlanIndicator } from '@/types/masters/indicators';
import { VariableLocationData } from '@/types/sub/variable-locations';
import { getIndicatorVariablesLocations } from '@/services/sub/variable-advances.service';

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

  // State for selected commune/corregimiento
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'indicative' | 'action'>('indicative');

  // Variables modal state
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false);
  const [selectedIndicatorForVariables, setSelectedIndicatorForVariables] = useState<{
    id: string;
    code: string;
    type: 'indicative' | 'action';
  } | null>(null);

  // Locations and georeferencing state
  const [variableLocations, setVariableLocations] = useState<VariableLocationData[]>([]);

  // Variable advances visualization state
  const [selectedVariableForAdvances, setSelectedVariableForAdvances] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);

  const selectedRegion = COMMUNE_DATA.find(c => c.id === selectedCommune);

  const onMapClick = (event: any) => {
    const feature = event.features?.[0];
    if (feature) {
      const layerId = feature.layer?.id;
      const region = COMMUNE_DATA.find(c => c.id === layerId);
      if (region) {
        console.log(`Seleccionando ${region.name}`);
        setSelectedCommune(region.id);
      }
    }
  };

  const handleViewVariables = useCallback(async (indicator: (Indicator | ActionPlanIndicator) & { matchSource: string }) => {
    setSelectedIndicatorForVariables({
      id: indicator.id,
      code: indicator.code,
      type: selectedTab,
    });
    setIsVariablesModalOpen(true);
    
    // Load locations for georeferencing
    try {
      const locations = await getIndicatorVariablesLocations(indicator.id, selectedTab);
      setVariableLocations(locations);
    } catch (error) {
      console.error('Error loading variable locations:', error);
      setVariableLocations([]);
    }
  }, [selectedTab]);

  const handleClearSelection = () => {
    setSelectedCommune(null);
  };

  const handleViewVariableAdvances = useCallback((variableId: string, variableCode: string, variableName: string) => {
    setSelectedVariableForAdvances({
      id: variableId,
      code: variableCode,
      name: variableName,
    });
    setIsVariablesModalOpen(false);
  }, []);

  const interactiveLayerIds = COMMUNE_DATA.map(c => c.id);

  return (
    <div className="flex flex-col gap-6 min-h-screen py-6 px-4">
      {/* Map Container */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full">
        <div className="relative w-full h-[60vh]">
          <Map
            mapLib={maplibregl}
            initialViewState={{
              longitude: -75.57,
              latitude: 6.27,
              zoom: 10.7
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onClick={onMapClick}
            interactiveLayerIds={interactiveLayerIds}
            cursor="pointer"
            minZoom={10.7}
            maxBounds={[
              [-76, 5.9], // Southwest coordinates
              [-75.1, 6.6]  // Northeast coordinates
            ]}
          >
            {COMMUNE_DATA.map((region) => (
              <Source key={region.id} id={`source-${region.id}`} type="geojson" data={region.data as any}>
                <Layer
                  id={region.id}
                  type="fill"
                  paint={{
                    'fill-color': region.color,
                    'fill-opacity': selectedCommune === region.id ? 0.7 : 0.4
                  }}
                />
                <Layer
                  id={`${region.id}-line`}
                  type="line"
                  paint={{
                    'line-color': region.lineColor,
                    'line-width': selectedCommune === region.id ? 4 : 2
                  }}
                />
              </Source>
            ))}
            
            {/* Markers for variable locations */}
            {variableLocations.map((varLocation) => 
              varLocation.locations
                .filter(loc => loc.latitude && loc.longitude)
                .map((loc) => (
                  <Marker
                    key={loc.id}
                    longitude={loc.longitude!}
                    latitude={loc.latitude!}
                    anchor="bottom"
                  >
                    <div className="relative group">
                      <div className="bg-red-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-red-600 transition-all">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-50">
                        <div className="font-semibold">{varLocation.variableName}</div>
                        <div className="text-gray-300">{loc.communeName}</div>
                        {loc.address && <div className="text-gray-400 text-xs">{loc.address}</div>}
                      </div>
                    </div>
                  </Marker>
                ))
            )}
          </Map>
        </div>

        {/* Legend / Chips */}
        <div className="p-6 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Leyenda de Zonas</h3>
          <div className="flex flex-wrap gap-2">
            {COMMUNE_DATA.map((region) => (
              <button
                type="button"
                key={region.id}
                onClick={() => setSelectedCommune(region.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${selectedCommune === region.id
                  ? 'bg-primary text-white shadow-md ring-2 ring-primary/30'
                  : 'bg-white border border-gray-200 shadow-sm hover:bg-gray-50'
                  }`}
              >
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: region.color }}
                />
                <span className={selectedCommune === region.id ? 'text-white' : 'text-gray-700'}>
                  {region.name.replace(/Comuna \d+ - /, '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicators Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full">
        {/* Header with Selection Info and Tabs */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              {selectedRegion ? (
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedRegion.color }}
                  />
                  <span className="font-semibold text-gray-800">
                    {selectedRegion.type === 'Corregimiento' ? 'Corregimiento ' : ''}{selectedRegion.name}
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    color="default"
                    onPress={handleClearSelection}
                    startContent={<X size={14} />}
                  >
                    Ver Todos
                  </Button>
                </div>
              ) : (
                <span className="font-semibold text-gray-800">
                  Todos los Indicadores
                </span>
              )}
            </div>

            {/* Tab Pills */}
            <PlanTypeSelector selectedTab={selectedTab} onSelectTab={setSelectedTab} />
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4">
          {selectedTab === 'indicative' && (
            <DashboardIndicativePlanTab
              communeId={selectedCommune}
              onViewVariables={handleViewVariables}
            />
          )}
          {selectedTab === 'action' && (
            <DashboardActionPlanTab
              communeId={selectedCommune}
              onViewVariables={handleViewVariables}
            />
          )}
        </div>
      </div>

      {/* Variable Advances Charts Section */}
      {selectedVariableForAdvances && (
        <div className="w-full">
          <VariableAdvancesChartsSection
            variableId={selectedVariableForAdvances.id}
            variableCode={selectedVariableForAdvances.code}
            variableName={selectedVariableForAdvances.name}
            onClose={() => setSelectedVariableForAdvances(null)}
          />
        </div>
      )}

      {/* Variables Modal */}
      <IndicatorVariablesModal
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
        indicatorId={selectedIndicatorForVariables?.id ?? null}
        indicatorCode={selectedIndicatorForVariables?.code}
        type={selectedIndicatorForVariables?.type ?? 'indicative'}
        onViewVariableAdvances={handleViewVariableAdvances}
      />
    </div>
  );
}

export default Home;