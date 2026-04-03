const JUNCTION_TEMPLATES = {
  t_junction: [
    // Variante 0: T Izquierda
    [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 10}], thickness: 5 },
     { id: 's1', type: 'secondary', points: [{x: 10, y: 50}, {x: 50, y: 50}], thickness: 3.5 }],
    // Variante 1: T Derecha
    [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 10}], thickness: 5 },
     { id: 's1', type: 'secondary', points: [{x: 50, y: 50}, {x: 90, y: 50}], thickness: 3.5 }]
  ],
  cross: [
    // Variante 0: Cruz estándar
    [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 10}], thickness: 5 },
     { id: 's1', type: 'secondary', points: [{x: 10, y: 50}, {x: 90, y: 50}], thickness: 3.5 }]
  ],
  y_split: [
    // Variante 0: Principal Izquierda, Secundaria Derecha
    [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 60}, {x: 20, y: 30}], thickness: 5 },
     { id: 's1', type: 'secondary', points: [{x: 50, y: 60}, {x: 80, y: 30}], thickness: 3.5 }],
    // Variante 1: Principal Derecha, Secundaria Izquierda
    [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 60}, {x: 80, y: 30}], thickness: 5 },
     { id: 's1', type: 'secondary', points: [{x: 50, y: 60}, {x: 20, y: 30}], thickness: 3.5 }]
  ]
};
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Plus, Printer, Trash2, MapPin, AlertTriangle, Info, 
  ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, 
  ArrowDownLeft, ArrowLeft, ArrowUpLeft, CornerUpRight, CornerUpLeft, Navigation,
  Octagon, Map as MapIcon, PenTool, RotateCcw, Settings, Image as ImageIcon,
  Home, Fuel, Coffee, Camera, Tent, X, Flag, Droplets, Mountain, 
  Wind, Trees, Building2, School, Landmark, Church, Wrench, PlusSquare, 
  Warehouse, Factory, Waves, Zap, UtensilsCrossed, Save, FolderOpen, HelpCircle,
  Crosshair, Layers
} from 'lucide-react';

// --- CARGADOR ROBUSTO DE LEAFLET (Singleton Promise) ---
let leafletLoadPromise = null;
const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;
  
  leafletLoadPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletLoadPromise;
};

