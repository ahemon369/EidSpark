"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Navigation, Clock, CheckCircle2, Globe, Info, AlertTriangle, Landmark } from "lucide-react"
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
  const borderColor = "#E9BE24";

  // Using the white version of the mosque icon for better visibility on dark backgrounds
  const iconUrl = "https://img.icons8.com/ios-filled/50/ffffff/mosque.png";

  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper">
        <div class="mosque-marker-glow" style="background: ${bgColor}66"></div>
        <div class="mosque-marker-icon" style="background: ${bgColor}; border: 2px solid ${borderColor}">
          <img src="${iconUrl}" style="width: 24px; height: 24px;" alt="mosque" />
        </div>
      </div>
    `,
    className: "custom-mosque-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
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
  const [ClusterGroup, setClusterGroup] = useState<any>(null)

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation)
      setZoom(15)
    }
  }, [userLocation])

  // Load react-leaflet-cluster dynamically to avoid Module Factory errors in Turbopack
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-leaflet-cluster").then((mod) => {
        setClusterGroup(() => mod.default);
      });
    }
  }, []);

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  const markers = mosques.map((mosque) => (
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
  ));

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
          box-shadow: 0 10px 20px rgba(0,0,0,0.25);
          transition: all 0.3s ease;
          z-index: 2;
        }

        .mosque-marker-wrapper:hover .mosque-marker-icon {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
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
        <Landmark className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
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
                  {t.communitySubmissionCount > 1 && <span className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5">✔ Confirmed</span>}
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
