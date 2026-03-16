"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  Upload, 
  Download, 
  RefreshCcw, 
  Sparkles, 
  Loader2,
  Maximize,
  X,
  Check,
  Save,
  AlertCircle,
  Type,
  ImageIcon,
  Share2,
  Facebook,
  MessageCircle,
  Instagram,
  ChevronRight,
  Move
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { generateSelfieBackground } from "@/ai/flows/generate-selfie-background"
import { generateEidCaption } from "@/ai/flows/generate-eid-caption"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { BackButton } from "@/components/back-button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const frames = [
  { id: 'royal', name: 'Royal Gold Arch', primary: '#0f172a', secondary: '#fbbf24', accent: '#f59e0b' },
  { id: 'night', name: 'Deep Emerald', primary: '#064e3b', secondary: '#d97706', accent: '#fcd34d' },
  { id: 'golden', name: 'Desert Glow', primary: '#78350f', secondary: '#fbbf24', accent: '#fef3c7' },
  { id: 'minimal', name: 'Midnight Blue', primary: '#1e1b4b', secondary: '#a5b4fc', accent: '#ffffff' },
]

const aiThemes = [
  { id: 'grand_mosque_night', name: 'Grand Mosque', description: 'Royal night view' },
  { id: 'lantern_festival', name: 'Lantern Street', description: 'Decorated glowing street' },
  { id: 'golden_crescent', name: 'Crescent Moon', description: 'Cinematic celestial sky' },
  { id: 'islamic_palace', name: 'Royal Palace', description: 'Geometric architecture' },
  { id: 'eid_fireworks', name: 'Eid Fireworks', description: 'Celebration skyline' },
  { id: 'kaaba_night', name: 'Holy Night', description: 'Spiritual atmosphere' },
  { id: 'bangladesh_village', name: 'Rural Morning', description: 'Traditional Eid village' },
]

const stickers = [
  { id: 'crescent', icon: '🌙', name: 'Moon' },
  { id: 'mosque', icon: '🕌', name: 'Mosque' },
  { id: 'lantern', icon: '✨', name: 'Lantern' },
  { id: 'star', icon: '⭐', name: 'Star' },
  { id: 'blessing', icon: '🤲', name: 'Blessing' },
]

interface StickerInstance { id: string; type: string; icon: string; x: number; y: number; size: number; }

