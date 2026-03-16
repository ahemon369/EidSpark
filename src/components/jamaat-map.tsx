
"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Navigation, Clock, CheckCircle2, Globe, Landmark, Heart, Share2, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const getMosqueIcon = (isApproved: boolean, name: string, isSelected: boolean) => {
  const isBigGround = /ground|maidan|stadium|field|eidgah/i.test(name);
  const bgColor = isBigGround ? "#3b82f6" : (isApproved ? "#065f46" : "#eab308");
  const borderColor = isSelected ? "#fbbf24" : "white";
  const size = isSelected ? 54 : 44;

  const iconUrl = isBigGround 
    ? "https://img.icons8.com/ios-filled/50/ffffff/grass.png" 
    : "https://img.icons8.com/ios-filled/50/ffffff/mosque.png";

  return L.divIcon({
    html: `
      <div class="mosque-marker-wrapper ${isSelected ? 'is-selected' : ''}" style="width: ${size}px; height: ${size}px">
        <div class="mosque-marker-glow" style="background: ${bgColor}66"></div>
        <div class="mosque-marker-icon" style="background: ${bgColor}; border: ${isSelected ? '4px' : '2px'} solid ${borderColor}; width: ${size-4}px; height: ${size-4}px">
          <img src="${iconUrl}" style="width: ${isSelected ? '28px' : '22px'}; height: ${isSelected ? '28px' : '22px'};" alt="marker" />
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

function ChangeView({ center, zoom }: { center: [number, number] | null; zoom: number }) {
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

  const tileUrl = MAPBOX_TOKEN 
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
    : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;

  return (
    <div className="w-full h-full relative">
      <MapContainer center={[23.6850, 90.3563]} zoom={7} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer attribution='© Mapbox' url={tileUrl} tileSize={512} zoomOffset={-1} />
        <ChangeView center={center} zoom={zoom} />

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
        .mosque-marker-wrapper.is-selected { z-index: 1000 !important; }
        .mosque-marker-glow {
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 50%;
          animation: marker-glow-pulse 2s infinite ease-out;
        }
        .mosque-marker-icon {
          position: relative;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.25);
          z-index: 2;
        }
        @keyframes marker-glow-pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        .custom-popup-mosque .leaflet-popup-content-wrapper {
          border-radius: 2rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.3);
        }
        .custom-popup-mosque .leaflet-popup-content { margin: 0; width: 320px !important; }
      `}</style>
    </div>
  )
}

function MosquePopupContent({ mosque }: { mosque: any }) {
  const { toast } = useToast()
  const isBigGround = /ground|maidan|stadium|field|eidgah/i.test(mosque.name)

  const handleShare = () => {
    const text = `Check out Eid Jamaat at ${mosque.name} (${mosque.eid_prayer_time}) on EidSpark! 🌙`
    const url = window.location.href
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank')
  }

  return (
    <div className="bg-white dark:bg-slate-900 overflow-hidden">
      <div className={cn(
        "p-6 text-white relative overflow-hidden",
        isBigGround ? "bg-blue-600" : (mosque.isApprovedByAdmin ? "emerald-gradient" : "bg-amber-500")
      )}>
        <Landmark className="absolute -right-6 -top-6 w-24 h-24 opacity-10 rotate-12" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            {mosque.isApprovedByAdmin ? (
              <Badge className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Verified</Badge>
            ) : (
              <Badge className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">Pending Approval</Badge>
            )}
            {isBigGround && <Badge className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Ground</Badge>}
          </div>
          <h3 className="font-black text-xl leading-tight m-0 tracking-tight">{mosque.name}</h3>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> {mosque.area || mosque.district}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 space-y-1 group">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">Eid Prayer Time</p>
          <span className="text-3xl font-black text-primary tracking-tight">{mosque.eid_prayer_time || "Pending"}</span>
        </div>

        {mosque.description && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Globe className="w-3 h-3" /> Facilities & Info
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-3">
              "{mosque.description}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" className="rounded-xl font-bold h-12 text-xs border-2 shadow-sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button className="rounded-xl font-black h-12 text-xs emerald-gradient shadow-lg" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")}>
            <Navigation className="w-4 h-4 mr-2" /> Navigate
          </Button>
        </div>
      </div>
    </div>
  )
}
