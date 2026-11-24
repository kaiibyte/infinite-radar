import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Activity, Plane, Search, Radio, Layers, Menu, X, Crosshair, ChevronRight, Navigation, Gauge, Compass, Clock3, ArrowUpRight, SlidersHorizontal, Wifi, Globe2, ExternalLink } from 'lucide-react';

const demoFlights = [
  { id:'IFC204', pilot:'AeroKai', aircraft:'Airbus A350-900', from:'WSSS', to:'RJTT', altitude:'37,000 ft', speed:'482 kts', heading:'041°', lat:27.1, lng:126.2, status:'En route', color:'#65d9ff' },
  { id:'PAL728', pilot:'SkyMNL', aircraft:'Boeing 777-300ER', from:'RPLL', to:'VHHH', altitude:'34,000 ft', speed:'468 kts', heading:'278°', lat:19.4, lng:121.4, status:'En route', color:'#9b8cff' },
  { id:'QTR811', pilot:'CloudNine', aircraft:'Boeing 787-9', from:'OTHH', to:'OMDB', altitude:'29,000 ft', speed:'451 kts', heading:'112°', lat:24.9, lng:53.1, status:'En route', color:'#ffbd69' },
  { id:'CPA219', pilot:'WingPilot', aircraft:'Airbus A330-300', from:'VHHH', to:'ZSPD', altitude:'31,000 ft', speed:'439 kts', heading:'036°', lat:25.4, lng:119.0, status:'En route', color:'#73e0b2' },
  { id:'UAE402', pilot:'AviationFan', aircraft:'Airbus A380-800', from:'OMDB', to:'WSSS', altitude:'39,000 ft', speed:'491 kts', heading:'105°', lat:12.2, lng:91.6, status:'En route', color:'#ff8e9e' },
];
const planeIcon = (color, selected=false) => L.divIcon({ className:'plane-marker-wrap', html:`<div class="plane-marker ${selected?'selected':''}" style="--plane-color:${color}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" fill="currentColor"/></svg></div>`, iconSize:[34,34], iconAnchor:[17,17] });

