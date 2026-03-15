
"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, CheckCircle2, ShieldCheck } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useFirestore } from "@/firebase"

// Custom Mosque Icon
const mosqueIcon = L.divIcon({
  html: `
    <div class="relative w-12 h-12 flex items-center justify-center">
      <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-40"></div>
      <div class="absolute inset-1 bg-primary rounded-full shadow-[0_0_20px_rgba(6,95,70,0.5)] border-4 border-white flex items-center justify-center text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/><path d="M9 16c-1 0-2 1-2 2v4"/><path d="M15 16c1 0 2 1 2 2v4"/></svg>
      </div>
    </div>
  `,
  className: "custom-jamaat-icon",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function JamaatMap({ mosques, onSelectMosque }: { mosques: any[], onSelectMosque: (id: string) => void }) {
  const [center] = useState<[number, number]>([23.8103, 90.4125]) // Default center: Dhaka
  const zoom = 12

  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.latitude, mosque.longitude]}
            icon={mosqueIcon}
            eventHandlers={{
              click: () => onSelectMosque(mosque.id),
            }}
          >
            <Popup className="custom-popup">
              <MosquePopupContent mosque={mosque} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

function MosquePopupContent({ mosque }: { mosque: any }) {
  const db = useFirestore()
  const [times, setTimes] = useState<any[]>([])

  useEffect(() => {
    if (!db) return
    const q = query(
      collection(db, "mosques", mosque.id, "jamaatTimes"),
      where("isApprovedByAdmin", "==", true)
    )
    return onSnapshot(q, (snapshot) => {
      setTimes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
  }, [db, mosque.id])

  return (
    <div className="p-4 space-y-4 min-w-[260px] bg-white rounded-2xl">
      <div className="space-y-1">
        <h3 className="font-black text-primary text-lg m-0 leading-tight flex items-center gap-2">
          {mosque.name}
          {mosque.isApprovedByAdmin && <ShieldCheck className="w-4 h-4 text-secondary fill-secondary" />}
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {mosque.area}, {mosque.district}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 border-b pb-1">Eid Jamaat Schedule</p>
        <div className="grid grid-cols-2 gap-2">
          {times.length > 0 ? (
            times.map((t) => (
              <div key={t.id} className="bg-primary/5 p-2 rounded-xl border border-primary/5 flex flex-col items-center">
                <span className="text-sm font-black text-primary">{t.time}</span>
                {t.communitySubmissionCount > 1 && <span className="text-[7px] font-bold text-emerald-600 uppercase">Verified</span>}
              </div>
            ))
          ) : (
            <p className="col-span-2 text-[10px] font-bold text-muted-foreground italic text-center py-2">No schedules verified yet.</p>
          )}
        </div>
      </div>

      <Button 
        className="w-full h-11 rounded-xl emerald-gradient font-black text-xs shadow-lg text-white"
        onClick={() => {
          if (mosque.googleMapsLink) {
            window.open(mosque.googleMapsLink, "_blank")
          } else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")
          }
        }}
      >
        <Navigation className="w-4 h-4 mr-2" /> Start Navigation
      </Button>
    </div>
  )
}