export default function SelfiePosterStudio() {
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [selectedFrame, setSelectedFrame] = useState(frames[0]); const [selectedTheme, setSelectedTheme] = useState(aiThemes[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null); const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false); const [isCaptioning, setIsCaptioning] = useState(false); const [isSaving, setIsSaving] = useState(false)
  const [lastAiRequestTime, setLastAiRequestTime] = useState<number>(0); const [showCamera, setShowCamera] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); const videoRef = useRef<HTMLVideoElement>(null)
  const [zoom, setZoom] = useState(1); const [rotation, setRotation] = useState(0); const [posX, setPosX] = useState(0); const [posY, setPosY] = useState(0)
  const [message, setMessage] = useState("Eid Mubarak"); const [senderName, setSenderName] = useState(user?.displayName || "")
  const [fontSize, setFontSize] = useState(80); const [fontColor, setFontColor] = useState("#ffffff"); const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom')
  const [activeStickers, setActiveStickers] = useState<StickerInstance[]>([]); const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); setHasCameraPermission(true); if (videoRef.current) { videoRef.current.srcObject = stream; setShowCamera(true) } } catch (err) { setHasCameraPermission(false); toast({ variant: 'destructive', title: 'Camera Access Denied' }) }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const v = videoRef.current; const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; const ctx = c.getContext('2d')
      if (ctx) { ctx.drawImage(v, 0, 0); setOriginalImage(c.toDataURL('image/png')); setAiGeneratedImage(null); if (v.srcObject) (v.srcObject as MediaStream).getTracks().forEach(t => t.stop()); setShowCamera(false) }
    }
  };

  const handleGenerateAiBackground = async () => {
    if (!originalImage) { toast({ title: "No Photo" }); return }
    const now = Date.now(); if (now - lastAiRequestTime < 5000) { toast({ title: "Please wait" }); return }
    setIsGenerating(true); setLastAiRequestTime(now)
    try {
      const result = await generateSelfieBackground({ photoDataUri: originalImage, theme: selectedTheme.id as any })
      setAiGeneratedImage(result.generatedImageUrl); toast({ title: "Poster Perfected!" })
    } catch (error) {
      const fallbackId = 'fallback-crescent-moon'; const fallback = PlaceHolderImages.find(img => img.id === fallbackId);
      if (fallback) { setAiGeneratedImage(fallback.imageUrl); toast({ title: "AI Studio Busy", description: "Applied festive backdrop." }) }
    } finally { setIsGenerating(false) }
  }

  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return
    const res = 1080; canvas.width = res; canvas.height = res; const currentDisplayImage = aiGeneratedImage || originalImage
    ctx.fillStyle = selectedFrame.primary; ctx.fillRect(0, 0, res, res)
    if (currentDisplayImage) {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = currentDisplayImage
      img.onload = () => { ctx.save(); ctx.translate(res / 2 + posX, res / 2 + posY); ctx.rotate((rotation * Math.PI) / 180); ctx.scale(zoom, zoom); ctx.drawImage(img, -res/2, -res/2, res, res); ctx.restore(); finishDrawing(ctx, res) }
    } else { finishDrawing(ctx, res) }
  }, [originalImage, aiGeneratedImage, selectedFrame, senderName, textPosition, zoom, rotation, posX, posY, activeStickers, message, fontSize, fontColor])

  const finishDrawing = (ctx: CanvasRenderingContext2D, res: number) => {
    ctx.strokeStyle = selectedFrame.secondary; ctx.lineWidth = 20; ctx.strokeRect(40, 40, res-80, res-80)
    ctx.fillStyle = fontColor; ctx.font = `bold ${fontSize}px Inter`; ctx.textAlign = "center"
    ctx.fillText(message, res / 2, res - 100)
  }

  useEffect(() => { renderPoster() }, [renderPoster])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-[1600px] mx-auto px-4 py-8 grid lg:grid-cols-12 gap-10 flex-grow">
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8">
              <Tabs defaultValue="image">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-primary/5 rounded-xl">
                  <TabsTrigger value="image"><Camera className="w-4 h-4 mr-2" /> Photo</TabsTrigger>
                  <TabsTrigger value="theme"><Sparkles className="w-4 h-4 mr-2" /> Style</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="space-y-6">
                  {!showCamera ? <Button onClick={startCamera} className="w-full h-14 rounded-xl emerald-gradient">Take Photo</Button> : <Button onClick={capturePhoto} className="w-full h-14 rounded-xl gold-gradient">Capture</Button>}
                  <label className="block w-full border-2 border-dashed p-10 text-center rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { setOriginalImage(r.result as string); setAiGeneratedImage(null) }; r.readAsDataURL(f) } }} />
                  </label>
                </TabsContent>
                <TabsContent value="theme" className="space-y-6">
                  <div className="grid grid-cols-1 gap-2">
                    {aiThemes.map(t => <button key={t.id} onClick={() => setSelectedTheme(t)} className={cn("p-4 rounded-xl border text-left transition-all", selectedTheme.id === t.id ? "border-primary bg-primary/5" : "border-slate-100")}>{t.name}</button>)}
                  </div>
                  <Button onClick={handleGenerateAiBackground} disabled={isGenerating || !originalImage} className="w-full h-14 rounded-xl emerald-gradient font-black">{isGenerating ? <Loader2 className="animate-spin" /> : "Apply AI Background"}</Button>
                </TabsContent>
              </Tabs>
            </Card>
          </aside>

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border-[12px] border-white">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              {isGenerating && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center text-white"><Loader2 className="animate-spin w-10 h-10" /></div>}
            </div>
          </div>

          <aside className="lg:col-span-3">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8 space-y-6">
              <Button onClick={() => { if (canvasRef.current) { const link = document.createElement('a'); link.download = 'eid-poster.png'; link.href = canvasRef.current.toDataURL(); link.click() } }} disabled={!originalImage} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black shadow-xl">Download HD</Button>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
