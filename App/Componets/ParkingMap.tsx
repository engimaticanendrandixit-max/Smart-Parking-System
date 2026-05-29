import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ParkingLocation } from '../types';
import { LOCATIONS } from '../constants';

interface Props {
  onSelectLocation: (locationId: string) => void;
  activeReservationLocation?: string | null;
  isFullScreen?: boolean;
}

const ParkingMap: React.FC<Props> = ({ onSelectLocation, activeReservationLocation, isFullScreen = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [filterType, setFilterType] = useState<'all' | 'hotel' | 'mall' | 'central'>('all');
  const [selectedLoc, setSelectedLoc] = useState<ParkingLocation | null>(null);

  // Filter locations based on selection
  const filteredLocs = LOCATIONS.filter(
    (loc) => filterType === 'all' || loc.type === filterType
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset map first if already initialized
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize Leaflet map centered at Lucknow, India (downtown area)
    const map = L.map(mapContainerRef.current, {
      center: [26.835, 80.965],
      zoom: 12,
      minZoom: 10,
      maxZoom: 16,
      attributionControl: false,
    });

    mapRef.current = map;

    // Use a premium Dark Tile Layer from CartoDB which matches our Bento Slate UI perfectly
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isFullScreen]);

  // Update Markers when locations or filterType changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredLocs.forEach((loc) => {
      if (!loc.latitude || !loc.longitude) return;

      const totalCap = loc.levels.reduce((sum, lvl) => sum + lvl.capacity, 0);
      const totalOccupied = loc.levels.reduce((sum, lvl) => sum + lvl.occupied, 0);
      const freeSlots = totalCap - totalOccupied;
      const occupiedRatio = totalOccupied / totalCap;

      // Color scheme based on load density
      let statusColor = '#10b981'; // Emerald (High Availability)
      let glowColor = 'rgba(16, 185, 129, 0.6)';
      let glowBorder = 'border-emerald-500';
      let bgBg = 'bg-emerald-950/90 text-emerald-300';
      let pulseBorder = 'border-emerald-500/30';

      if (freeSlots === 0) {
        statusColor = '#ef4444'; // Red (Full)
        glowColor = 'rgba(239, 68, 68, 0.6)';
        glowBorder = 'border-red-500';
        bgBg = 'bg-red-950/90 text-red-300';
        pulseBorder = 'border-red-500/30';
      } else if (occupiedRatio >= 0.85) {
        statusColor = '#f59e0b'; // Amber (Low Availability)
        glowColor = 'rgba(245, 158, 11, 0.6)';
        glowBorder = 'border-amber-500';
        bgBg = 'bg-amber-950/90 text-amber-300';
        pulseBorder = 'border-amber-500/30';
      } else if (occupiedRatio >= 0.6) {
        statusColor = '#eab308'; // Yellow (Moderate Load)
        glowColor = 'rgba(234, 179, 8, 0.6)';
        glowBorder = 'border-yellow-500';
        bgBg = 'bg-yellow-950/90 text-yellow-300';
        pulseBorder = 'border-yellow-500/30';
      }

      // Is this location booked?
      const isActiveResLoc = activeReservationLocation && loc.name.startsWith(activeReservationLocation);
      if (isActiveResLoc) {
        statusColor = '#3b82f6'; // Blue for active reservation
        glowColor = 'rgba(59, 130, 246, 0.8)';
        glowBorder = 'border-blue-500';
        bgBg = 'bg-blue-950/90 text-blue-300';
        pulseBorder = 'border-blue-500/50';
      }

      // Dynamic custom marker HTML inside a sleek container
      const customIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full border-2 ${glowBorder} ${bgBg} shadow-[0_0_15px_${statusColor}] hover:scale-125 hover:z-50 transition-all duration-300 cursor-pointer">
            <span class="text-[10px] font-black italic tracking-tighter">${freeSlots}</span>
            <div class="absolute -inset-1.5 rounded-full border border-dashed ${pulseBorder} animate-spin" style="animation-duration: 12s;"></div>
            ${isActiveResLoc ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white animate-ping"></div>' : ''}
          </div>
        `,
        className: 'custom-parksense-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      // Construct interactive popup content matching our Bento slate typography
      const popupContent = `
        <div class="p-4 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 min-w-[210px] space-y-3 font-sans">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[8px] font-black uppercase text-blue-400 tracking-wider">
                ${loc.type === 'hotel' ? '🏨 Hotel Parking' : loc.type === 'mall' ? '🛍️ Mall Garage' : '🅿️ Central Garage'}
              </span>
              <h4 class="font-black italic text-sm text-white tracking-tight uppercase -mt-0.5">${loc.name}</h4>
            </div>
            ${isActiveResLoc ? '<span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Booked</span>' : ''}
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-[9px] text-slate-400 font-bold">
              <span>System Occupancy (${Math.round(occupiedRatio * 100)}%)</span>
              <span>${freeSlots} Free</span>
            </div>
            <div class="h-2 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${occupiedRatio * 100}%; background-color: ${statusColor}"></div>
            </div>
          </div>

          <div class="text-[9px] font-medium text-slate-400 space-y-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
            ${loc.levels.map(level => `
              <div class="flex justify-between items-center">
                <span class="uppercase tracking-tight text-slate-500">L${level.levelNumber} - ${level.type === 'four-wheeler' ? 'Cars' : 'Bikes'}:</span>
                <span class="font-bold text-slate-200">${level.capacity - level.occupied}/${level.capacity} vacant</span>
              </div>
            `).join('')}
          </div>

          <button 
            type="button"
            data-location-id="${loc.id}"
            class="reserve-btn-map w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-xl text-[10px] transition-all uppercase italic tracking-tighter text-center cursor-pointer select-none active:scale-95 shadow-md shadow-blue-500/20"
          >
            Select & Lock Slot
          </button>
        </div>
      `;

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);

      // Create Leaflet Popup with no-default styles wrapper
      const customPopup = L.popup({
        className: 'parksense-custom-popup',
        closeButton: false,
        minWidth: 210,
      }).setContent(popupContent);

      marker.bindPopup(customPopup);

      // Bind click triggers to state
      marker.on('popupopen', () => {
        setSelectedLoc(loc);
      });

      markersRef.current.push(marker);
    });

    // Handle popup button clicks safely inside Leaflet
    const handlePopupOpen = (e: L.LeafletEvent) => {
      const popupNode = (e as any).popup.getElement();
      if (popupNode) {
        const btn = popupNode.querySelector('.reserve-btn-map');
        if (btn) {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-location-id');
            if (id) {
              onSelectLocation(id);
            }
          });
        }
      }
    };

    map.on('popupopen', handlePopupOpen);

    // Zoom and pan to fit markers nicely
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.12));
    }

    return () => {
      map.off('popupopen', handlePopupOpen);
    };
  }, [filterType, activeReservationLocation, isFullScreen]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col ${isFullScreen ? 'h-[650px]' : 'h-[480px]'}`}>
      {/* Header element of Bento Grid */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <span className="text-red-500/10 text-red-500 text-[9px] font-black px-2 py-1 rounded-md border border-red-500/20 uppercase tracking-widest inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE RADAR FEED
          </span>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mt-1">
            RFID Grid Scanner
          </h3>
        </div>
        
        {/* Sleek Categories Map Pill Filters */}
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          {(['all', 'hotel', 'mall', 'central'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-tighter italic transition-all ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Mount Container */}
      <div className="relative flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full bg-slate-950" />
        
        {/* Absolute Floating Map Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/80 backend-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
           लखनऊ Terminal Coordinates Bound
        </div>

        {/* Selected Details Floating Panel */}
        {selectedLoc && (
          <div className="absolute top-4 right-4 z-[400] bg-slate-950/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800/80 text-[10px] text-slate-300 max-w-[200px] shadow-2xl animate-in slide-in-from-right duration-300">
            <p className="font-bold text-white uppercase tracking-tight italic truncate mb-1">{selectedLoc.name}</p>
            <div className="flex flex-col gap-1 text-[9px] text-slate-500">
              <span className="flex justify-between">Capacity: <strong className="text-slate-300">{selectedLoc.levels.reduce((sum, lvl) => sum + lvl.capacity, 0)} slots</strong></span>
              <span className="flex justify-between">Level Floors: <strong className="text-slate-300">{selectedLoc.levels.length} Floors</strong></span>
              <span className="flex justify-between">Load Index: <strong className="text-blue-400">{Math.round((selectedLoc.levels.reduce((sum, lvl) => sum + lvl.occupied, 0)/selectedLoc.levels.reduce((sum, lvl) => sum + lvl.capacity, 0))*100)}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Embedded styles for Leaflet elements inside our app to remove ugly borders and popups */}
      <style>{`
        .parksense-custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .parksense-custom-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }
        .parksense-custom-popup .leaflet-popup-tip {
          background: #020617 !important;
          border: 1px solid #1e293b;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default ParkingMap;
