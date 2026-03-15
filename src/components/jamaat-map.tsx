
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

// Custom Marker Style with Glow and Drop Animation
const mosqueIcon = L.divIcon({
  html: `
    <div class="mosque-marker-wrapper">
      <div class="mosque-marker-glow"></div>
      <div class="mosque-marker-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8a2 2 0 1 0-4 0v4"/><path d="M4 12V8a2 2 0 0 1 4 0v4"/><path d="M12 4v8"/><path d="M3 12h18"/><path d="M12 12v10"/><path d="m12 12-4 10"/><path d="m12 12 4 10"/></svg>
      </div>
    </div>
  `,
  className: "custom-mosque-marker",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
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
  const [zoom, setZoom] = useState(7)

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
              <div className="p-3 font-black text-blue-600 text-[10px] uppercase tracking-[0.2em] text-center">You are here</div>
            </Popup>
          </Marker>
        )}

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.latitude, mosque.longitude]}
            icon={mosqueIcon}
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

      <style jsx global>{`
        @keyframes marker-drop {
          0% { transform: translateY(-50px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); }
        }
        
        .mosque-marker-wrapper {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: marker-drop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .mosque-marker-glow {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(16, 185, 129, 0.4);
          border-radius: 50%;
          filter: blur(10px);
          animation: pulse 2s infinite;
        }

        .mosque-marker-icon {
          position: relative;
          width: 40px;
          height: 40px;
          background: #065f46;
          color: white;
          border-radius: 12px;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .mosque-marker-wrapper:hover .mosque-marker-icon {
          transform: scale(1.1) translateY(-5px);
          background: #059669;
        }

        .custom-popup-mosque .leaflet-popup-content-wrapper {
          border-radius: 2rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .custom-popup-mosque .leaflet-popup-content {
          margin: 0;
          width: 300px !important;
        }

        .custom-popup-mosque .leaflet-popup-tip {
          background: white;
        }
      `}</style>
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

  // Combine directly reported time with subcollection times
  const displayTimes = [...times];
  if (mosque.eid_prayer_time && !displayTimes.find(t => t.time === mosque.eid_prayer_time)) {
    displayTimes.unshift({ id: 'primary', time: mosque.eid_prayer_time, communitySubmissionCount: 1 });
  }

  return (
    <div className="p-6 space-y-6 bg-white">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-slate-800 text-xl m-0 leading-tight">
            {mosque.name}
          </h3>
          {mosque.isApprovedByAdmin && <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-500" />}
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary" /> {mosque.area || mosque.district}, {mosque.district}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
          <Clock className="w-4 h-4 text-primary opacity-40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Eid Jamaat Times</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {displayTimes.length > 0 ? (
            displayTimes.map((t) => (
              <div key={t.id} className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex flex-col items-center">
                <span className="text-sm font-black text-emerald-700">{t.time}</span>
                {t.communitySubmissionCount > 1 && <span className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5">✔ Verified</span>}
              </div>
            ))
          ) : (
            <p className="col-span-2 text-[10px] font-bold text-muted-foreground italic text-center py-4 bg-slate-50 rounded-2xl">Awaiting update...</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          className="w-full h-12 rounded-xl emerald-gradient font-black text-xs shadow-xl text-white border-none transition-transform hover:scale-[1.02] active:scale-95"
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`;
            window.open(url, "_blank");
          }}
        >
          <Navigation className="w-4 h-4 mr-3" /> Get Directions
        </Button>
      </div>
    </div>
  )
}
