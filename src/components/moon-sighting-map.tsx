"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { format } from "date-fns"
import { User, Clock, CheckCircle2, XCircle, MapPin, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Custom Glowing Marker Icons
const seenIcon = L.divIcon({
  html: `
    <div class="relative w-12 h-12 flex items-center justify-center">
      <div class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
      <div class="absolute inset-1 bg-emerald-500 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.8)] border-4 border-white flex items-center justify-center text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </div>
    </div>
  `,
  className: "custom-moon-icon",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

const notSeenIcon = L.divIcon({
  html: `
    <div class="relative w-10 h-10 flex items-center justify-center">
      <div class="absolute inset-0 bg-rose-500 rounded-full animate-pulse opacity-30"></div>
      <div class="absolute inset-1 bg-rose-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </div>
    </div>
  `,
  className: "custom-not-moon-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

interface Sighting {
  id: string
  userId: string
  userName: string
  locationName: string
  lat: number
  lng: number
  timestamp: string
  seen: boolean
  notes?: string
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MoonSightingMap({ sightings }: { sightings: Sighting[] }) {
  const center: [number, number] = [23.6850, 90.3563] // Center of Bangladesh
  const zoom = 7

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-12 text-center space-y-6 rounded-[3rem] border-8 border-white/5">
        <AlertTriangle className="w-20 h-20 text-amber-500" />
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-white tracking-tight">Tracker Unavailable</h3>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
            The community map requires a secure Mapbox configuration. Please set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment.
          </p>
        </div>
      </div>
    )
  }

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  return (
    <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_48px_96px_-12px_rgba(0,0,0,0.5)] border-8 border-white/10 bg-slate-900 group">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='© Mapbox & OpenStreetMap'
          url={tileUrl}
          tileSize={512}
          zoomOffset={-1}
        />
        <ChangeView center={center} zoom={zoom} />

        {sightings.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={s.seen ? seenIcon : notSeenIcon}
          >
            <Popup className="custom-popup">
              <div className="p-6 space-y-5 min-w-[260px] bg-white rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2",
                    s.seen ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                  )}>
                    {s.seen ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 m-0 text-lg leading-tight">
                      {s.seen ? "Moon Spotted" : "Not Visible"}
                    </h4>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.locationName}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <User className="w-4 h-4 text-primary opacity-60" />
                    <span>Reported by {s.userName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-primary opacity-60" />
                    <span>{format(new Date(s.timestamp), "MMM d, h:mm aa")}</span>
                  </div>
                  {s.notes && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        "{s.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Interactive Legend Overlay */}
      <div className="absolute bottom-8 left-8 z-[1000]">
        <div className="bg-slate-950/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border-2 border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-ping"></div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Seen • Spotted</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Not Visible</span>
          </div>
        </div>
      </div>
    </div>
  )
}