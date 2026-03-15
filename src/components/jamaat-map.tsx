
"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, CheckCircle2, ShieldCheck, ExternalLink, Globe } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { cn } from "@/lib/utils"

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW1yYW5lbW9uIiwiYSI6ImNtN200bmc4dTBmMGIyanE1YnVzaTB3NXIifQ.2Gu9mCgIeRo9EqRt2viYhg";

// Confirmed Mosque Icon (Green)
const confirmedIcon = L.divIcon({
  html: `
    <div class="relative w-14 h-14 flex items-center justify-center group">
      <div class="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-40"></div>
      <div class="absolute inset-1.5 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.6)] border-[5px] border-white flex items-center justify-center text-white transition-all group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/></svg>
      </div>
    </div>
  `,
  className: "custom-jamaat-icon-confirmed",
  iconSize: [56, 56],
  iconAnchor: [28, 28],
})

// Pending Mosque Icon (Amber)
const pendingIcon = L.divIcon({
  html: `
    <div class="relative w-12 h-12 flex items-center justify-center group">
      <div class="absolute inset-0 bg-amber-400/20 rounded-full animate-pulse opacity-40"></div>
      <div class="absolute inset-1.5 bg-amber-400 rounded-full shadow-[0_0_25px_rgba(251,191,36,0.6)] border-[4px] border-white flex items-center justify-center text-white transition-all group-hover:scale-110">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/></svg>
      </div>
    </div>
  `,
  className: "custom-jamaat-icon-pending",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

// User Location Icon
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative w-10 h-10 flex items-center justify-center">
      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
      <div class="absolute inset-2 bg-blue-500 rounded-full border-4 border-white shadow-2xl"></div>
    </div>
  `,
  className: "custom-user-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  return null
}

export default function JamaatMap({ 
  mosques, 
  onSelectMosque, 
  userLocation 
}: { 
  mosques: any[], 
  onSelectMosque: (id: string) => void,
  userLocation?: [number, number] | null
}) {
  const [center, setCenter] = useState<[number, number]>([23.8103, 90.4125]) // Default center: Dhaka
  const [zoom, setZoom] = useState(12)

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation)
      setZoom(15)
    }
  }, [userLocation])

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
          tileSize={512}
          zoomOffset={-1}
        />
        <ChangeView center={center} zoom={zoom} />

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup className="custom-popup-minimal">
              <div className="p-3 font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] text-center">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.latitude, mosque.longitude]}
            icon={mosque.isApprovedByAdmin ? confirmedIcon : pendingIcon}
            eventHandlers={{
              click: () => onSelectMosque(mosque.id),
            }}
          >
            <Popup className="custom-popup-mosque">
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
    <div className="p-6 space-y-6 min-w-[300px] bg-white rounded-[2rem] border-none shadow-none">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-slate-800 text-xl m-0 leading-tight">
            {mosque.name}
          </h3>
          {mosque.isApprovedByAdmin && <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-500" />}
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary" /> {mosque.area}, {mosque.district}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
          <Clock className="w-4 h-4 text-primary opacity-40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Verified Jamaat Times</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {times.length > 0 ? (
            times.map((t) => (
              <div key={t.id} className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex flex-col items-center">
                <span className="text-sm font-black text-emerald-700">{t.time}</span>
                {t.communitySubmissionCount > 1 && <span className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5">✔ Community Verified</span>}
              </div>
            ))
          ) : (
            <p className="col-span-2 text-[10px] font-bold text-muted-foreground italic text-center py-4 bg-slate-50 rounded-2xl">Updating schedule...</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          className="w-full h-12 rounded-xl emerald-gradient font-black text-xs shadow-xl text-white border-none transition-transform hover:scale-[1.02] active:scale-95"
          onClick={() => {
            const url = mosque.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
            window.open(url, "_blank");
          }}
        >
          <Navigation className="w-4 h-4 mr-3" /> Open in Google Maps
        </Button>
        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground h-8" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`, "_blank")}>
          <ExternalLink className="w-3 h-3 mr-2" /> More Info
        </Button>
      </div>
    </div>
  )
}