function App(){
  const [selected,setSelected]=useState(demoFlights[0]);
  const [query,setQuery]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [showRoutes,setShowRoutes]=useState(true);
  const [server,setServer]=useState('All sessions');
  const [mapStyle,setMapStyle]=useState('dark');
  const filtered=useMemo(()=>demoFlights.filter(f=>(f.id+' '+f.pilot+' '+f.aircraft+' '+f.from+' '+f.to).toLowerCase().includes(query.toLowerCase())),[query]);
  const route=[[selected.lat,selected.lng],[selected.lat+3.5,selected.lng+7.5]];
  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen?<X/>:<Menu/>}</button>
      <a className="brand" href="#"><span className="brand-mark"><Radio size={19}/></span><span>INFINITE<span className="brand-accent"> RADAR</span><small>COMMUNITY FLIGHT TRACKING</small></span></a>
      <div className="top-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search callsign, pilot, aircraft or airport..."/><kbd>⌘ K</kbd></div>
      <div className="top-actions"><div className="connection"><i/> DEMO MODE</div><button className="icon-button" onClick={()=>setFiltersOpen(!filtersOpen)} aria-label="Filters"><SlidersHorizontal size={18}/></button><div className="avatar">IR</div></div>
    </header>
    <main className="workspace">
      <aside className={`sidebar ${menuOpen?'open':''}`}>
        <div className="sidebar-heading"><div><span className="eyebrow">FLIGHT OPERATIONS</span><h2>Live traffic</h2></div><button className="icon-button subtle" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/></button></div>
        <div className="session-select"><Globe2 size={16}/><select value={server} onChange={e=>setServer(e.target.value)}><option>All sessions</option><option>Expert server</option><option>Casual server</option><option>Training server</option></select><ChevronRight size={15}/></div>
        <div className="stats-row"><div className="stat-card"><strong>—</strong><span>LIVE PILOTS</span></div><div className="stat-card"><strong>—</strong><span>ACTIVE FLIGHTS</span></div></div>
        {filtersOpen&&<div className="filter-panel"><label className="toggle-line">Show route lines <input type="checkbox" checked={showRoutes} onChange={e=>setShowRoutes(e.target.checked)}/></label><label className="toggle-line">Map style <select value={mapStyle} onChange={e=>setMapStyle(e.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select></label></div>}
        <div className="list-title"><span>FLIGHTS IN VIEW</span><span className="count">{filtered.length}</span></div>
        <div className="flight-list">{filtered.map(f=><button key={f.id} className={`flight-item ${selected.id===f.id?'active':''}`} onClick={()=>{setSelected(f);setMenuOpen(false)}}><span className="flight-symbol" style={{'--flight-color':f.color}}><Plane size={17}/></span><span className="flight-main"><strong>{f.id}</strong><small>{f.pilot} · {f.aircraft}</small><span className="route-label">{f.from}<b>→</b>{f.to}</span></span><ChevronRight className="flight-chevron" size={16}/></button>)}</div>
        <div className="sidebar-foot"><span className="pulse-dot"/> Waiting for live API connection</div>
      </aside>
      <section className="map-area">
        <div className="map-toolbar"><div className="map-title"><span className="live-pill"><i/> MAP PREVIEW</span><span className="map-subtitle">World overview <b>·</b> Community data</span></div><div className="map-tools"><button className="tool-button" onClick={()=>setShowRoutes(!showRoutes)}><Layers size={16}/><span>Routes</span></button><button className="tool-button"><Crosshair size={16}/><span>Locate</span></button></div></div>
        <MapContainer center={[22,112]} zoom={3} minZoom={2} maxZoom={9} zoomControl={false} worldCopyJump className="radar-map">
          <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url={mapStyle==='dark'?'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png':'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'}/>
          <ZoomControl position="bottomright"/>
          {showRoutes&&<Polyline positions={route} pathOptions={{color:selected.color,weight:2,opacity:.75,dashArray:'7 9'}}/>}
          {demoFlights.map(f=><Marker key={f.id} position={[f.lat,f.lng]} icon={planeIcon(f.color,selected.id===f.id)} eventHandlers={{click:()=>setSelected(f)}}><Popup><strong>{f.id}</strong><br/>{f.from} → {f.to}</Popup></Marker>)}
        </MapContainer>
        <div className="map-legend"><span><i className="legend-plane"/> Aircraft</span><span><i className="legend-route"/> Selected route</span><span><i className="legend-airport"/> Airport</span></div>
        <div className="map-watermark">INFINITE RADAR <span>·</span> PREVIEW</div>
      </section>
      <aside className="details-panel">
        <div className="detail-head"><div><span className="eyebrow">FLIGHT DETAILS</span><h2>{selected.id}</h2></div><span className="status-chip"><i/> {selected.status}</span></div>
        <div className="aircraft-hero"><div className="aircraft-orbit"><div className="orbit-ring"/><Plane size={48} strokeWidth={1.15}/></div><span className="aircraft-type">{selected.aircraft}</span><span className="pilot-name">PILOT <b>{selected.pilot}</b></span></div>
        <div className="route-card"><div className="airport"><span>ORIGIN</span><strong>{selected.from}</strong><small>Departure</small></div><div className="route-line"><i/><span>DIRECT ROUTE</span><i/></div><div className="airport right"><span>DESTINATION</span><strong>{selected.to}</strong><small>Arrival</small></div></div>
        <div className="detail-section-title">FLIGHT TELEMETRY <span>PREVIEW</span></div>
        <div className="telemetry-grid"><div className="telemetry"><Gauge/><span>ALTITUDE</span><strong>{selected.altitude}</strong></div><div className="telemetry"><Activity/><span>GROUND SPEED</span><strong>{selected.speed}</strong></div><div className="telemetry"><Compass/><span>HEADING</span><strong>{selected.heading}</strong></div><div className="telemetry"><Navigation/><span>VERTICAL SPEED</span><strong>—</strong></div></div>
        <div className="api-notice"><div className="notice-icon"><Wifi size={17}/></div><div><strong>Live data not connected yet</strong><p>This is an interface preview. Live pilot and aircraft data will appear after API access is configured.</p></div></div>
        <button className="primary-button" onClick={()=>window.open('https://infiniteflight.com/','_blank')}><ExternalLink size={16}/> Infinite Flight website <ArrowUpRight size={15}/></button>
      </aside>
    </main>
    <footer className="statusbar"><div><span className="pulse-dot"/> SYSTEM READY <b>·</b> UI PREVIEW</div><div><span>MAP: CARTO</span><b>·</b><span>DATA: NOT CONNECTED</span><b>·</b><Clock3 size={13}/><span>AWAITING API SETUP</span></div><div>INDEPENDENT COMMUNITY PROJECT</div></footer>
  </div>
}
export default App;
