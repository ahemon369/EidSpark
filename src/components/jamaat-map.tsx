
"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, CheckCircle2, ShieldCheck, ExternalLink, Globe, Info, AlertTriangle, Landmark } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { cn } from "@/lib/utils"

const MAPBOX_TOKEN = "pk.eyJ1IjoiYW1yYW5lbW9uIiwiYSI6ImNtN200bmc4dTBmMGIyanE1YnVzaTB3NXIifQ.2Gu9mCgIeRo9EqRt2viYhg";

/**
 * Generates a dynamic Leaflet DivIcon based on mosque properties.
 * Green: Verified
 * Yellow: Community Added (Pending)
 * Blue: Big Eid Ground / Maidan
 */
const getMosqueIcon = (isApproved: boolean, name: string) => {
  const isBigGround = /ground|maidan|stadium|field|eidgah|stadium/i.test(name);
  
  const bgColor = isBigGround ? "#3b82f6" : (isApproved ? "#065f46" : "#eab308");
  const glowColor = isBigGround ? "rgba(59, 130, 246, 0.4)" : (isApproved ? "rgba(6, 95, 70, 0.4)" : "rgba(234, 179, 8, 0.4)");
  const borderColor = isApproved ? "#E9BE24" : "#ffffff";

  const iconSvg = isBigGround 
    ? `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L15 8H9L12 2Z" />
         <path d="M12 8C8 8 5 11 5 15V22H19V15C19 11 16 8 12 8Z" />
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L10.5 4.5H13.5L12 2Z" />
         <path d="M12 4.5C8.686 4.5 6 7.186 6 10.5V13H18V10.5C18 7.186 15.314 4.5 12 4.5Z" />
         <path d="M4 12V22H5.5V12H4ZM18.5 12V22H20V12H18.5ZM6.5 14V22H17.5V14H6.5Z" />
         <path d="M12 1C12 1 12.5 2 12 2.5C11.5 2 12 1 12 1Z" />
       </svg>`;

  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper">
        <div class="mosque-marker-glow" style="background: ${glowColor}"></div>
        <div class="mosque-marker-icon" style="background: ${bgColor}; border-color: ${borderColor}">
          ${iconSvg}
        </div>
      </div>
    `,
    className: "custom-mosque-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

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
  const [center, setCenter] = useState<[number, number]>([23.6850, 90.3563]) // Center of Bangladesh
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
          attribution='© Mapbox © OpenStreetMap'
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
            icon={getMosqueIcon(mosque.isApprovedByAdmin, mosque.name)}
            eventHandlers={{
              click: () => onSelectMosque(mosque.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -40]} opacity={1}>
              <span className="font-black text-xs text-primary">{mosque.name}</span>
            </Tooltip>
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
          box-shadow: 0 12px 24px rgba(0,0,0,0.4);
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

        .leaflet-tooltip {
          background: white;
          border: 2px solid #065f46;
          border-radius: 12px;
          padding: 6px 12px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          font-family: 'Hind Siliguri', sans-serif;
        }
      `}</style>
    </div>
  )
}

function MosquePopupContent({ mosque }: { mosque: any }) {
  const db = useFirestore()
  const [times, setTimes] = useState<any[]>([])
  const isBigGround = /ground|maidan|stadium|field|eidgah|stadium/i.test(mosque.name);

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

  const displayTimes = [...times];
  if (mosque.eid_prayer_time && !displayTimes.find(t => t.time === mosque.eid_prayer_time)) {
    displayTimes.unshift({ id: 'primary', time: mosque.eid_prayer_time, communitySubmissionCount: 1 });
  }

  return (
    <div className="bg-white">
      <div className={cn(
        "p-6 text-white space-y-2 relative overflow-hidden",
        isBigGround ? "bg-blue-600" : (mosque.isApprovedByAdmin ? "emerald-gradient" : "bg-amber-500")
      )}>
        {isBigGround ? <Landmark className="absolute -right-4 -top-4 w-24 h-24 opacity-10" /> : <Landmark className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            {mosque.isApprovedByAdmin ? (
              <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-secondary fill-secondary" />
                <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
              </div>
            ) : (
              <div className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-white" />
                <span className="text-[8px] font-black uppercase tracking-widest">Pending</span>
              </div>
            )}
            {isBigGround && (
              <div className="bg-blue-400/30 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                <Landmark className="w-3 h-3 text-white" />
                <span className="text-[8px] font-black uppercase tracking-widest">Large Ground</span>
              </div>
            )}
          </div>
          <h3 className="font-black text-xl m-0 leading-tight tracking-tight">
            {mosque.name}
          </h3>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
            <MapPin className="w-3 h-3" /> {mosque.area || mosque.district}, {mosque.district}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
            <Clock className="w-4 h-4 text-primary opacity-40" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Eid Jamaat Schedule</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {displayTimes.length > 0 ? (
              displayTimes.map((t) => (
                <div key={t.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-sm font-black text-slate-800">{t.time}</span>
                  {t.communitySubmissionCount > 1 && <span className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5">✔ Community Confirmed</span>}
                </div>
              ))
            ) : (
              <p className="col-span-2 text-[10px] font-bold text-muted-foreground italic text-center py-4 bg-slate-50 rounded-2xl">Awaiting update...</p>
            )}
          </div>
        </div>

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
