'use client';

import { useEffect, useRef, useState } from 'react';

// Location and camera relational mapping structure.
// Keep the values aligned with the websocket IDs used by the backend.
const CAMERA_LABELS: Record<string, string> = {
  "cam 1": "Cam 1 - input klin 4-A",
  "cam 2": "Cam 2 - input klin 4-B",
  "cam 3": "Cam 3 - input klin 5-A1",
  "cam 4": "Cam 4 - input klin 5-B1",
  "cam 5": "Cam 5 - input klin 5-A2",
  "cam 6": "Cam 6 - input klin 5-B2",
  "cam 7": "Cam 7 - output klin 4",
  "cam 8": "Cam 8 - output klin 5",
};

const LOCATION_DATA: Record<string, string[]> = {
  "input Klin 4": ["cam 1", "cam 2"],
  "input Klin 5": ["cam 3", "cam 4", "cam 5", "cam 6"],
  "output klin 4": ["cam 7"],
  "output klin 5": ["cam 8"],
};

interface AlertLog {
  id: string;
  camera: string;
  time: string;
  msg: string;
}

const getCameraLabel = (cameraId: string) => CAMERA_LABELS[cameraId] ?? cameraId;

// 🎥 LIVE VIDEO STREAM COMPONENT
function CameraView({ cameraId }: { cameraId: string }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [fps, setFps] = useState<number>(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    // Open a real-time binary stream channel to your FastAPI backend
    // DYNAMIC RECON: This forces any phone or laptop on your router network to read your camera boxes automatically!
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    //(Use wss:// for encryption!)
    const ws = new WebSocket(`https://nine-crews-bet.loca.lt/ws/stream/${cameraId}`);

    
    ws.binaryType = 'blob';

    ws.onopen = () => setStatus('online');
    ws.onclose = () => setStatus('offline');
    ws.onerror = () => setStatus('offline');
    
    ws.onmessage = (event) => {
      if (event.data instanceof Blob && imgRef.current) {
        frameCountRef.current += 1;
        const url = URL.createObjectURL(event.data);
        const prevUrl = imgRef.current.src;
        imgRef.current.src = url;
        
        // Critical: Free old memory chunks to prevent browser tab crashes
        if (prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
      }
    };
    
    // Calculate actual live incoming FPS for this camera view
    const fpsInterval = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      ws.close();
      clearInterval(fpsInterval);
    };
  }, [cameraId]);

  return (
    <div className="relative border border-slate-800 bg-slate-900 rounded-xl overflow-hidden aspect-video shadow-xl group hover:border-slate-700 transition-all duration-300">
      {/* Upper Status HUD Badges */}
      <div className="absolute top-3 left-3 z-10 bg-slate-950/80 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-2 backdrop-blur-sm shadow">
        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        {cameraId.toUpperCase().replace('_', ' ')}
      </div>

      <div className="absolute top-3 right-3 z-10 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 backdrop-blur-sm">
        {status === 'online' ? `${fps} FPS` : '0 FPS'}
      </div>

      {/* Frame Rendering Screen Canvas */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} className="w-full h-full object-cover bg-black" alt={`Live pipeline stream layout for ${cameraId}`} />

      {/* Subtle bottom scan line effect overlay decoration */}
      <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-emerald-500/20 rounded-xl transition-all duration-300" />
    </div>
  );
}

