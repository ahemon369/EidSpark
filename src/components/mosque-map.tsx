
"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { Navigation, Loader2, AlertCircle, Map as MapIcon, ExternalLink, MapPin, Heart } from "lucide-react"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Custom Emerald Marker for Mosques
const mosqueIcon = L.divIcon({
  html: `<div class="bg-primary p-2.5 rounded-full border-4 border-white shadow-2xl transform hover:scale-110 transition-transform"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/><path d="M9 16c-1 0-2 1-2 2v4"/><path d="M15 16c1 0 2 1 2 2v4"/></svg></div>`,
  className: "custom-mosque-icon",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

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
  const [error, setError] = useState(false)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // metres
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  const fetchMosques = useCallback(async () => {
    const bounds = map.getBounds()
    const query = `[out:json];node["amenity"="place_of_worship"]["religion"="muslim"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});out;`
    
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ]

    setLoading(true)
    setError(false)
    let success = false

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: { 'Accept': 'application/json' },
        })
        
        if (!response.ok) throw new Error("API response error")
        
        const data = await response.json()
        const elements = (data.elements || []).map((m: any) => ({
          ...m,
          distance: userPos ? calculateDistance(userPos[0], userPos[1], m.lat, m.lon) : undefined
        }))

        // Sort by distance if user position is available
        if (userPos) {
          elements.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
        }

        onFetch(elements)
        success = true
        break
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}, trying fallback...`)
      }
    }

    if (!success) setError(true)
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
          <Loader2 className="w-5 h-5 animate-spin text-secondary" /> Syncing...
        </div>
      )}
      {error && !loading && (
        <div className="absolute top-6 right-6 z-[1000] bg-destructive/10 text-destructive p-3 px-6 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-black border-2 border-destructive/20 backdrop-blur-md">
          <AlertCircle className="w-5 h-5" /> Retrying Connection
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

  const tileUrl = MAPBOX_TOKEN 
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-50">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution={MAPBOX_TOKEN ? '© Mapbox & OpenStreetMap' : '&copy; OpenStreetMap contributors'}
          url={tileUrl}
          tileSize={MAPBOX_TOKEN ? 512 : 256}
          zoomOffset={MAPBOX_TOKEN ? -1 : 0}
        />
        <ChangeView center={center} zoom={zoom} />
        <MosqueFetcher userPos={userPos} onFetch={handleFetch} />

        {userPos && (
          <Marker position={userPos} icon={userLocationIcon}>
            <Popup className="custom-popup">
              <div className="p-2 font-black text-primary uppercase tracking-widest text-[10px]">
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.lat, mosque.lon]}
            icon={mosqueIcon}
          >
            <Popup className="rounded-[2rem] overflow-hidden custom-popup">
              <div className="p-4 space-y-4 min-w-[240px]">
                <div className="space-y-1">
                  <h3 className="font-black text-primary text-lg m-0 leading-tight">
                    {mosque.tags.name || mosque.tags["name:en"] || "Unnamed Mosque"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-bold m-0 opacity-80">
                    {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location hidden for privacy"}
                  </p>
                  {mosque.distance !== undefined && (
                    <div className="flex items-center gap-1 text-[11px] font-black uppercase text-secondary tracking-widest pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Distance: {mosque.distance < 1000 
                        ? `${Math.round(mosque.distance)} meters` 
                        : `${(mosque.distance / 1000).toFixed(2)} kilometers`}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    className="w-full emerald-gradient h-11 rounded-xl text-xs font-black shadow-lg hover:scale-[1.02] transition-transform text-white border-none"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                      window.open(url, "_blank")
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl text-xs font-black border-2 border-primary/10 hover:bg-primary/5 text-primary"
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lon}`
                        window.open(url, "_blank")
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Maps
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl text-xs font-black border-2 border-secondary/10 hover:bg-secondary/5 text-secondary"
                      onClick={() => onSaveMosque?.(mosque)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
