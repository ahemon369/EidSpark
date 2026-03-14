"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { Navigation, Loader2, AlertCircle } from "lucide-react"

// Fix for Leaflet default marker icons in Next.js
const mosqueIcon = L.divIcon({
  html: `<div class="bg-primary p-2 rounded-full border-2 border-white shadow-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mosque"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/><path d="M9 16c-1 0-2 1-2 2v4"/><path d="M15 16c1 0 2 1 2 2v4"/></svg></div>`,
  className: "custom-div-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const userLocationIcon = L.divIcon({
  html: `<div class="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
  className: "custom-user-icon",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

interface Mosque {
  id: number
  lat: number
  lon: number
  name: string
  tags: any
}

interface MapProps {
  center: [number, number]
  zoom: number
  onLocationFound: (location: [number, number]) => void
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function MosqueFetcher({ onFetch }: { onFetch: (mosques: Mosque[]) => void }) {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

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
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (!response.ok) throw new Error("API response error")
        
        const data = await response.json()
        onFetch(data.elements || [])
        success = true
        break // Stop at the first successful endpoint
      } catch (err) {
        console.warn(`Failed to fetch from ${endpoint}, trying fallback...`)
      }
    }

    if (!success) {
      setError(true)
    }
    setLoading(false)
  }, [map, onFetch])

  useMapEvents({
    moveend: () => {
      fetchMosques()
    },
  })

  useEffect(() => {
    fetchMosques()
  }, [fetchMosques])

  return (
    <>
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-2 px-4 rounded-full shadow-lg flex items-center gap-2 text-primary text-xs font-bold border border-primary/10">
          <Loader2 className="w-4 h-4 animate-spin" /> Updating mosques...
        </div>
      )}
      {error && !loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-destructive/10 text-destructive p-2 px-4 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold border border-destructive/20 backdrop-blur-md">
          <AlertCircle className="w-4 h-4" /> Connection error. Try moving the map.
        </div>
      )}
    </>
  )
}

export default function MosqueMap({ center, zoom, onLocationFound }: MapProps) {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [userPos, setUserPos] = useState<[number, number] | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setUserPos(newPos)
          onLocationFound(newPos)
        },
        (err) => console.error("Geolocation failed:", err)
      )
    }
  }, [onLocationFound])

  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-50">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        <MosqueFetcher onFetch={setMosques} />

        {userPos && (
          <Marker position={userPos} icon={userLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.lat, mosque.lon]}
            icon={mosqueIcon}
          >
            <Popup className="rounded-2xl overflow-hidden">
              <div className="p-2 space-y-3 min-w-[200px]">
                <div>
                  <h3 className="font-black text-primary text-base m-0 leading-tight">
                    {mosque.tags.name || mosque.tags["name:en"] || "Unnamed Mosque"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1 m-0">
                    {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location details unavailable"}
                  </p>
                </div>
                <Button
                  className="w-full emerald-gradient h-10 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                    window.open(url, "_blank")
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
