
"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Button } from "@/components/ui/button"
import { Navigation, Loader2, MapPin, Heart } from "lucide-react"

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW1yYW5lbW9uIiwiYSI6ImNtN200bmc4dTBmMGIyanE1YnVzaTB3NXIifQ.2Gu9mCgIeRo9EqRt2viYhg";

// Premium Green Mosque Marker Icon
const getStandardMosqueIcon = () => {
  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper">
        <div class="mosque-marker-glow" style="background: rgba(16, 185, 129, 0.4)"></div>
        <div class="mosque-marker-icon" style="background: #10b981; border-color: #E9BE24; border-width: 2px; border-style: solid; box-shadow: 0 4px 12px rgba(0,0,0,0.2)">
          <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L10.5 4.5H13.5L12 2Z" />
            <path d="M12 4.5C8.686 4.5 6 7.186 6 10.5V13H18V10.5C18 7.186 15.314 4.5 12 4.5Z" />
            <path d="M4 12V22H5.5V12H4ZM18.5 12V22H20V12H18.5ZM6.5 14V22H17.5V14H6.5Z" />
            <path d="M12 1C12 1 12.5 2 12 2.5C11.5 2 12 1 12 1Z" />
          </svg>
        </div>
      </div>
    `,
    className: "custom-mosque-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

const userLocationIcon = L.divIcon({
  html: `<div class="relative w-7 h-7"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div><div class="absolute inset-1.5 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div></div>`,
  className: "custom-user-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
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
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
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
          <Loader2 className="w-5 h-5 animate-spin text-secondary" /> Syncing Local Registry...
        </div>
      )}
    </>
  )
}

export default function MosqueMap({ center, zoom, onLocationFound, onMosquesUpdate, onSaveMosque }: MapProps) {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)

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

  const handleFetch = (fetched: Mosque[]) => {
    setMosques(fetched)
    if (onMosquesUpdate) onMosquesUpdate(fetched)
  }

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

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
            <Popup className="custom-popup">
              <div className="p-2 font-black text-primary uppercase tracking-widest text-[10px]">
                Your Current Position
              </div>
            </Popup>
          </Marker>
        )}

        <MarkerClusterGroup 
          chunkedLoading 
          maxClusterRadius={50}
          showCoverageOnHover={false}
        >
          {mosques.map((mosque) => {
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
                <Popup className="rounded-[2rem] overflow-hidden custom-popup">
                  <div className="p-0 space-y-0 min-w-[260px]">
                    <div className="emerald-gradient p-5 text-white">
                      <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-2 border border-white/10">
                        <span className="text-[8px] font-black uppercase tracking-widest">Type: Mosque</span>
                      </div>
                      <h3 className="font-black text-lg m-0 leading-tight">
                        {name}
                      </h3>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">
                        {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location Registry Entry"}
                      </p>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      {mosque.distance !== undefined && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary tracking-widest">
                          <MapPin className="w-3.5 h-3.5" />
                          {(mosque.distance / 1000).toFixed(2)} km from you
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          className="w-full h-11 rounded-xl emerald-gradient text-white font-black text-xs shadow-lg"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                            window.open(url, "_blank")
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Open in Google Maps
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl text-xs font-black border-2 border-secondary/10 hover:bg-secondary/5 text-secondary"
                          onClick={() => onSaveMosque?.(mosque)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Save to Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <style jsx global>{`
        @keyframes marker-drop {
          0% { transform: translateY(-50px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); }
        }

        @keyframes marker-glow-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        
        .mosque-marker-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: marker-drop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .mosque-marker-glow {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          animation: marker-glow-pulse 2s infinite;
        }

        .mosque-marker-icon {
          position: relative;
          width: 36px;
          height: 36px;
          color: white;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          padding: 7px;
        }

        .mosque-marker-wrapper:hover .mosque-marker-icon {
          transform: scale(1.1) translateY(-5px);
        }

        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
          background-color: rgba(16, 185, 129, 0.2) !important;
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
          background-color: rgba(16, 185, 129, 0.8) !important;
          color: white !important;
          font-weight: 900 !important;
          border: 2px solid white;
        }
      `}</style>
    </div>
  )
}
