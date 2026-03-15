
"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { format } from "date-fns"
import { Moon, Star, MapPin, User, Clock } from "lucide-react"

// Custom Glowing Marker Icons
const seenIcon = L.divIcon({
  html: `
    <div class="relative w-10 h-10 flex items-center justify-center">
      <div class="absolute inset-0 bg-secondary rounded-full animate-ping opacity-40"></div>
      <div class="absolute inset-1 bg-secondary rounded-full shadow-[0_0_20px_rgba(233,190,36,0.8)] border-2 border-white flex items-center justify-center text-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </div>
    </div>
  `,
  className: "custom-moon-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const notSeenIcon = L.divIcon({
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-400 rounded-full animate-pulse opacity-20"></div>
      <div class="absolute inset-1 bg-slate-100 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-slate-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </div>
    </div>
  `,
  className: "custom-not-moon-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface Sighting {
  id: string
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

  return (
    <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-900">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} zoom={zoom} />

        {sightings.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={s.seen ? seenIcon : notSeenIcon}
          >
            <Popup className="custom-popup rounded-[2rem] overflow-hidden">
              <div className="p-4 space-y-4 min-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    s.seen ? "bg-secondary text-primary" : "bg-slate-100 text-slate-400"
                  )}>
                    {s.seen ? <Moon className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 m-0">
                      {s.seen ? "Moon Spotted!" : "Not Visible"}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.locationName}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <User className="w-3 h-3 text-primary" />
                    <span>Reported by: {s.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{format(new Date(s.timestamp), "MMM d, h:mm aa")}</span>
                  </div>
                  {s.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-2 border-l-2 border-primary/20 pl-2">
                      "{s.notes}"
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] space-y-2">
        <div className="glass-card p-4 rounded-2xl shadow-xl border-white/20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_#fbbf24] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-primary">Moon Seen</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-400 opacity-50"></div>
            <span className="text-[10px] font-black uppercase text-slate-500">Not Seen</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
