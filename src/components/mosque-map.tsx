"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { Navigation, Loader2, MapPin, Heart, Clock, Timer, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Premium Green Mosque Marker Icon using white mosque silhouette
const getStandardMosqueIcon = () => {
  const iconUrl = "https://img.icons8.com/ios-filled/50/ffffff/mosque.png";
  
  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper">
        <div class="mosque-marker-glow" style="background: rgba(16, 185, 129, 0.4)"></div>
        <div class="mosque-marker-icon" style="background: #10b981; border: 2px solid #fbbf24;">
          <img src="${iconUrl}" style="width: 24px; height: 24px;" alt="mosque" />
        </div>
      </div>
    `,
    className: "custom-mosque-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
}

const userLocationIcon = L.divIcon({
  html: `<div class="relative w-8 h-8"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div><div class="absolute inset-1.5 bg-blue-500 rounded-full border-4 border-white shadow-xl"></div></div>`,
  className: "custom-user-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface Mosque {
  id: number
  lat: number
  lon: number
  name: string
  tags: any
  distance?: number
}

interface MapProps {
  center: [number, number]
  zoom: number
  onLocationFound: (location: [number, number]) => void
  onMosquesUpdate?: (mosques: Mosque[]) => void
  onSaveMosque?: (mosque: Mosque) => void
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function MosqueFetcher({ userPos, onFetch }: { userPos: [number, number] | null; onFetch: (mosques: Mosque[]) => void }) {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const fetchMosques = useCallback(async () => {
    if (map.getZoom() < 11) {
      onFetch([]);
      return;
    }

    const bounds = map.getBounds()
    const query = `[out:json][timeout:25];
      area["name"="Bangladesh"]->.searchArea;
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](area.searchArea)(${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      );
      out body;
      >;
      out skel qt;`
    
    const endpoint = "https://overpass-api.de/api/interpreter"

    setLoading(true)
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("API response error")
      
      const data = await response.json()
      const elements = (data.elements || []).map((m: any) => ({
        ...m,
        distance: userPos ? calculateDistance(userPos[0], userPos[1], m.lat, m.lon) : undefined
      }))

      if (userPos) {
        elements.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
      }

      onFetch(elements)
    } catch (err) {
      console.warn("Failed to fetch mosques from OSM")
    }
    setLoading(false)
  }, [map, onFetch, userPos])

  useMapEvents({
    moveend: () => fetchMosques(),
  })

  useEffect(() => {
    fetchMosques()
  }, [fetchMosques])

  return (
    <>
      {loading && (
        <div className="absolute top-6 right-6 z-[1000] bg-white p-3 px-6 rounded-2xl shadow-2xl flex items-center gap-3 text-primary text-sm font-black border-2 border-primary/10 animate-in fade-in zoom-in">
          <Loader2 className="w-5 h-5 animate-spin text-secondary" /> Syncing Registry...
        </div>
      )}
    </>
  )
}

function MosquePopup({ mosque, onSave }: { mosque: Mosque, onSave?: (m: Mosque) => void }) {
  const [times, setTimes] = useState<any>(null);
  const [next, setNext] = useState<string>("");

  useEffect(() => {
    const fetchTimes = async () => {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${mosque.lat}&longitude=${mosque.lon}&method=1`);
      const data = await res.json();
      if (data.data) {
        setTimes(data.data.timings);
        
        const now = new Date();
        const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        for (const p of prayers) {
          const [h, m] = data.data.timings[p].split(':').map(Number);
          const pDate = new Date();
          pDate.setHours(h, m, 0);
          if (pDate > now) {
            setNext(p);
            break;
          }
        }
        if (!next) setNext("Fajr");
      }
    };
    fetchTimes();
  }, [mosque.lat, mosque.lon, next]);

  return (
    <div className="p-0 space-y-0 min-w-[280px] bg-white">
      <div className="emerald-gradient p-6 text-white">
        <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2 border border-white/10">
          <span className="text-[8px] font-black uppercase tracking-widest">Verified Observatory</span>
        </div>
        <h3 className="font-black text-xl m-0 leading-tight">
          {mosque.tags.name || mosque.tags["name:en"] || "Local Mosque"}
        </h3>
        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">
          {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location Registry"}
        </p>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
            <p className="text-sm font-black text-primary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {mosque.distance ? `${(mosque.distance / 1000).toFixed(2)} km` : "---"}
            </p>
          </div>
          <div className="bg-secondary/5 p-3 rounded-2xl border border-secondary/10">
            <p className="text-[8px] font-black text-secondary uppercase tracking-widest mb-1">Next Azan</p>
            <p className="text-sm font-black text-secondary flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {next || "---"}
            </p>
          </div>
        </div>

        {times && (
          <div className="space-y-2 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-primary/40" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Today's Schedule</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map(p => (
                <div key={p} className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                  next === p ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-100"
                )}>
                  {p} {times[p]}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-2 pt-2">
          <Button
            className="w-full h-12 rounded-xl emerald-gradient text-white font-black text-xs shadow-lg"
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
              window.open(url, "_blank")
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate Now
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-xs font-black border-2 border-secondary/10 hover:bg-secondary/5 text-secondary"
            onClick={() => onSave?.(mosque)}
          >
            <Heart className="w-4 h-4 mr-2" />
            Add to Favorites
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function MosqueMap({ center, zoom, onLocationFound, onMosquesUpdate, onSaveMosque }: MapProps) {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [ClusterGroup, setClusterGroup] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      const watcher = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setUserPos(newPos)
          onLocationFound(newPos)
        },
        (err) => console.error("Geolocation failed:", err),
        { enableHighAccuracy: true }
      )
      return () => navigator.geolocation.clearWatch(watcher)
    }
  }, [onLocationFound])

  // Load react-leaflet-cluster dynamically to avoid Module Factory errors in Turbopack
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-leaflet-cluster").then((mod) => {
        setClusterGroup(() => mod.default);
      }).catch(err => {
        console.warn("Failed to load MarkerClusterGroup:", err);
      });
    }
  }, []);

  const handleFetch = (fetched: Mosque[]) => {
    setMosques(fetched)
    if (onMosquesUpdate) onMosquesUpdate(fetched)
  }

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    return (
      <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <div className="space-y-2">
          <h3 className="text-xl font-black text-primary">Map Not Configured</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Please add your Mapbox token to the environment variables to view local mosques.
          </p>
        </div>
      </div>
    )
  }

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  const markers = mosques.map((mosque) => {
    const name = mosque.tags.name || mosque.tags["name:en"] || "Local Mosque";
    return (
      <Marker
        key={mosque.id}
        position={[mosque.lat, mosque.lon]}
        icon={getStandardMosqueIcon()}
      >
        <Tooltip direction="top" offset={[0, -35]} opacity={1}>
          <span className="font-black text-xs text-primary">{name}</span>
        </Tooltip>
        <Popup className="rounded-[2.5rem] overflow-hidden custom-popup">
          <MosquePopup mosque={mosque} onSave={onSaveMosque} />
        </Popup>
      </Marker>
    )
  });

  return (
    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-50">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='© Mapbox © OpenStreetMap'
          url={tileUrl}
          tileSize={512}
          zoomOffset={-1}
        />
        <ChangeView center={center} zoom={zoom} />
        <MosqueFetcher userPos={userPos} onFetch={handleFetch} />

        {userPos && (
          <Marker position={userPos} icon={userLocationIcon}>
            <Popup className="custom-popup-minimal">
              <div className="p-3 font-black text-blue-600 text-[10px] uppercase tracking-[0.25em] text-center">
                Current Location
              </div>
            </Popup>
          </Marker>
        )}

        {ClusterGroup ? (
          <ClusterGroup 
            chunkedLoading 
            maxClusterRadius={50}
            showCoverageOnHover={false}
          >
            {markers}
          </ClusterGroup>
        ) : (
          markers
        )}
      </MapContainer>

      <style jsx global>{`
        @keyframes marker-drop {
          0% { transform: translateY(-50px) scale(0.5); opacity: 0; }
          60% { transform: translateY(5px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes marker-glow-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        
        .mosque-marker-wrapper {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: marker-drop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .mosque-marker-glow {
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          animation: marker-glow-pulse 2s infinite ease-out;
        }

        .mosque-marker-icon {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          z-index: 2;
        }

        .leaflet-tooltip {
          background: white !important;
          border: 2px solid #065f46 !important;
          border-radius: 12px !important;
          padding: 6px 12px !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          font-family: 'Hind Siliguri', sans-serif !important;
          font-weight: 800 !important;
          color: #065f46 !important;
        }
      `}</style>
    </div>
  )
}