// --- LIBRERÍA EXTENDIDA DE ICONOS ---
const ICON_CATEGORIES = {
  "Rally / CC": [
    { type: 'alert_1', label: 'Peligro 1', icon: <AlertTriangle color="black" strokeWidth={3} size={20} /> },
    { type: 'alert_2', label: 'Peligro 2', icon: <div className="flex"><AlertTriangle size={14} color="black" strokeWidth={3}/><AlertTriangle size={14} color="black" strokeWidth={3}/></div> },
    { type: 'alert_3', label: 'Peligro 3', icon: <div className="flex"><AlertTriangle size={12} color="black" strokeWidth={3}/><AlertTriangle size={12} color="black" strokeWidth={3}/><AlertTriangle size={12} color="black" strokeWidth={3}/></div> },
    { type: 'stop', label: 'STOP', icon: <div className="bg-red-600 text-white text-[7px] font-bold px-1 rounded border border-black uppercase">STOP</div> },
    { type: 'waypoint', label: 'WPT', icon: <MapPin fill="black" color="white" size={20} /> },
    { type: 'fuel', label: 'Gasolinera', icon: <Fuel color="black" size={20} /> },
    { type: 'mechanic', label: 'Asistencia', icon: <Wrench color="black" size={20} /> },
    { type: 'medical', label: 'Médico', icon: <PlusSquare color="red" size={20} /> },
    { type: 'bivouac', label: 'Vivac', icon: <Tent color="black" size={20} /> },
    { type: 'dz', label: 'DZ', icon: <div className="border-2 border-black rounded-full w-6 h-6 flex items-center justify-center font-bold text-[9px]">DZ</div> },
    { type: 'fz', label: 'FZ', icon: <div className="border-2 border-green-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-[9px] text-green-600">FZ</div> },
    { type: 'cap', label: 'CAP', icon: <div className="font-bold text-[10px] border border-black px-1 bg-yellow-400">CAP</div> },
    { type: 'cap_a', label: 'CAP A', icon: <div className="font-bold text-[10px] border border-black px-1 bg-yellow-400">CAP A</div> },
    { type: 'flag_start', label: 'Salida', icon: <Flag color="green" fill="green" size={20} /> },
    { type: 'flag_end', label: 'Meta', icon: <Flag color="red" fill="red" size={20} /> },
    { type: 'reset_icon', label: 'Reset', icon: <RotateCcw color="black" size={20} /> },
    { type: 'reset_00', label: 'Reset 0,00', icon: <div className="bg-black text-white font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm"><RotateCcw size={10} strokeWidth={3}/>0,00</div> },
    { type: 'reset_box', label: 'Caja Reset', icon: (
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <rect x="0" y="0" width="40" height="40" fill="white" />
        <g transform="translate(2.5, 6)">
          <rect x="0" y="0" width="8" height="12" fill="black" rx="1"/>
          <text x="4" y="9" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0</text>
          <rect x="9" y="0" width="8" height="12" fill="black" rx="1"/>
          <text x="13" y="9" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0</text>
          <rect x="18" y="0" width="8" height="12" fill="black" rx="1"/>
          <text x="22" y="9" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0</text>
          <rect x="27" y="0" width="8" height="12" fill="black" rx="1"/>
          <text x="31" y="9" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0</text>
        </g>
        <text x="20" y="32" fill="black" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="0.5">RESET</text>
      </svg>
    )},
  ],
  "Señales": [
    ...[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map(v => ({
      type: `v${v}`, label: `Máx ${v}`,
      icon: <div className={`border-2 border-red-600 rounded-full w-7 h-7 flex items-center justify-center font-bold ${v >= 100 ? 'text-[8px] tracking-tight' : 'text-[10px]'}`}>{v}</div>
    })),
    { type: 'v_end', icon: <div className="border-2 border-black rounded-full w-7 h-7 flex items-center justify-center font-bold text-[8px] relative"><div className="absolute w-full h-0.5 bg-black rotate-45"/>FIN</div> },
    { type: 'warning_sign', icon: <AlertTriangle color="red" size={20} /> },
    { type: 'warning_danger', label: 'Peligro', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><rect x="11.2" y="8" width="1.6" height="5" fill="black"/><circle cx="12" cy="16" r="1.2" fill="black"/></svg> },
    { type: 'no_entry', label: 'Prohibido', icon: <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center border border-black"><div className="w-4 h-1 bg-white"/></div> },
    { type: 'parking', label: 'Parking', icon: <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#3D93D0' }}>P</div> },
    { type: 'roundabout', label: 'Rotonda', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><g fill="white"><path d="M12 5.5 c-1.5 0-2.8.5-3.8 1.4 l-1.2-1.2 v4 h4 l-1.4-1.4 c.7-.6 1.5-1 2.4-1 v-1.8 z"/><path d="M12 5.5 c-1.5 0-2.8.5-3.8 1.4 l-1.2-1.2 v4 h4 l-1.4-1.4 c.7-.6 1.5-1 2.4-1 v-1.8 z" transform="rotate(120 12 12)"/><path d="M12 5.5 c-1.5 0-2.8.5-3.8 1.4 l-1.2-1.2 v4 h4 l-1.4-1.4 c.7-.6 1.5-1 2.4-1 v-1.8 z" transform="rotate(240 12 12)"/></g></svg> },
    { type: 'stop_traffic', label: 'Señal Stop', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" fill="#dc2626" stroke="white" strokeWidth="1"/><text x="12" y="15" fill="white" fontSize="6" font_weight="bold" textAnchor="middle">STOP</text></svg> },
    { type: 'yield', label: 'Ceda', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,22 2,2 22,2" fill="white" stroke="#dc2626" strokeWidth="3" strokeLinejoin="round" /></svg> },
    { type: 'one_way', label: 'Sentido', icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2" fill="#3D93D0" /><path d="M12,18 L12,6 M8,10 L12,5 L16,10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { type: 'dangerous_curve', label: 'Curva', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><path d="M10,16 Q10,10 14,8 M12,6 L15,8 L13,10" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { type: 'steep_descent', label: 'Pendiente', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><polygon points="7,17 17,17 17,11" fill="black" /><text x="13.5" y="16" fill="white" fontSize="4" font_weight="bold" textAnchor="middle">10%</text></svg> },
    { type: 'no_overtaking', label: 'Proh. Adel.', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="white" stroke="#dc2626" strokeWidth="2.5"/><rect x="5.5" y="10" width="4.5" height="4" rx="1" fill="black"/><rect x="14" y="10" width="4.5" height="4" rx="1" fill="#dc2626"/></svg> },
    { type: 'end_restriction', label: 'Fin Restr.', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="white" stroke="black" strokeWidth="1.5"/><line x1="7" y1="17" x2="17" y2="7" stroke="black" strokeWidth="1"/><line x1="9" y1="19" x2="19" y2="9" stroke="black" strokeWidth="1"/><line x1="5" y1="15" x2="15" y2="5" stroke="black" strokeWidth="1"/></svg> },
    { type: 'bump', label: 'Badén', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><path d="M 6 16 Q 8 10 12 16 Q 16 10 18 16" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg> },
    { type: 'slippery', label: 'Deslizante', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><path d="M 10 16 Q 8 13 12 11 Q 16 9 14 7" fill="none" stroke="black" strokeWidth="1.5"/><rect x="10" y="6" width="4" height="3" rx="0.5" fill="black"/></svg> },
    { type: 'two_way', label: 'Doble Sent.', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><path d="M 9 16 L 9 8 L 7 10 M 9 8 L 11 10" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M 15 8 L 15 16 L 13 14 M 15 16 L 17 14" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { type: 'pedestrian', label: 'Peatones', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="12" cy="8" r="1.5" fill="black"/><path d="M 12 10 L 12 14 L 10 17 M 12 14 L 14 17 M 10 10 L 14 10" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="7" y1="16" x2="17" y2="16" stroke="black" strokeWidth="1.5"/></svg> },
    { type: 'priority_intersection', label: 'Prioridad', icon: <svg viewBox="0 0 24 24" width="20" height="20"><polygon points="12,2 2,20 22,20" fill="white" stroke="#dc2626" strokeWidth="2.5" strokeLinejoin="round" /><line x1="12" y1="7" x2="12" y2="17" stroke="black" strokeWidth="3" strokeLinecap="round"/><line x1="8" y1="13" x2="16" y2="13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { type: 'traffic_lights', label: 'Semáforo', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><rect x="8" y="2" width="8" height="15" rx="1.5" fill="black" stroke="black" strokeWidth="0.5"/><circle cx="12" cy="5.5" r="2.2" fill="#ef4444"/><circle cx="12" cy="10" r="2.2" fill="#fbbf24"/><circle cx="12" cy="14.5" r="2.2" fill="#22c55e"/><rect x="11.2" y="17" width="1.6" height="5" fill="black"/></svg> },
    { type: 'sign_town', label: 'Población', icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="5" width="20" height="10" fill="white" stroke="black" strokeWidth="1.5"/><rect x="11" y="15" width="2" height="7" fill="black"/><text x="12" y="12.5" fill="black" fontSize="5.5" font_weight="bold" textAnchor="middle" letterSpacing="0.5">VILLA</text></svg> },
    { type: 'sign_highway', label: 'Autopista', icon: <svg viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="5" width="20" height="10" rx="1.5" fill="#3D93D0" stroke="black" strokeWidth="1"/><rect x="11" y="15" width="2" height="7" fill="black"/><path d="M6,9 L14,9 M6,12 L18,12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { type: 'sign_dir_right', label: 'Dir. Der', icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3,6 L15,6 L21,10.5 L15,15 L3,15 Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/><rect x="11" y="15" width="2" height="7" fill="black"/></svg> },
    { type: 'sign_dir_left', label: 'Dir. Izq', icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M21,6 L9,6 L3,10.5 L9,15 L21,15 Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/><rect x="11" y="15" width="2" height="7" fill="black"/></svg> },
    
    /* --- SEÑALES OBLIGATORIAS --- */
    { type: 'mandatory_straight', label: 'Oblig. Recto', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><path d="M 12 18 L 12 8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/><polygon points="12,5 9,9 15,9" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
    { type: 'mandatory_right', label: 'Oblig. Der.', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><path d="M 12 18 L 12 14 A 4 4 0 0 1 16 10 L 16 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/><polygon points="19,10 15,7 15,13" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
    { type: 'mandatory_left', label: 'Oblig. Izq.', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><path d="M 12 18 L 12 14 A 4 4 0 0 0 8 10 L 8 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/><polygon points="5,10 9,7 9,13" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
    { type: 'straight_or_right', label: 'Recto/Der', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><g stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"><path d="M 10 18 L 10 7" /><path d="M 10 15 A 3 3 0 0 1 13 12 L 15 12" /></g><polygon points="10,4 7,8 13,8" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/><polygon points="18,12 14,9 14,15" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
    { type: 'straight_or_left', label: 'Recto/Izq', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><g stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"><path d="M 14 18 L 14 7" /><path d="M 14 15 A 3 3 0 0 0 11 12 L 9 12" /></g><polygon points="14,4 11,8 17,8" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/><polygon points="6,12 10,9 10,15" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
    { type: 'left_or_right', label: 'Izq/Der', icon: <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11" fill="#3D93D0"/><circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="0.75"/><path d="M 12 18 L 12 14 A 4 4 0 0 0 8 10 L 8 10 M 12 14 A 4 4 0 0 1 16 10 L 16 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/><polygon points="5,10 9,7 9,13" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/><polygon points="19,10 15,7 15,13" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg> },
  ],
  "Distancias": [
    ...[25, 50, 100, 150, 200, 300, 400].map(d => ({
      type: `dist_${d}`, label: `${d} m`,
      icon: <div className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">{d} m</div>
    }))
  ],
  "Referencias": [
    { type: 'house', label: 'Casa', icon: <Home size={20}/> },
    { type: 'houses', label: 'Casas', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><g transform="translate(10, 2) scale(0.55)"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" /></g><g transform="translate(1, 10) scale(0.6)"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" /></g><g transform="translate(11, 11) scale(0.65)"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22" /></g></svg> },
    { type: 'church', label: 'Iglesia', icon: <Church size={20}/> },
    { type: 'factory', label: 'Fábrica', icon: <Factory size={20}/> },
    { type: 'camera_ref', label: 'Cámara', icon: <Camera size={20}/> },
    { type: 'skyscraper', label: 'Edificio Alto', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="black" strokeWidth="1.5" strokeLinejoin="round"><path d="M4,22 L20,22 M6,22 L6,10 L9,10 L9,4 L15,4 L15,10 L18,10 L18,22" stroke="black" /><path d="M11,7 L13,7 M11,10 L13,10 M11,13 L13,13 M11,16 L13,16 M11,19 L13,19 M7,13 L8,13 M7,16 L8,16 M7,19 L8,19 M16,13 L17,13 M16,16 L17,16 M16,19 L17,19" stroke="black" strokeWidth="1" /></svg> },
    { type: 'bridge_over', label: 'P. Sobre', icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M 7,2 L 7,22 M 17,2 L 17,22" stroke="black" strokeWidth="3" strokeLinecap="round"/><path d="M 3,2 L 7,6 M 21,2 L 17,6 M 3,22 L 7,18 M 21,22 L 17,18" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg> },
    { type: 'bridge_under', label: 'P. Bajo', icon: <svg viewBox="0 0 24 24" width="20" height="20"><line x1="2" y1="8" x2="22" y2="8" stroke="black" strokeWidth="2" strokeLinecap="round"/><line x1="2" y1="12" x2="22" y2="12" stroke="black" strokeWidth="2" strokeLinecap="round"/><path d="M 7,22 L 7,16 A 5 5 0 0 1 17 16 L 17,22" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round"/></svg> },
    { type: 'tower', label: 'Torre', icon: <Landmark size={20}/> },
    { type: 'pylon', label: 'Alta Tensión', icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12,2 L8,22 M12,2 L16,22 M6,8 L18,8 M5,14 L19,14 M10,2 L14,8 M14,2 L10,8 M8,8 L12,14 M16,8 L12,14" /></svg> },
    { type: 'tree', label: 'Árbol', icon: <Trees size={20}/> },
    { type: 'park', label: 'Parque', icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M 6 12 C 0 12 0 1 6 1 C 12 1 12 12 6 12 Z" fill="#22c55e" /><line x1="6" y1="12" x2="6" y2="22" stroke="#92400e" strokeWidth="3" strokeLinecap="round" /><line x1="10" y1="8" x2="22" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="8" x2="9" y2="22" stroke="black" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="8" x2="23" vessel="22" stroke="black" strokeWidth="1.5" strokeLinecap="round"/><line x1="14" y1="8" x2="14" y2="16" stroke="black" strokeWidth="1"/><line x1="18" y1="8" x2="18" vessel="16" stroke="black" strokeWidth="1"/><line x1="13" y1="16" x2="19" y2="16" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg> },
    { type: 'cafe', label: 'Café', icon: <Coffee size={20}/> },
    { type: 'restaurant', label: 'Restaurante', icon: <UtensilsCrossed size={20}/> },
    { type: 'pharmacy', label: 'Farmacia', icon: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M10,3 h4 v6 h6 v4 h-6 v6 h-4 v-6 h-6 v-4 h6 z" fill="#16a34a" /></svg> },
  ],
  "Terreno": [
    { type: 'water', label: 'Agua', icon: <Droplets color="blue" size={20}/> },
    { type: 'river', label: 'Río', icon: <Waves color="blue" size={20}/> },
    { type: 'sand', label: 'Arena', icon: <div className="grid grid-cols-2 gap-0.5"><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"/><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"/><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"/><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"/></div> },
    { type: 'dust', label: 'Polvo', icon: <Wind color="gray" size={20}/> },
    { type: 'stones', label: 'Piedras', icon: <Mountain color="gray" size={20}/> },
    { type: 'danger_zap', label: 'Eléctrico', icon: <Zap color="orange" size={20}/> },
  ]
};

// --- UTILIDADES ---
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const formatRallyDist = (num) => parseFloat(num || 0).toFixed(2).replace('.', ',');

const catmullRom2bezier = (points) => {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y} `;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y} `;
  }
  return d;
};

const pointsToPath = (points, isStraight) => {
  if (!points || points.length < 2) return '';
  if (isStraight) {
    // Dibuja líneas rectas entre puntos (estilo ángulo 90º)
    return `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
  }
  // Dibuja la curva suave de antes
  return catmullRom2bezier(points);
};

const defaultCustomTulip = { 
  isRoundabout: false, 
  paths: [{ id: 'm1', type: 'main', points: [{x: 50, y: 90}, {x: 50, y: 10}], isDirt: false, isHighway: false, thickness: 5 }], 
  icons: [] 
};

const normalizeTulip = (data) => {
  if (!data || !Array.isArray(data.paths)) return defaultCustomTulip;
  return { ...data, icons: data.icons || [] };
};

const findIconByType = (type) => {
  for (const cat in ICON_CATEGORIES) {
    const item = ICON_CATEGORIES[cat].find(i => i.type === type);
    if (item) return item;
  }
  return null;
};

const GetIconComponent = (type) => findIconByType(type)?.icon || null;


// --- COMPONENTE MAPA REAL INTERACTIVO (OPENSTREETMAP) ---
function RealMapViewer({ gpxTrack, roadbook, onMapDblClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polylineInstance = useRef(null);
  const markersRef = useRef([]);
  const tileLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite'); // Por defecto Ortofoto

  const MAP_SOURCES = {
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxNativeZoom: 18,
      attribution: '© OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxNativeZoom: 19,
      attribution: '© Esri World Imagery'
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    loadLeaflet().then((L) => {
      if (!isMounted || !mapRef.current) return;
      if (mapInstance.current) return;

      // Inicializar Leaflet en el div
      mapInstance.current = L.map(mapRef.current, {
        doubleClickZoom: false
      }).setView([40.4168, -3.7038], 6);

      // Evento: Doble clic en el mapa para extraer cruce
      mapInstance.current.on('dblclick', (e) => {
        if (!mapInstance.current._gpxTrack || mapInstance.current._gpxTrack.length === 0) return;
        let minErr = Infinity;
        let closest = null;
        mapInstance.current._gpxTrack.forEach(p => {
          const err = Math.pow(p.lat - e.latlng.lat, 2) + Math.pow(p.lng - e.latlng.lng, 2);
          if (err < minErr) { minErr = err; closest = p; }
        });
        // Tolerancia: Si hace doble clic "cerca" de la línea azul
        if (closest && minErr < 0.005) { 
          if (mapInstance.current._onMapDblClick) {
            mapInstance.current._onMapDblClick(closest);
          }
        }
      });
      
      setMapLoaded(true);
    }).catch(() => {
      if (isMounted) setMapError(true);
    });

    return () => { 
      isMounted = false; 
      // Limpiar correctamente la instancia para evitar errores de StrictMode
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Efecto para gestionar el estilo del mapa (Satélite u OSM)
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.L) return;
    
    if (tileLayerRef.current) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }
    
    const source = MAP_SOURCES[mapStyle];
    tileLayerRef.current = window.L.tileLayer(source.url, {
       maxZoom: 21,
       maxNativeZoom: source.maxNativeZoom,
       attribution: source.attribution,
       errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
    }).addTo(mapInstance.current);
    
    tileLayerRef.current.setZIndex(0); // Aseguramos que el mapa queda de fondo
  }, [mapStyle, mapLoaded]);

  // Mantener las referencias actualizadas para el evento dblclick
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current._gpxTrack = gpxTrack;
      mapInstance.current._onMapDblClick = onMapDblClick;
    }
  }, [gpxTrack, onMapDblClick]);

  // Actualizar Capas (Líneas y Marcadores)
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.L) return;

    // Limpiar capas anteriores
    if (polylineInstance.current) {
      mapInstance.current.removeLayer(polylineInstance.current);
    }
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    // Dibujar el Track GPX
    if (gpxTrack && gpxTrack.length > 0) {
      const latlngs = gpxTrack.map(p => [p.lat, p.lng]);
      polylineInstance.current = window.L.polyline(latlngs, { color: '#3b82f6', weight: 5, opacity: 0.8 }).addTo(mapInstance.current);
      
      // Auto-centrar la cámara solo si es un track nuevo
      if (!mapInstance.current._hasFitted || mapInstance.current._lastTrackLength !== gpxTrack.length) {
         mapInstance.current.fitBounds(polylineInstance.current.getBounds(), { padding: [20, 20] });
         mapInstance.current._hasFitted = true;
         mapInstance.current._lastTrackLength = gpxTrack.length;
      }
    }

    // Dibujar pines numerados del Roadbook
    roadbook.forEach((row, idx) => {
      if (row.lat && row.lng) {
        const iconHTML = `<div style="background-color: black; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${idx + 1}</div>`;
        const customIcon = window.L.divIcon({
          className: 'custom-roadbook-marker',
          html: iconHTML,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const marker = window.L.marker([row.lat, row.lng], { icon: customIcon }).addTo(mapInstance.current);
        markersRef.current.push(marker);
      }
    });
  }, [gpxTrack, roadbook, mapLoaded]);

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-white bg-slate-800 p-6 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Error de Conexión</h2>
        <p>No se ha podido cargar el motor de mapas. Verifica tu conexión a internet o los bloqueos del navegador.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#e5e5e5]">
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      {mapLoaded && (
        <div className="absolute top-4 left-4 z-[400]">
          <button 
            onPointerDown={(e) => { e.stopPropagation(); setMapStyle(prev => prev === 'osm' ? 'satellite' : 'osm'); }}
            className="bg-white/95 p-2 rounded border-2 border-black shadow text-xs font-bold text-black flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Layers size={14} className="text-blue-600" />
            {mapStyle === 'osm' ? 'Ver Ortofoto' : 'Ver Mapa Clásico'}
          </button>
        </div>
      )}

      {(!gpxTrack || gpxTrack.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 z-10 pointer-events-none p-6 text-center bg-white/80 backdrop-blur-sm">
          <MapIcon size={64} className="mb-4 text-blue-500" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-2">Mapa Topográfico / Satélite</h2>
          <p className="text-sm font-medium">Sube un archivo GPX para trazar la ruta interactiva.</p>
        </div>
      )}
      
      {gpxTrack && gpxTrack.length > 0 && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 p-2 rounded border-2 border-black shadow-lg text-xs font-bold text-black flex items-center gap-2 pointer-events-none">
          <Crosshair size={14} className="text-blue-600"/> <span>Doble Clic cerca de la ruta para extraer Viñeta</span>
        </div>
      )}
    </div>
  );
}


// --- COMPONENTES UI ROADBOOK ---
function UniversalIconPicker({ onSelect, onUpload, onClose }) {
  const [activeTab, setActiveTab] = useState("Rally / CC");
  const fileInputRef = useRef(null);
  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onPointerDown={onClose}>
      <div className="bg-white border-2 border-black w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]" onPointerDown={e => e.stopPropagation()}>
        <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
          <h3 className="font-bold uppercase text-lg tracking-tight">Librería de Iconos</h3>
          <button onPointerDown={(e) => { e.stopPropagation(); onClose(); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X/></button>
        </div>
        <div className="p-4 bg-blue-50 border-b-2 border-black">
          <button onPointerDown={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-[4px_4px_0_0_#1e3a8a]">
            <Upload size={18}/> SUBIR IMAGEN PROPIA
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => onUpload(ev.target.result);
              reader.readAsDataURL(file);
            }
          }} />
        </div>
        <div className="flex bg-gray-200 border-b-2 border-black overflow-x-auto no-scrollbar shrink-0">
          {Object.keys(ICON_CATEGORIES).map(cat => (
            <button key={cat} onPointerDown={(e) => { e.stopPropagation(); setActiveTab(cat); }} className={`flex items-center justify-center px-3 py-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === cat ? 'bg-white text-black border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-300 hover:text-black border-b-2 border-transparent'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="p-4 pb-12 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-3 bg-white flex-1 min-h-0 content-start">
          {ICON_CATEGORIES[activeTab].map((item, idx) => (
            <button key={idx} onPointerDown={(e) => { e.stopPropagation(); onSelect(item.type); }} className="group flex flex-col items-center justify-center gap-2 p-2 border-2 border-gray-100 rounded-xl hover:border-black hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform pointer-events-none">
                {item.icon}
              </div>
              <span className="text-[8px] font-bold uppercase text-gray-400 group-hover:text-black text-center pointer-events-none">{item.label || item.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaticTulipRenderer({ data, id }) {
  const norm = normalizeTulip(data);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <marker id={`arrow-blue-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
        </marker>
        <marker id={`block-black-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <rect x="4.6" y="1" width="0.8" height="8" fill="black" />
        </marker>
      </defs>
      {norm.isRoundabout && <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="4" />}
      {norm.paths.map(p => {
        const isMain = p.type === 'main';
        const isEntry = p.type === 'entry';
        const color = (isMain || isEntry) ? '#3b82f6' : 'black'; 
        const width = (p.thickness || (p.type === 'secondary' ? 2 : 5)).toString();
        const dash = p.isDirt ? (width >= 4 ? '10,10' : '4,4') : 'none';
        let marker = isMain ? `url(#arrow-blue-${id})` : (!isEntry ? `url(#block-black-${id})` : '');
        const dPath = pointsToPath(p.points, p.isStraight);
        return (
          <g key={p.id}>
            <path d={dPath} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="butt" />
            {p.isHighway && (
              <path d={dPath} fill="none" stroke="white" strokeWidth={Math.max(1, parseFloat(width) - 2).toString()} strokeDasharray={dash} strokeLinecap="butt" />
            )}
            {marker && (
              <path d={dPath} fill="none" stroke="transparent" strokeWidth={width} markerEnd={marker} pointerEvents="none" />
            )}
          </g>
        );
      })}
      {norm.icons.map(ic => { 
        const rot = ic.rotation || 0;
        const scale = ic.scale || 1;
        return (
          <g key={ic.id} style={{transform: `translate(${ic.x}px, ${ic.y}px) rotate(${rot}deg) scale(${scale}) translate(-15px, -15px)`}}>
            {ic.type === 'custom_image' ? (
              <image href={ic.dataUrl} width={30} height={30} preserveAspectRatio="xMidYMid meet" />
            ) : (
              <foreignObject width={30} height={30}>
                <div style={{width: 30, height: 30}} className="flex items-center justify-center overflow-visible">
                  {GetIconComponent(ic.type)}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TulipVectorEditor({ data, onSave, onCancel }) {
  const [templateStates, setTemplateStates] = useState({ t_junction: 0, cross: 0, y_split: 0 });
  const normData = normalizeTulip(data);
  const [paths, setPaths] = useState(normData.paths);
  const [icons, setIcons] = useState(normData.icons);
  const [isRoundabout, setIsRoundabout] = useState(normData.isRoundabout);
  const [rExits, setRExits] = useState(3);
  const [rTarget, setRTarget] = useState(2);
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); 
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [selectedPathId, setSelectedPathId] = useState(null); 
  const [showIconPicker, setShowIconPicker] = useState(false);
  const QUICK_ICON_TYPES = ["roundabout", "stop_traffic", "no_entry", "warning_danger"];
  const togglePathStraight = () => {
    if (!selectedPathId) return;
    setPaths(paths.map(p => p.id === selectedPathId ? { ...p, isStraight: !p.isStraight } : p));
  };

  // --- FUNCIÓN CON SNAPPING ---
  const getCoords = (e, useSnapping = true) => {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    let pt = svg.createSVGPoint();
    pt.x = e.clientX || (e.touches && e.touches[0].clientX);
    pt.y = e.clientY || (e.touches && e.touches[0].clientY);
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    let x = Math.max(-10, Math.min(110, loc.x));
    let y = Math.max(-10, Math.min(110, loc.y));
    if (useSnapping) {
      x = Math.round(x / 5) * 5;
      y = Math.round(y / 5) * 5;
    }
    return { x, y };
  };

  const handlePointerDown = (e, target) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDragging(target);
    if (target.type === 'icon') {
      setSelectedIconId(target.iconId);
      setSelectedPathId(null);
    } else if (target.type === 'path') {
      setSelectedPathId(target.pathId);
      setSelectedIconId(null);
      setDragging(null); 
    } else {
      setSelectedIconId(null);
      setSelectedPathId(null);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    const loc = getCoords(e);
    if (dragging.type === 'node') {
      setPaths(paths.map(path => {
        if (path.id !== dragging.pathId) return path;
        const newPoints = [...path.points];
        newPoints[dragging.pointIdx] = loc;
        return { ...path, points: newPoints };
      }));
    } else if (dragging.type === 'icon') {
      setIcons(icons.map(ic => ic.id === dragging.iconId ? { ...ic, x: loc.x, y: loc.y } : ic));
    }
  };

  const handlePointerUp = (e) => {
    if (dragging) {
      e.target.releasePointerCapture(e.pointerId);
      setDragging(null);
    }
  };

  const applyTemplate = (type) => {
  const variations = JUNCTION_TEMPLATES[type];
  if (!variations) return;

  // Calculamos el siguiente índice (ciclo)
  const nextIdx = (templateStates[type] + 1) % variations.length;
  setTemplateStates(prev => ({ ...prev, [type]: nextIdx }));

  const selectedVar = variations[templateStates[type]];
  
  // Aplicamos la plantilla asegurando IDs únicos
  setPaths(selectedVar.map(p => ({ ...p, id: crypto.randomUUID() })));
  setIsRoundabout(false);
  setSelectedPathId(null);
};

  const handleLineDoubleClick = (e, pathId) => {
    e.stopPropagation();
    const loc = getCoords(e);
    setPaths(paths.map(path => {
      if (path.id !== pathId) return path;
      let minPt = 1; let minDist = Infinity;
      for (let i = 0; i < path.points.length - 1; i++) {
        const p1 = path.points[i], p2 = path.points[i+1];
        const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        let t = ((loc.x - p1.x) * (p2.x - p1.x) + (loc.y - p1.y) * (p2.y - p1.y)) / (l2 || 1);
        t = Math.max(0, Math.min(1, t));
        const proj = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
        const d = Math.pow(loc.x - proj.x, 2) + Math.pow(loc.y - proj.y, 2);
        if (d < minDist) { minDist = d; minPt = i + 1; }
      }
      const newPts = [...path.points];
      newPts.splice(minPt, 0, loc); 
      return { ...path, points: newPts };
    }));
  };

  const handleDeletePoint = (e, pathId, pointIdx) => {
    e.stopPropagation();
    setPaths(paths.map(path => {
      if (path.id !== pathId) return path;
      if (path.points.length <= 2) return path; 
      const newPts = [...path.points];
      newPts.splice(pointIdx, 1);
      return { ...path, points: newPts };
    }));
  };

  const deleteSelectedPath = () => {
    if (!selectedPathId || paths.length <= 1) return; 
    setPaths(paths.filter(p => p.id !== selectedPathId));
    setSelectedPathId(null);
  };

  const updateSelectedIconScale = (delta) => {
    if (!selectedIconId) return;
    setIcons(icons.map(ic => ic.id === selectedIconId ? { ...ic, scale: Math.max(0.5, Math.min(4, (ic.scale || 1) + delta)) } : ic));
  };

  const updateSelectedIconRotation = (delta) => {
    if (!selectedIconId) return;
    setIcons(icons.map(ic => ic.id === selectedIconId ? { ...ic, rotation: (ic.rotation || 0) + delta } : ic));
  };

  const deleteSelectedIcon = () => {
    if (!selectedIconId) return;
    setIcons(icons.filter(ic => ic.id !== selectedIconId));
    setSelectedIconId(null);
  };

  const togglePathDirt = () => {
    if (!selectedPathId) return;
    setPaths(paths.map(p => p.id === selectedPathId ? { ...p, isDirt: !p.isDirt } : p));
  };

  const togglePathHighway = () => {
    if (!selectedPathId) return;
    setPaths(paths.map(p => p.id === selectedPathId ? { ...p, isHighway: !p.isHighway } : p));
  };

  const cycleThickness = () => {
  if (!selectedPathId) return;
  setPaths(paths.map(p => {
    if (p.id !== selectedPathId) return p;
    let current = p.thickness || 3.5;
    // Ciclo: 5 (Grueso) -> 3.5 (Medio) -> 2 (Fino)
    let next = current === 5 ? 3.5 : (current === 3.5 ? 2 : 5);
    return { ...p, thickness: next };
  }));
};

  const addIcon = (type, dataUrl = null) => {
    const newIcon = { id: crypto.randomUUID(), type, x: 50, y: 50, scale: 1, rotation: 0, dataUrl };
    setIcons([...icons, newIcon]);
    setSelectedIconId(newIcon.id);
  };

  const generateRoundabout = () => {
    const newPaths = [];
    const totalLegs = rExits + 1;
    newPaths.push({ id: crypto.randomUUID(), type: 'entry', isDirt: false, isHighway: false, thickness: 5, points: [{x: 50, y: 90}, {x: 50, y: 65}] });
    for (let i = 1; i <= rExits; i++) {
      const angle = Math.PI / 2 - i * (2 * Math.PI / totalLegs);
      const isTarget = (i === rTarget);
      const r1 = 15; const r2 = isTarget ? 45 : 30;
      newPaths.push({ id: crypto.randomUUID(), type: isTarget ? 'main' : 'wrong_way', isDirt: false, isHighway: false, thickness: isTarget ? 5 : 3.5, points: [{x: 50 + r1 * Math.cos(angle), y: 50 + r1 * Math.sin(angle)}, {x: 50 + r2 * Math.cos(angle), y: 50 + r2 * Math.sin(angle)}] });
    }
    setPaths(newPaths); setIsRoundabout(true);
    setSelectedPathId(null);
  };

  const selectedPath = paths.find(p => p.id === selectedPathId);
  const showThicknessBtn = selectedPath && selectedPath.type !== 'main';

  return (
    <div className="flex flex-col items-center select-none w-full p-4">
      {/* SECCIÓN DE PLANTILLAS (Punto 3 / Paso C) */}
      <div className="bg-gray-100 p-2 rounded border-2 border-gray-200 mb-2 w-full flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">Plantillas de Cruces</span>
        <div className="flex gap-2">
          {/* Botón T: Ahora usa 't_junction' y cambiará de lado cada vez que pulses */}
          <button onPointerDown={(e) => { e.stopPropagation(); applyTemplate('t_junction'); }} className="bg-white border border-gray-300 p-1 rounded hover:bg-blue-50 transition-colors shadow-sm">
            <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="black" strokeWidth="3">
              <path d="M20 35 V5 M20 20 H5" />
            </svg>
          </button>

          {/* Botón Cruz */}
          <button onPointerDown={(e) => { e.stopPropagation(); applyTemplate('cross'); }} className="bg-white border border-gray-300 p-1 rounded hover:bg-blue-50 transition-colors shadow-sm">
            <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="black" strokeWidth="3">
              <path d="M20 35 V5 M5 20 H35" />
            </svg>
          </button>

          {/* Botón Y: Cambiará la dirección principal cada vez que pulses */}
          <button onPointerDown={(e) => { e.stopPropagation(); applyTemplate('y_split'); }} className="bg-white border border-gray-300 p-1 rounded hover:bg-blue-50 transition-colors shadow-sm">
            <svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke="black" strokeWidth="3">
              <path d="M20 35 V20 L10 10 M20 20 L30 10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-2 rounded border-2 border-gray-200 mb-2 w-full flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">Generador Rotonda</span>
        <div className="flex gap-2 items-center text-xs">
          <span>Salidas:</span>
          <input type="number" min="1" max="8" value={rExits} onChange={e=>setRExits(parseInt(e.target.value)||1)} className="w-10 border rounded text-center" />
          <span>Objetivo:</span>
          <input type="number" min="1" max={rExits} value={rTarget} onChange={e=>setRTarget(parseInt(e.target.value)||1)} className="w-10 border rounded text-center" />
          <button onPointerDown={(e) => { e.stopPropagation(); generateRoundabout(); }} className="bg-blue-600 text-white font-bold px-2 py-1 rounded hover:bg-blue-700 ml-1 uppercase text-[10px]">Generar</button>
        </div>
      </div>

      <div className="w-64 h-64 border-2 border-dashed border-gray-400 bg-gray-50 mb-2 relative touch-none shadow-inner rounded overflow-hidden" onPointerDown={() => { setSelectedPathId(null); setSelectedIconId(null); }}>
        <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full overflow-visible" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          <defs>
            <marker id="editor-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" /></marker>
            <marker id="editor-block-black" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><rect x="4.6" y="1" width="0.8" height="8" fill="black" /></marker>
            <marker id="editor-arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" /></marker>
            <marker id="editor-block-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><rect x="4.6" y="1" width="0.8" height="8" fill="#f59e0b" /></marker>
          </defs>
          {isRoundabout && <circle cx="50" cy="50" r="15" fill="none" stroke="#cbd5e1" strokeWidth="4" />}
          {paths.map(path => {
            const isSelected = path.id === selectedPathId;
            const isMain = path.type === 'main';
            const isEntry = path.type === 'entry';
            const color = isSelected ? "#f59e0b" : ((isMain || isEntry) ? '#3b82f6' : 'black'); 
            const width = (path.thickness || (path.type === 'secondary' ? 2 : 5)).toString();
            const dash = path.isDirt ? (width >= 4 ? '10,10' : '4,4') : 'none';
            let marker = isMain ? (isSelected ? "url(#editor-arrow-orange)" : "url(#editor-arrow-blue)") : (!isEntry ? (isSelected ? "url(#editor-block-orange)" : "url(#editor-block-black)") : '');
            const dPath = pointsToPath(path.points, path.isStraight);
            return (
              <g key={path.id}>
                <path d={dPath} stroke="transparent" strokeWidth="20" fill="none" onPointerDown={(e) => handlePointerDown(e, { type: 'path', pathId: path.id })} onDoubleClick={(e) => handleLineDoubleClick(e, path.id)} className="cursor-crosshair" />
                <path d={dPath} stroke={color} strokeWidth={width} strokeDasharray={dash} fill="none" strokeLinecap="butt" className="pointer-events-none transition-colors" />
                {path.isHighway && (
                  <path d={dPath} stroke="white" strokeWidth={Math.max(1, parseFloat(width) - 2).toString()} strokeDasharray={dash} fill="none" className="pointer-events-none transition-colors" />
                )}
                {marker && (
                  <path d={dPath} stroke="transparent" strokeWidth={width} fill="none" markerEnd={marker} className="pointer-events-none" />
                )}
              </g>
            );
          })}
          {paths.map(path => path.points.map((p, i) => (
            <circle key={`${path.id}-pt-${i}`} cx={p.x} cy={p.y} r="6" fill="#ef4444" stroke="white" strokeWidth="2" onPointerDown={(e) => handlePointerDown(e, { type: 'node', pathId: path.id, pointIdx: i })} onDoubleClick={(e) => handleDeletePoint(e, path.id, i)} />
          )))}
          {icons.map(ic => {
            const rot = ic.rotation || 0;
            const scale = ic.scale || 1;
            return (
              <g key={ic.id} onPointerDown={(e) => handlePointerDown(e, { type: 'icon', iconId: ic.id })} style={{transform: `translate(${ic.x}px, ${ic.y}px) rotate(${rot}deg) scale(${scale}) translate(-15px, -15px)`}}>
                <rect width={30} height={30} fill="transparent" />
                <foreignObject width={30} height={30}>
                  <div className="w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
                    {ic.type === 'custom_image' ? <img src={ic.dataUrl} className="w-full h-full object-contain" /> : GetIconComponent(ic.type)}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedIconId && (
        <div className="flex gap-1 mb-2 w-full justify-center">
          <button onPointerDown={(e) => { e.stopPropagation(); updateSelectedIconScale(-0.1); }} className="bg-gray-200 w-8 h-8 rounded font-bold text-xl flex items-center justify-center">-</button>
          <button onPointerDown={(e) => { e.stopPropagation(); updateSelectedIconScale(0.1); }} className="bg-gray-200 w-8 h-8 rounded font-bold text-xl flex items-center justify-center">+</button>
          <button onPointerDown={(e) => { e.stopPropagation(); updateSelectedIconRotation(-15); }} className="bg-gray-200 w-8 h-8 rounded font-bold text-xl flex items-center justify-center leading-none">↺</button>
          <button onPointerDown={(e) => { e.stopPropagation(); updateSelectedIconRotation(15); }} className="bg-gray-200 w-8 h-8 rounded font-bold text-xl flex items-center justify-center leading-none">↻</button>
          <button onPointerDown={(e) => { e.stopPropagation(); deleteSelectedIcon(); }} className="bg-red-500 text-white px-3 rounded font-bold text-xs uppercase tracking-wide ml-2">Eliminar</button>
        </div>
      )}

      {selectedPathId && selectedPath && (
        <div className="flex flex-col gap-2 mb-2 w-full justify-center bg-gray-100 p-2 rounded border-2 border-gray-200">
          <span className="text-[10px] font-bold uppercase text-gray-500 text-center tracking-widest">Opciones de Vía</span>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button onPointerDown={(e) => { e.stopPropagation(); togglePathDirt(); }} className="bg-white border-2 border-gray-300 py-2 rounded shadow-sm font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors">
              {selectedPath.isDirt ? 'Hacer Asfalto' : 'Hacer Tierra'}
            </button>
            <button onPointerDown={(e) => { e.stopPropagation(); togglePathHighway(); }} className="bg-white border-2 border-gray-300 py-2 rounded shadow-sm font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors">
              {selectedPath.isHighway ? 'Vía Única' : 'Autopista'}
            </button>
            <button onPointerDown={(e) => { e.stopPropagation(); togglePathStraight(); }} className="bg-white border-2 border-gray-300 py-2 rounded shadow-sm font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors">
              {selectedPath.isStraight ? 'Hacer Curva' : 'Hacer Recta'}
            </button>
            {showThicknessBtn && (
              <button onPointerDown={(e) => { e.stopPropagation(); cycleThickness(); }} className="bg-white border-2 border-gray-300 py-2 rounded shadow-sm font-bold text-[10px] uppercase hover:bg-gray-50 transition-colors">
                Grosor: {(selectedPath.thickness === 2) ? 'Fino' : (selectedPath.thickness === 3.5 ? 'Medio' : 'Grueso')}
              </button>
            )}
            <button onPointerDown={(e) => { e.stopPropagation(); deleteSelectedPath(); }} className="bg-red-600 text-white border-2 border-red-700 py-2 rounded shadow-sm font-bold text-[10px] uppercase hover:bg-red-700 transition-colors col-span-2">
              Eliminar Vía
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 rounded border-2 border-gray-200 mb-2 w-full justify-center items-center">
        {QUICK_ICON_TYPES.map(type => {
          const icData = findIconByType(type);
          return (
            <button key={type} onPointerDown={(e) => { e.stopPropagation(); addIcon(type); }} className="w-8 h-8 p-1 border border-gray-300 bg-white rounded hover:bg-gray-50 flex items-center justify-center">
              <div className="w-full h-full scale-125 flex items-center justify-center pointer-events-none">{icData?.icon}</div>
            </button>
          );
        })}
        <button onPointerDown={(e) => { e.stopPropagation(); setShowIconPicker(true); }} className="px-2 py-1 bg-blue-600 text-white font-bold text-[10px] rounded uppercase hover:bg-blue-700 h-8 flex items-center gap-1 shadow-sm">
          <Plus size={12}/> Más Iconos
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 w-full">
        <button onPointerDown={(e) => { e.stopPropagation(); setPaths([...paths, { id: crypto.randomUUID(), type: 'wrong_way', isDirt: false, isHighway: false, thickness: 5, points: [{x: 50, y: 50}, {x: 20, y: 30}] }]); }} className="bg-black text-white font-bold py-3 rounded text-[10px] uppercase hover:bg-gray-800 transition-colors shadow">+ Adicional</button>
        <button onPointerDown={(e) => { e.stopPropagation(); setPaths([...paths, { id: crypto.randomUUID(), type: 'main', isDirt: false, isHighway: false, thickness: 5, points: [{x: 50, y: 90}, {x: 50, y: 10}] }]); }} className="bg-blue-600 text-white font-bold py-3 rounded text-[10px] uppercase hover:bg-blue-700 transition-colors shadow">+ Principal</button>
      </div>

      <div className="flex gap-2 mt-2 w-full">
        <button onPointerDown={onCancel} className="flex-1 bg-gray-300 font-bold uppercase text-sm py-3 rounded hover:bg-gray-400 transition-colors">Cancelar</button>
        <button onPointerDown={() => onSave({ paths, isRoundabout, icons })} className="flex-1 bg-green-600 text-white font-bold uppercase text-sm py-3 rounded hover:bg-green-700 transition-colors">Guardar</button>
      </div>

      {showIconPicker && (
        <UniversalIconPicker 
          onSelect={type => { addIcon(type); setShowIconPicker(false); }}
          onUpload={url => { addIcon('custom_image', url); setShowIconPicker(false); }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}

function RoadbookRow({ row, index, onUpdate, onDelete, onInsert }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [draggingIconId, setDraggingIconId] = useState(null);
  const [distMode, setDistMode] = useState(false);
  const [tempDist, setTempDist] = useState(''); 
  const infoRef = useRef(null);
  
  const handleInfoPointerMove = (e) => {
    if (!draggingIconId) return;
    const r = infoRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    onUpdate(row.id, 'infoIcons', row.infoIcons.map(ic => ic.id === draggingIconId ? { ...ic, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : ic));
  };
  
  const isGreen = row.partialDist < 0.3;
  const cellBg = row.terrain === 'tierra' ? '#C6E0B5' : 'transparent';
  
  return (
    <div className="roadbook-row w-full print:block border-b-2 border-black">
      <div className="flex bg-white min-h-[158px] group relative">
        <div className={`w-[30%] border-r-2 border-black relative transition-colors ${isGreen ? 'bg-[#8FFE89]' : 'bg-white'}`}>
          <button
            onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'isReset', !row.isReset); }}
            className={`absolute top-1 left-1 p-1 sm:p-1.5 rounded transition-colors z-10 print:hidden ${row.isReset ? 'text-blue-600 bg-blue-100' : 'text-gray-300 hover:text-blue-500 hover:bg-gray-200'}`}
            title="Marcar Reseteo (0,00)"
          >
            <RotateCcw size={14} strokeWidth={3} />
          </button>

          <div className={`w-full h-full flex flex-col items-center justify-start ${row.isReset ? 'pt-1 sm:pt-2' : 'pt-6'} cursor-text hover:bg-black/5`} onClick={(e) => { if (!distMode) { e.stopPropagation(); setTempDist(row.totalDist.toString().replace('.', ',')); setDistMode(true); } }}>
            {distMode ? (
              <input type="text" autoFocus dir="ltr" value={tempDist} onChange={e => setTempDist(e.target.value)} onFocus={(e) => e.target.select()} onClick={e => e.stopPropagation()} onBlur={() => { const val = tempDist.replace(',', '.'); const parsed = parseFloat(val); onUpdate(row.id, 'totalDist', isNaN(parsed) ? 0 : parsed); setDistMode(false); }} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setDistMode(false); }} className={`w-[90%] text-center outline-none bg-yellow-50 ${row.isReset ? 'text-[2.2rem] sm:text-[2.8rem]' : 'text-[2.8rem] sm:text-[3.5rem]'} leading-none font-bold tracking-tight border-2 border-blue-400 rounded-lg`} />
            ) : (
              <span className={`${row.isReset ? 'text-[2.2rem] sm:text-[2.8rem]' : 'text-[2.8rem] sm:text-[3.5rem]'} leading-none font-bold tracking-tight whitespace-nowrap`}>{formatRallyDist(row.totalDist)}</span>
            )}
            
            {row.isReset && !distMode && (
              <div className="w-[80%] flex flex-col items-center mt-1 sm:mt-1.5 pointer-events-none">
                <div className="w-full h-[2px] sm:h-[3px] bg-black"></div>
                <span className="text-xl sm:text-2xl font-bold leading-none mt-1 sm:mt-1.5 text-black">0,00</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-[65%] h-[40%] border-t-2 border-r-2 border-black flex items-center justify-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-none">{formatRallyDist(row.partialDist)}</span>
          </div>
          <div className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 border-t-2 border-l-2 border-black bg-black flex items-center justify-center pointer-events-none">
            <span className="text-lg sm:text-xl font-bold text-white leading-none">{index}</span>
          </div>
        </div>
        <div className="w-[35%] border-r-2 border-black flex items-center justify-center relative p-2 overflow-hidden transition-colors" style={{ backgroundColor: cellBg }}>
          <button onPointerDown={(e) => { e.stopPropagation(); setEditorOpen(true); }} className="w-[140px] h-[140px] flex items-center justify-center hover:bg-black/5 transition-colors rounded">
            <StaticTulipRenderer data={row.customTulip} id={row.id} />
          </button>
          {editorOpen && (
            <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onPointerDown={() => setEditorOpen(false)}>
              <div onPointerDown={e => e.stopPropagation()} className="bg-white border-2 border-black rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh] w-full max-w-[360px]">
                <TulipVectorEditor data={row.customTulip} onSave={val => { onUpdate(row.id, 'customTulip', val); setEditorOpen(false); }} onCancel={() => setEditorOpen(false)} />
              </div>
            </div>
          )}
        </div>
        <div className="w-[35%] relative group/info transition-colors" ref={infoRef} onPointerMove={handleInfoPointerMove} onPointerUp={() => setDraggingIconId(null)} onPointerDown={() => setSelectedIconId(null)} style={{ backgroundColor: cellBg }}>
          <textarea dir="ltr" value={row.notes} onChange={e => onUpdate(row.id, 'notes', e.target.value.toUpperCase())} className="w-full h-full resize-none bg-transparent outline-none text-black font-black uppercase text-xl p-4 print:hidden" placeholder="NOTAS..." />
          <div className="hidden print:block w-full h-full p-4 font-black uppercase text-xl leading-tight whitespace-pre-wrap overflow-hidden">{row.notes}</div>
          {row.infoIcons.map(ic => (
            <div key={ic.id} style={{ position: 'absolute', left: `${ic.x}%`, top: `${ic.y}%`, transform: `translate(-50%, -50%) rotate(${ic.rotation || 0}deg) scale(${ic.scale || 1})`, width: 40, height: 40 }} className={`flex items-center justify-center cursor-move touch-none ${selectedIconId === ic.id ? 'ring-2 ring-blue-500 rounded bg-blue-50/50' : ''}`} onPointerDown={e => { e.stopPropagation(); setSelectedIconId(ic.id); setDraggingIconId(ic.id); }}>
              {ic.type === 'custom_image' ? <img src={ic.dataUrl} className="w-full h-full object-contain pointer-events-none" /> : <div className="w-full h-full pointer-events-none flex items-center justify-center">{GetIconComponent(ic.type)}</div>}
            </div>
          ))}
          {selectedIconId && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-white border-2 border-black rounded-lg p-1 z-50 shadow-xl" onPointerDown={e => e.stopPropagation()}>
              <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'infoIcons', row.infoIcons.map(ic => ic.id === selectedIconId ? {...ic, scale: Math.max(0.5, (ic.scale||1)-0.2)} : ic)); }} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-xl">-</button>
              <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'infoIcons', row.infoIcons.map(ic => ic.id === selectedIconId ? {...ic, scale: Math.min(4, (ic.scale||1)+0.2)} : ic)); }} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-xl">+</button>
              <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'infoIcons', row.infoIcons.map(ic => ic.id === selectedIconId ? {...ic, rotation: (ic.rotation||0)-15} : ic)); }} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-xl">↺</button>
              <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'infoIcons', row.infoIcons.map(ic => ic.id === selectedIconId ? {...ic, rotation: (ic.rotation||0)+15} : ic)); }} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-bold text-xl">↻</button>
              <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'infoIcons', row.infoIcons.filter(ic => ic.id !== selectedIconId)); setSelectedIconId(null); }} className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center ml-2"><Trash2 size={16}/></button>
            </div>
          )}
          <button onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(true); }} className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover/info:opacity-100 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 print:hidden transition-all hover:scale-110 active:scale-95"><ImageIcon size={18}/></button>
          <div className="absolute right-2 bottom-2 lg:-right-16 lg:top-1/2 lg:-translate-y-1/2 flex flex-row lg:flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover/info:opacity-100 print:hidden z-10 transition-all">
            <button onPointerDown={(e) => { e.stopPropagation(); onUpdate(row.id, 'terrain', row.terrain === 'tierra' ? 'asfalto' : 'tierra'); }} className={`p-2 rounded-full shadow-lg active:scale-95 transition-all text-white ${row.terrain === 'tierra' ? 'bg-amber-800' : 'bg-gray-400'}`} title="Conmutar Tierra/Asfalto">
              <Mountain size={20}/>
            </button>
            <button onPointerDown={(e) => { e.stopPropagation(); onInsert(row.id); }} className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all"><Plus size={20}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); onDelete(row.id); }} className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all"><Trash2 size={20}/></button>
          </div>
          {pickerOpen && <UniversalIconPicker onSelect={type => { onUpdate(row.id, 'infoIcons', [...row.infoIcons, { id: crypto.randomUUID(), type, x: 80, y: 50, scale: 1.2, rotation: 0 }]); setPickerOpen(false); }} onUpload={url => { onUpdate(row.id, 'infoIcons', [...row.infoIcons, { id: crypto.randomUUID(), type: 'custom_image', x: 80, y: 50, scale: 1.2, rotation: 0, dataUrl: url }]); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
        </div>
      </div>
    </div>
  );
}

// === COMPONENTE MODIFICADO PARA ALTURA FIJA Y ESTRICTA ===
function EditableRoadbookHeader({ data, setData }) {
  const [active, setActive] = useState(null);

  const renderField = (field, className, placeholder, rows = 1, textAlign = 'center') => {
    // Definimos line-height y padding exacto para garantizar la matemática de CSS
    const lh = 1.4; // 1.4em
    const paddingY = 8; // 8px total de padding vertical (p-1 en tailwind = 4px top + 4px bottom)
    const fixedHeight = `calc(${rows * lh}em + ${paddingY}px)`;

    if (active === field) {
      return (
        <textarea 
          autoFocus 
          value={data[field]} 
          onChange={e => setData({...data, [field]: e.target.value})} 
          onBlur={() => setActive(null)} 
          className={`bg-yellow-50 outline-none w-full p-1 font-bold resize-none ${className}`} 
          style={{ textAlign, fontFamily: 'inherit', lineHeight: lh, height: fixedHeight }} 
        />
      );
    }
    
    return (
      <div 
        onClick={() => setActive(field)} 
        className={`cursor-text hover:bg-gray-100 rounded p-1 whitespace-pre-wrap transition-colors overflow-hidden ${!data[field] ? 'bg-gray-50 border-2 border-dashed border-gray-200' : ''} ${className}`} 
        style={{ textAlign, lineHeight: lh, height: fixedHeight, minHeight: fixedHeight }}
      >
        {data[field] || placeholder}
      </div>
    );
  };

  return (
    <header className="p-6 flex flex-col bg-white overflow-hidden border-b-2 border-black">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex-1 flex flex-col items-center">
          {renderField('titleI', 'text-2xl font-bold italic uppercase', 'INICIO')}
          <div className="w-full border-2 border-black p-4 shadow-[4px_4px_0_0_black] mt-2">
            {/* LUGAR SALIDA: Modificado a 3 líneas */}
            {renderField('placeI', 'text-[10px] font-bold uppercase mb-1', 'LUGAR SALIDA', 3)}
            {renderField('coordsI', 'text-sm font-mono font-bold', 'COORDENADAS SALIDA', 2)}
          </div>
        </div>
        <div className="w-40 h-40 flex items-center justify-center relative border-2 border-dashed border-gray-200 rounded-full group overflow-hidden">
          {data.logo ? (
            <img src={data.logo} className="w-full h-full object-contain cursor-pointer" onPointerDown={() => setData({...data, logo: null})}/>
          ) : (
            <button onPointerDown={() => { const i = document.createElement('input'); i.type='file'; i.onchange=e=>{ const r=new FileReader(); r.onload=ev=>setData({...data, logo:ev.target.result}); r.readAsDataURL(e.target.files[0]); }; i.click(); }} className="flex flex-col items-center text-gray-400 group-hover:text-black font-bold uppercase text-[8px] transition-colors">
              <ImageIcon size={32} className="mb-2"/> Subir Logo
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center">
          {renderField('titleF', 'text-2xl font-bold italic uppercase', 'FINAL')}
          <div className="w-full border-2 border-black p-4 shadow-[4px_4px_0_0_black] mt-2">
            {/* LUGAR DESTINO: Modificado a 3 líneas */}
            {renderField('placeF', 'text-[10px] font-bold uppercase mb-1', 'LUGAR DESTINO', 3)}
            {renderField('coordsF', 'text-sm font-mono font-bold', 'COORDENADAS DESTINO', 2)}
          </div>
        </div>
      </div>
      <div className="border-t-2 border-black py-2">
        {/* REGLAMENTO: Modificado a 16 líneas */}
        {renderField('rules', 'text-[9px] font-bold italic', 'REGLAMENTO...', 12, 'left')}
      </div>
    </header>
  );
}

export default function App() {
  const [roadbook, setRoadbook] = useState(() => JSON.parse(localStorage.getItem('robibook_data_v4')) || []);
  const [headerData, setHeaderData] = useState(() => JSON.parse(localStorage.getItem('robibook_header_v4')) || { titleI: "Inicio", placeI: "", coordsI: "", titleF: "Final", placeF: "", coordsF: "", logo: null, rules: "" });
  
  // ESTADO PARA EL MAPA Y GPX TRACK
  const [gpxTrack, setGpxTrack] = useState([]);

  const loadProjectRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [showAddChoice, setShowAddChoice] = useState(false);
  
  useEffect(() => localStorage.setItem('robibook_header_v4', JSON.stringify(headerData)), [headerData]);
  useEffect(() => localStorage.setItem('robibook_data_v4', JSON.stringify(roadbook)), [roadbook]);
  
  const handlePrint = () => setShowPrintModal(true);
  
  const handleSaveProject = () => {
    const blob = new Blob([JSON.stringify({ header: headerData, roadbook })], { type: "application/json" });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${headerData.titleI || 'ruta'}.rbk`; a.click();
  };
  
  const handleLoadProject = (e) => {
    const reader = new FileReader(); 
    reader.onload = (event) => { 
      const d = JSON.parse(event.target.result); 
      if (d.roadbook) setRoadbook(d.roadbook); 
      if (d.header) setHeaderData(d.header); 
    }; 
    reader.readAsText(event.target.files[0]); 
    e.target.value = null;
  };
  
  const handleResetProject = () => {
    setRoadbook([]);
    setGpxTrack([]);
    setHeaderData({ titleI: "Inicio", placeI: "", coordsI: "", titleF: "Final", placeF: "", coordsF: "", logo: null, rules: "" });
    localStorage.removeItem('robibook_data_v4');
    localStorage.removeItem('robibook_header_v4');
    setShowResetConfirm(false);
  };
  
  const handleAddRow = (terrainType) => {
    const lastRowDist = roadbook[roadbook.length - 1]?.totalDist || 0;
    setRoadbook([...roadbook, { id: crypto.randomUUID(), totalDist: parseFloat((lastRowDist + 1).toFixed(2)), partialDist: 1, tulipId: 'custom', customTulip: {...defaultCustomTulip}, infoIcons: [], notes: '', terrain: terrainType, isReset: false }]);
    setShowAddChoice(false);
  };

  // Generador de fila al hacer doble clic en el visor SVG
  const handleMapDblClick = (point) => {
    const newRow = { 
      id: crypto.randomUUID(), 
      totalDist: parseFloat(point.dist.toFixed(2)), 
      partialDist: 0, 
      tulipId: 'custom', 
      customTulip: {...defaultCustomTulip}, 
      infoIcons: [], 
      notes: 'Punto Mapa', 
      terrain: 'asfalto', 
      isReset: false,
      lat: point.lat,
      lng: point.lng
    };
    setRoadbook(prev => {
      const updated = [...prev, newRow];
      return updated.sort((a, b) => a.totalDist - b.totalDist);
    });
  };
  
  // LÓGICA DE CÁLCULO
  useEffect(() => {
    setRoadbook(prev => {
      let isChanged = false;
      const updated = prev.map((row, idx) => {
        let expected;
        if (idx === 0) {
          expected = row.totalDist; 
        } else if (prev[idx-1].isReset) {
          expected = row.totalDist; 
        } else {
          expected = Math.max(0, row.totalDist - prev[idx-1].totalDist); 
        }
        expected = parseFloat(expected.toFixed(2));
        if (Math.abs((row.partialDist || 0) - expected) > 0.001) { isChanged = true; return { ...row, partialDist: expected }; }
        return row;
      });
      return isChanged ? updated : prev;
    });
  }, [roadbook.map(r => r.totalDist + '_' + (r.isReset ? '1' : '0')).join(',')]);
  
const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader(); 
    reader.onload = (event) => {
      const xml = new DOMParser().parseFromString(event.target.result, "text/xml");
      
      // 1. EXTRAER TRACK (Línea del mapa)
      // Buscamos trkpt (tracks), rtept (rutas) o incluso wpt si solo hay puntos
      let trackNodes = Array.from(xml.getElementsByTagName('trkpt'));
      if (trackNodes.length === 0) {
        trackNodes = Array.from(xml.getElementsByTagName('rtept'));
      }
      if (trackNodes.length === 0) {
        trackNodes = Array.from(xml.getElementsByTagName('wpt'));
      }

      let trackData = [];
      let dist = 0;
      trackNodes.forEach((p, i) => {
        const lat = parseFloat(p.getAttribute('lat'));
        const lng = parseFloat(p.getAttribute('lon'));
        if (!isNaN(lat) && !isNaN(lng)) {
          if (trackData.length > 0) dist += haversineDistance(trackData[trackData.length-1].lat, trackData[trackData.length-1].lng, lat, lng);
          trackData.push({ lat, lng, dist });
        }
      });
      setGpxTrack(trackData);
      
      // 2. EXTRAER PUNTOS INTERMEDIOS (Waypoints y Giros)
      const wpts = Array.from(xml.getElementsByTagName('wpt'));
      const rtepts = Array.from(xml.getElementsByTagName('rtept'));
      // Unimos todo lo que pueda ser un punto de interés
      const allPoints = [...wpts, ...rtepts];

      if (allPoints.length > 0) {
        const extractedRoadbook = allPoints.map(w => {
          const lat = parseFloat(w.getAttribute('lat'));
          const lng = parseFloat(w.getAttribute('lon'));

          // Intentamos sacar el nombre de cualquier etiqueta común
          const name = w.getElementsByTagName('name')[0]?.textContent || 
                       w.getElementsByTagName('desc')[0]?.textContent || 
                       w.getElementsByTagName('cmt')[0]?.textContent ||
                       "Punto GPX";

          // Calculamos dónde cae este punto en el kilometraje del track
          let closest = trackData[0] || { dist: 0 }; 
          let minErr = Infinity;
          if (trackData.length > 0) {
            trackData.forEach(p => { 
              const err = Math.pow(lat-p.lat, 2) + Math.pow(lng-p.lng, 2); 
              if (err < minErr) { minErr = err; closest = p; } 
            });
          }

          return { 
            id: crypto.randomUUID(), 
            totalDist: parseFloat(closest.dist.toFixed(2)), 
            partialDist: 0, 
            tulipId: 'custom', 
            customTulip: {...defaultCustomTulip}, 
            infoIcons: [], 
            notes: name.toUpperCase().substring(0, 50), 
            terrain: 'asfalto', 
            isReset: false,
            lat: lat,
            lng: lng
          };
        });

        // Ordenamos por distancia y filtramos duplicados (puntos a menos de 10 metros)
        const cleanRoadbook = extractedRoadbook
          .sort((a,b) => a.totalDist - b.totalDist)
          .filter((item, pos, ary) => !pos || (item.totalDist - ary[pos - 1].totalDist > 0.01));

        setRoadbook(cleanRoadbook);
      }
    }; 
    reader.readAsText(file); 
    e.target.value = null;
  };

  const handleManualOpen = () => window.open(`data/Manual.pdf`, '_blank');
    
  return (
    <div id="main-app-container" tabIndex="-1" className="min-h-screen bg-gray-200 text-black font-sans focus:outline-none flex flex-col h-screen overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      
      {/* HEADER DE APLICACIÓN */}
      <header className="shrink-0 bg-slate-900 text-white p-4 shadow-xl print:hidden flex flex-wrap justify-between items-center gap-4 z-50 relative">
        <div className="flex items-center gap-3">
          <MapIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            Rally RobiBook <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white">PRO MAPS</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 relative">
          <button onPointerDown={(e) => { e.stopPropagation(); setShowResetConfirm(true); }} className="bg-red-700 text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-red-600 transition-colors"><Trash2 size={16}/> Nuevo</button>
          <button onPointerDown={(e) => { e.stopPropagation(); handleManualOpen(); }} className="bg-yellow-500 text-black px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-yellow-400 transition-colors"><HelpCircle size={16}/> Manual</button>
          <button onPointerDown={(e) => { e.stopPropagation(); handleSaveProject(); }} className="bg-indigo-600 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-indigo-500 transition-colors"><Save size={16}/> Guardar</button>
          <button onPointerDown={(e) => { e.stopPropagation(); loadProjectRef.current?.click(); }} className="bg-teal-600 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-teal-500 transition-colors"><FolderOpen size={16}/> Cargar</button>
          <input type="file" ref={loadProjectRef} onChange={handleLoadProject} accept=".rbk" className="hidden" />
          <button onPointerDown={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-gray-700 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-500">
            <Upload size={16}/> GPX TRACK
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".gpx" className="hidden" />
          <div className="relative">
            <button onPointerDown={(e) => { e.stopPropagation(); setShowAddChoice(!showAddChoice); }} className="bg-blue-600 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-blue-500 transition-colors"><Plus size={16}/> Añadir</button>
            {showAddChoice && (
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-black rounded shadow-2xl z-[300] flex flex-col p-1 min-w-[120px]">
                <button onPointerDown={(e) => { e.stopPropagation(); handleAddRow('asfalto'); }} className="px-4 py-3 text-black font-bold text-xs uppercase hover:bg-gray-100 text-left rounded">🛣️ Asfalto</button>
                <button onPointerDown={(e) => { e.stopPropagation(); handleAddRow('tierra'); }} className="px-4 py-3 text-black font-bold text-xs uppercase hover:bg-gray-100 text-left rounded border-t border-gray-200">🏜️ Tierra</button>
              </div>
            )}
          </div>
          <button onPointerDown={(e) => { e.stopPropagation(); handlePrint(); }} className="bg-green-600 px-4 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-green-500 transition-colors"><Printer size={16}/> Imprimir</button>
        </div>
      </header>

      {/* CONTENEDOR SPLIT SCREEN */}
      {/* Añadimos print:block, print:h-auto y print:static para romper totalmente el layout flexible en impresión */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative print:block print:overflow-visible print:h-auto print:static">
        
        {/* PANEL IZQUIERDO: VISOR MAPA CARTOGRÁFICO REAL */}
        <div className="w-full h-[40vh] md:w-1/2 md:h-full border-b-4 md:border-b-0 md:border-r-4 border-black relative z-0 print:hidden bg-slate-800 flex flex-col shadow-inner">
          <RealMapViewer gpxTrack={gpxTrack} roadbook={roadbook} onMapDblClick={handleMapDblClick} />
        </div>

        {/* PANEL DERECHO: EDITOR DE ROADBOOK */}
        {/* Desactivamos paddings inferiores (print:pb-0) y forzamos bloque estático */}
        <div className="w-full h-[60vh] md:w-1/2 md:h-full overflow-y-auto bg-gray-200 print:w-full print:block print:h-auto print:overflow-visible custom-scrollbar pb-24 md:pb-10 print:pb-0 print:static">
          <main className="w-full mx-auto bg-white shadow-2xl print:shadow-none print:mt-0 print:max-w-none print:w-full box-border border-x-0 md:border-x-2 print:border-none border-black min-h-full print:min-h-0 print:block print:static">
            <EditableRoadbookHeader data={headerData} setData={setHeaderData} />
            
            <div className="flex w-full border-y-2 border-black bg-white text-black font-bold uppercase text-center text-[10px] sm:text-xs tracking-widest sticky top-0 z-40 print:relative shadow-sm">
              <div className="w-[30%] p-2 border-r-2 border-black">Distancia</div>
              <div className="w-[35%] p-2 border-r-2 border-black">Dirección</div>
              <div className="w-[35%] p-2">Información</div>
            </div>
            
            {/* Es CRÍTICO que el contenedor de las filas sea print:block en lugar de flex-col al imprimir */}
            <div className="flex flex-col print:block">
              {roadbook.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-bold uppercase flex flex-col items-center print:hidden">
                  <Warehouse size={48} className="mb-4 opacity-50"/>
                  Roadbook Vacío<br/><span className="text-xs font-normal normal-case mt-2">Añade viñetas manualmente o extráelas desde el mapa GPX.</span>
                </div>
              ) : (
                roadbook.map((row, index) => (
                  <RoadbookRow key={row.id} row={row} index={index + 1} onUpdate={(id, field, val) => setRoadbook(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))} onDelete={id => setRowToDelete(id)} onInsert={id => { 
                      const idx = roadbook.findIndex(r => r.id === id); 
                      const nextDist = roadbook[idx+1] ? roadbook[idx+1].totalDist : roadbook[idx].totalDist + 0.5; 
                      const newRow = { id: crypto.randomUUID(), totalDist: parseFloat(((roadbook[idx].totalDist + nextDist)/2).toFixed(2)), partialDist: 0, tulipId: 'custom', customTulip: {...defaultCustomTulip}, infoIcons: [], notes: '', terrain: row.terrain, isReset: false }; 
                      const up = [...roadbook]; 
                      up.splice(idx+1, 0, newRow); 
                      setRoadbook(up); 
                  }} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* MODALES DE CONFIRMACIÓN */}
      {rowToDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4" onPointerDown={() => setRowToDelete(null)}>
          <div className="bg-white p-6 rounded-2xl border-2 border-black text-center max-w-sm shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <Trash2 size={48} className="mx-auto text-red-600 mb-4" /><h2 className="text-xl font-bold mb-6 uppercase">¿Eliminar viñeta?</h2>
            <div className="flex gap-4"><button onPointerDown={(e) => { e.stopPropagation(); setRowToDelete(null); }} className="flex-1 bg-gray-200 py-3 rounded font-bold hover:bg-gray-300 transition-colors">CANCELAR</button><button onPointerDown={(e) => { e.stopPropagation(); setRoadbook(prev => prev.filter(r => r.id !== rowToDelete)); setRowToDelete(null); }} className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition-colors">ELIMINAR</button></div>
          </div>
        </div>
      )}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4" onPointerDown={() => setShowResetConfirm(false)}>
          <div className="bg-white p-8 rounded-2xl border-2 border-black text-center max-w-sm shadow-2xl" onPointerDown={e => e.stopPropagation()}>
            <RotateCcw size={48} className="mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-bold mb-2 uppercase">Reiniciar Proyecto</h2>
            <p className="text-gray-600 mb-6 text-sm font-medium">¿Estás seguro de que quieres borrar todo y empezar de cero? Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button onPointerDown={(e) => { e.stopPropagation(); setShowResetConfirm(false); }} className="flex-1 bg-gray-200 py-3 rounded font-bold hover:bg-gray-300 transition-colors">CANCELAR</button>
              <button onPointerDown={(e) => { e.stopPropagation(); handleResetProject(); }} className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700 transition-colors">BORRAR TODO</button>
            </div>
          </div>
        </div>
      )}
      {showPrintModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center print:hidden backdrop-blur-sm" onPointerDown={() => setShowPrintModal(false)}>
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border-2 border-black" onPointerDown={e => e.stopPropagation()}>
            <Printer className="w-16 h-16 text-black mx-auto mb-4" /><h2 className="text-2xl font-bold mb-4 uppercase">Imprimir Roadbook</h2>
            <div className="text-left text-gray-700 mb-6 font-medium text-base bg-yellow-50 p-4 border-2 border-yellow-400 rounded-xl">
              <p className="mb-2 font-bold text-red-600 text-lg">⚠️ ¡MUY IMPORTANTE!</p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-black">
                <li><b className="text-red-600">NO uses Ctrl + P</b> en tu teclado.</li>
                <li>Pulsa el botón azul <b>"Aceptar e Imprimir"</b> de abajo.</li>
                <li><b>Tamaño: A4</b> y desmarca <b>"Encabezados y pies de página"</b>.</li>
              </ol>
            </div>
            <button onPointerDown={(e) => { e.stopPropagation(); setShowPrintModal(false); setTimeout(() => window.print(), 400); }} className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 uppercase tracking-wider shadow-[4px_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none transition-all">Aceptar e Imprimir</button>
          </div>
        </div>
      )}

      {/* ESTILOS INYECTADOS Y REGLAS DE IMPRESIÓN */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Corrección vital para evitar que Tailwind rompa las teselas (recuadros) de Leaflet */
        .leaflet-container img { 
          max-width: none !important; 
          max-height: none !important; 
          margin: 0 !important;
          padding: 0 !important;
        }
        .leaflet-tile {
          border: none !important;
          outline: none !important;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e5e7eb; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-left: 2px solid black; }
        
        @media print {
          html, body, #root, #main-app-container { 
            height: auto !important; 
            min-height: 100% !important; 
            overflow: visible !important; 
            display: block !important; 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            position: static !important;
          }
          @page { margin: 10mm; }
          .print\\:hidden { display: none !important; }
          
          /* --- DESHACER LA MAQUETACIÓN FLEX/GRID PARA IMPRIMIR CORRECTAMENTE --- */
          .md\\:flex-row { display: block !important; position: static !important; }
          .md\\:w-1\\/2 { width: 100% !important; max-width: 100% !important; position: static !important; }
          .overflow-y-auto, .overflow-hidden { overflow: visible !important; height: auto !important; }
          
          /* Forzar salto limpio eliminando el contexto flex en las filas */
          .roadbook-row { 
            page-break-inside: avoid !important; 
            break-inside: avoid !important; 
            display: block !important; 
            width: 100% !important;
          }
          
          /* Evitar cortes a la mitad asegurando que el interior también rechaza el salto */
          .roadbook-row > div.flex {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}