// 🏢 MAIN DASHBOARD GRID LAYOUT
export function CameraGrid() {
  const initialCameras = ['cam 1', 'cam 2', 'cam 3', 'cam 4', 'cam 5', 'cam 6', 'cam 7', 'cam 8'];
  
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertLog[]>([
    { id: 'init', camera: 'SYSTEM', time: '00:00:00', msg: 'Photoelectric network broker interface connection active.' }
  ]);

  // Reset function to clear dropdown paths
  const handleShowAll = () => {
    setSelectedLocation('');
    setSelectedCamera('');
    setIsLocationOpen(false);
    setIsCameraOpen(false);
  };

  // Prevent hydration styling flashes on production cloud networks
  useEffect(() => {
    setIsMounted(true);

    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const alertsWs = new WebSocket(`https://nine-crews-bet.loca.lt/ws/alerts`);

    alertsWs.onmessage = (event) => {
      try {
        const parsedAlert = JSON.parse(event.data);
        const newLog: AlertLog = {
          id: Math.random().toString(36).substring(2, 9),
          camera: parsedAlert.camera,
          time: parsedAlert.time,
          msg: parsedAlert.msg
        };
        setAlerts((prev) => [newLog, ...prev.slice(0, 49)]);
      } catch (err) {
        console.error("Failed compiling message frame data content packets parsing mapping context error: ", err);
      }
    };

    return () => alertsWs.close();
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-xs text-slate-500">Initializing Terminal Grid Systems...</div>;
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-slate-950 text-white">
      
      {/* 1. TOP UTILITY HUD BAR */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        {/* Left Side Workspace Profile Identification */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400 font-sans tracking-wide font-medium text-sm">Administrator Workspace</span>
          <div className="h-4 w-[1px] bg-slate-800" />
          <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SECURE ROOT</span>
        </div>

        {/* Right Side Brand Identity & System Tools */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.07.124c-.073.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.214 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87c-.074-.04-.147-.083-.22-.127a1.124 1.124 0 00-1.074-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.002-.767a1.122 1.122 0 00.418-1.03c-.004-.074-.006-.148-.006-.222 0-.074.002-.148.006-.222a1.122 1.122 0 00-.418-1.03l-1.002-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.218-.128.332-.183.582-.495.645-.869L9.594 3.94z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              online
            </span>
          </div>
        </div>
      </header>

      {/* LOWER PANEL: Sidebar & Operational Display Areas */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. COMMAND CONTROL SIDEBAR */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/20 backdrop-blur-sm p-4 flex flex-col justify-between shrink-0 z-10">
          <div className="space-y-4">
            
            {/* BUTTON A: Global View Reset */}
            <button 
              onClick={handleShowAll}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all border ${
                !selectedLocation 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-950/20' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Show All Streams
            </button>

            {/* BUTTON B: Location Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsLocationOpen(!isLocationOpen);
                  setIsCameraOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all border ${
                  selectedLocation 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25H4.55c0-3.868 3.368-7 7.5-7s7.5 3.132 7.5 7z" />
                  </svg>
                  <span className="truncate">{selectedLocation || "Select Location"}</span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform text-slate-500 ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isLocationOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-30 font-mono text-[11px]">
                  {Object.keys(LOCATION_DATA).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setSelectedCamera('');
                        setIsLocationOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all truncate"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BUTTON C: Camera Selector Dropdown */}
            <div className="relative">
              <button 
                disabled={!selectedLocation}
                onClick={() => setIsCameraOpen(!isCameraOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all border ${
                  !selectedLocation ? 'opacity-40 cursor-not-allowed text-slate-600' :
                  selectedCamera ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 
                  'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="truncate">{selectedCamera ? getCameraLabel(selectedCamera) : "Select Camera"}</span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform text-slate-500 ${isCameraOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isCameraOpen && selectedLocation && (
                <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-30 font-mono text-[11px]">
                  {LOCATION_DATA[selectedLocation].map((cam) => (
                    <button
                      key={cam}
                      onClick={() => {
                        setSelectedCamera(cam);
                        setIsCameraOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all truncate"
                    >
                      {getCameraLabel(cam)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM BUTTON: Manage Account */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent transition-all mt-auto">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Account
          </button>
        </aside>

        {/* 3. MONITORING CENTRAL DISPLAY CANVAS */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {/* Section Breadcrumbs HUD Indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
              <span>ROOT</span>
              <span>/</span>
              <span className="text-slate-300 font-sans font-medium">{selectedLocation || "All Infrastructure Feeds"}</span>
              {selectedCamera && (
                <>
                  <span>/</span>
                  <span className="text-emerald-400 font-medium">{getCameraLabel(selectedCamera)}</span>
                </>
              )}
            </div>
          </div>

          {/* Video Grid Render: Loads real CameraView elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl">
            {initialCameras.map((id) => {
              const cameraListForLocation = selectedLocation ? LOCATION_DATA[selectedLocation] ?? [] : [];

              if (selectedLocation && cameraListForLocation.length > 0 && !cameraListForLocation.includes(id)) {
                return null;
              }
              if (selectedCamera && id !== selectedCamera) {
                return null;
              }

              return <CameraView key={id} cameraId={id} />;
            })}
          </div>
        </main>

      </div>
    </div>
  );
}

export default CameraGrid;
