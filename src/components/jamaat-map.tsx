
"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Navigation, Clock, CheckCircle2, Globe, Info, AlertTriangle, Landmark, Heart, ExternalLink } from "lucide-react"
import { collection, query, where, onSnapshot, getDocs, addDoc } from "firebase/firestore"
import { useFirestore, useUser } from "@/firebase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const getMosqueIcon = (isApproved: boolean, name: string, isSelected: boolean) => {
  const isBigGround = /ground|maidan|stadium|field|eidgah/i.test(name);
  const bgColor = isBigGround ? "#3b82f6" : (isApproved ? "#065f46" : "#eab308");
  const borderColor = isSelected ? "#fbbf24" : "white";
  const size = isSelected ? 54 : 44;

  const iconUrl = "https://img.icons8.com/ios-filled/50/ffffff/mosque.png";

  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper ${isSelected ? 'is-selected' : ''}" style="width: ${size}px; height: ${size}px">
        <div class="mosque-marker-glow" style="background: ${bgColor}66"></div>
        <div class="mosque-marker-icon" style="background: ${bgColor}; border: ${isSelected ? '4px' : '2px'} solid ${borderColor}; width: ${size-4}px; height: ${size-4}px">
          <img src="${iconUrl}" style="width: ${isSelected ? '28px' : '22px'}; height: ${isSelected ? '28px' : '22px'};" alt="mosque" />
        </div>
      </div>
    `,
    className: "custom-mosque-marker",
    iconSize: [size, size],
    iconAnchor: [size/2, size],
  });
};

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

function ChangeView({ center, zoom, selectedId }: { center: [number, number] | null; zoom: number, selectedId: string | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 1 })
    }
  }, [center, zoom, map])
  return null
}

export default function JamaatMap({ 
  mosques, 
  onSelectMosque, 
  userLocation,
  selectedId
}: { 
  mosques: any[], 
  onSelectMosque: (id: string) => void,
  userLocation?: [number, number] | null,
  selectedId: string | null
}) {
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [zoom, setZoom] = useState(7)
  const [ClusterGroup, setClusterGroup] = useState<any>(null)

  useEffect(() => {
    if (selectedId) {
      const selected = mosques.find(m => m.id === selectedId)
      if (selected) {
        setCenter([selected.latitude, selected.longitude])
        setZoom(16)
      }
    } else if (userLocation) {
      setCenter(userLocation)
      setZoom(14)
    }
  }, [selectedId, userLocation, mosques])

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-leaflet-cluster").then((mod) => {
        setClusterGroup(() => mod.default);
      }).catch(err => console.warn(err));
    }
  }, []);

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    return (
      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-amber-500" />
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-primary">Map Configuration Error</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.</p>
        </div>
      </div>
    )
  }

  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  return (
    <div className="w-full h-full relative">
      <MapContainer center={[23.6850, 90.3563]} zoom={7} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer attribution='© Mapbox' url={tileUrl} tileSize={512} zoomOffset={-1} />
        <ChangeView center={center} zoom={zoom} selectedId={selectedId} />

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup className="custom-popup-minimal"><div className="p-2 font-black text-blue-600 text-[8px] uppercase tracking-widest">You are here</div></Popup>
          </Marker>
        )}

        {ClusterGroup ? (
          <ClusterGroup chunkedLoading maxClusterRadius={50} showCoverageOnHover={false}>
            {mosques.map((mosque) => (
              <Marker
                key={mosque.id}
                position={[mosque.latitude, mosque.longitude]}
                icon={getMosqueIcon(mosque.isApprovedByAdmin, mosque.name, selectedId === mosque.id)}
                eventHandlers={{ click: () => onSelectMosque(mosque.id) }}
              >
                <Popup className="custom-popup-mosque">
                  <MosquePopupContent mosque={mosque} />
                </Popup>
              </Marker>
            ))}
          </ClusterGroup>
        ) : (
          mosques.map((mosque) => (
            <Marker
              key={mosque.id}
              position={[mosque.latitude, mosque.longitude]}
              icon={getMosqueIcon(mosque.isApprovedByAdmin, mosque.name, selectedId === mosque.id)}
              eventHandlers={{ click: () => onSelectMosque(mosque.id) }}
            >
              <Popup className="custom-popup-mosque">
                <MosquePopupContent mosque={mosque} />
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      <style jsx global>{`
        .mosque-marker-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .mosque-marker-wrapper.is-selected {
          z-index: 1000 !important;
        }
        .mosque-marker-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: marker-glow-pulse 2s infinite ease-out;
        }
        .mosque-marker-icon {
          position: relative;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.25);
          z-index: 2;
        }
        @keyframes marker-glow-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        .custom-popup-mosque .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .custom-popup-mosque .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }
      `}</style>
    </div>
  )
}

function MosquePopupContent({ mosque }: { mosque: any }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [times, setTimes] = useState<any[]>([])
  const isBigGround = /ground|maidan|stadium|field|eidgah/i.test(mosque.name)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, "mosques", mosque.id, "jamaatTimes"), where("isApprovedByAdmin", "==", true))
    return onSnapshot(q, (snap) => setTimes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [db, mosque.id])

  const handleSave = async () => {
    if (!user || !db) {
      toast({ title: "Login Required" })
      return
    }
    try {
      const q = query(collection(db, "users", user.uid, "savedMosques"), where("mosqueId", "==", mosque.id))
      const snap = await getDocs(q)
      if (!snap.empty) {
        toast({ title: "Already Saved" })
        return
      }
      await addDoc(collection(db, "users", user.uid, "savedMosques"), {
        mosqueId: mosque.id,
        name: mosque.name,
        address: mosque.area || mosque.district,
        lat: mosque.latitude,
        lon: mosque.longitude,
        savedAt: new Date().toISOString()
      })
      toast({ title: "Added to Favorites" })
    } catch (e) {}
  }

  return (
    <div className="bg-white dark:bg-slate-900">
      <div className={cn(
        "p-5 text-white space-y-2 relative overflow-hidden",
        isBigGround ? "bg-blue-600" : (mosque.isApprovedByAdmin ? "emerald-gradient" : "bg-amber-500")
      )}>
        <Landmark className="absolute -right-4 -top-4 w-20 h-20 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            {mosque.isApprovedByAdmin ? (
              <Badge className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Verified</Badge>
            ) : (
              <Badge className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Pending</Badge>
            )}
          </div>
          <h3 className="font-black text-lg m-0 leading-tight tracking-tight">{mosque.name}</h3>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {mosque.area || mosque.district}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-2">
            <Clock className="w-3.5 h-3.5 text-primary opacity-40" />
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Eid Prayer Time</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <span className="text-xl font-black text-primary">{mosque.eid_prayer_time || "Registry Pending"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 text-[10px] border-2" onClick={handleSave}>
            <Heart className="w-3 h-3 mr-1.5" /> Save
          </Button>
          <Button className="rounded-xl font-black h-10 text-[10px] emerald-gradient" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")}>
            <Navigation className="w-3 h-3 mr-1.5" /> Navigate
          </Button>
        </div>
      </div>
    </div>
  )
}
