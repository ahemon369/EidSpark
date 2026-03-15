
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
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

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

interface StickerInstance {
  id: string;
  type: string;
  icon: string;
  x: number;
  y: number;
  size: number;
}

export default function SelfiePosterStudio() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [selectedTheme, setSelectedTheme] = useState(aiThemes[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCaptioning, setIsCaptioning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [showCamera, setShowCamera] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Transform States
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  
  // Text States
  const [message, setMessage] = useState("Eid Mubarak")
  const [senderName, setSenderName] = useState(user?.displayName || "")
  const [fontSize, setFontSize] = useState(80)
  const [fontColor, setFontColor] = useState("#ffffff")
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom')

  // Sticker State
  const [activeStickers, setActiveStickers] = useState<StickerInstance[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = (maxDim / w) * h; w = maxDim; } else { w = (maxDim / h) * w; h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        setOriginalImage(canvas.toDataURL('image/png'));
        setAiGeneratedImage(null);
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string)
        setAiGeneratedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateAiBackground = async () => {
    if (!originalImage) {
      toast({ title: "No Image Found", description: "Take a photo first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true)
    try {
      const result = await generateSelfieBackground({
        photoDataUri: originalImage,
        theme: selectedTheme.id as any
      })
      setAiGeneratedImage(result.generatedImageUrl)
      toast({ title: "Poster Perfected!", description: "AI background successfully updated." })
    } catch (error: any) {
      toast({ title: "Background generation failed", description: error.message, variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCaption = async () => {
    setIsCaptioning(true)
    try {
      const result = await generateEidCaption({ tone: 'joyful', language: 'english' })
      setMessage(result.caption)
      toast({ title: "✨ New Caption Ready" })
    } catch (error) {
      toast({ title: "Caption failed", variant: "destructive" })
    } finally {
      setIsCaptioning(false)
    }
  }

  const addSticker = (s: typeof stickers[0]) => {
    const newSticker: StickerInstance = {
      id: Math.random().toString(36).substr(2, 9),
      type: s.id,
      icon: s.icon,
      x: 540,
      y: 540,
      size: 150
    }
    setActiveStickers([...activeStickers, newSticker])
  }

  const handleSaveToGallery = () => {
    if (!user || !db || !canvasRef.current) {
      toast({ title: "Login Required" });
      return
    }
    setIsSaving(true)
    const imageUrl = canvasRef.current.toDataURL('image/png')
    const posterData = {
      userId: user.uid,
      imageUrl,
      themeId: selectedTheme.id,
      frameId: selectedFrame.id,
      createdAt: new Date().toISOString()
    }

    addDoc(collection(db, "users", user.uid, "selfiePosters"), posterData)
      .then(() => {
        toast({ title: "Saved to Gallery" })
        setIsSaving(false)
      })
      .catch(async (error) => {
        setIsSaving(false)
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/selfiePosters`,
          operation: 'create',
          requestResourceData: posterData
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const res = 1080
    canvas.width = res
    canvas.height = res

    const currentDisplayImage = aiGeneratedImage || originalImage;

    const drawElements = () => {
      // 1. Draw Arched Frame Content Area
      ctx.save()
      ctx.fillStyle = selectedFrame.primary
      ctx.fillRect(0, 0, res, res)

      const archWidth = 920
      const archX = (res - archWidth) / 2
      const archPeakY = 100
      const curveHeight = 450

      ctx.beginPath()
      ctx.moveTo(archX, res)
      ctx.lineTo(archX, curveHeight)
      ctx.bezierCurveTo(archX, archPeakY, res/2 - 100, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 100, archPeakY, res - archX, archPeakY, res - archX, curveHeight)
      ctx.lineTo(res - archX, res)
      ctx.closePath()
      ctx.clip()

      // 2. Draw Subject Image
      if (currentDisplayImage) {
        const img = new Image()
        img.src = currentDisplayImage
        img.onload = () => {
          ctx.save()
          ctx.translate(res / 2 + posX, res / 2 + posY)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.scale(zoom, zoom)
          ctx.drawImage(img, -res/2, -res/2, res, res)
          ctx.restore()
          
          finishDrawing()
        }
      } else {
        finishDrawing()
      }
      ctx.restore()
    }

    const finishDrawing = () => {
      // 3. Draw Arch Border
      ctx.save()
      const archWidth = 920
      const archX = (res - archWidth) / 2
      const archPeakY = 100
      const curveHeight = 450

      ctx.beginPath()
      ctx.moveTo(archX, res)
      ctx.lineTo(archX, curveHeight)
      ctx.bezierCurveTo(archX, archPeakY, res/2 - 100, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 100, archPeakY, res - archX, archPeakY, res - archX, curveHeight)
      ctx.lineTo(res - archX, res)
      ctx.strokeStyle = selectedFrame.secondary
      ctx.lineWidth = 20
      ctx.stroke()
      ctx.restore()

      // 4. Draw Stickers
      activeStickers.forEach(s => {
        ctx.save()
        ctx.font = `${s.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(s.icon, s.x, s.y)
        ctx.restore()
      })

      // 5. Draw Text
      let textY = res - 140
      if (textPosition === 'top') textY = 320
      if (textPosition === 'center') textY = res / 2

      ctx.save()
      ctx.fillStyle = fontColor
      ctx.font = `bold ${fontSize}px "Hind Siliguri", sans-serif`
      ctx.textAlign = "center"
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.shadowBlur = 10
      ctx.fillText(message, res / 2, textY)

      if (senderName) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.font = `bold ${fontSize * 0.6}px "Hind Siliguri", sans-serif`
        ctx.fillText(`— From ${senderName}`, res / 2, textY + (fontSize * 0.9))
      }
      ctx.restore()

      // 6. Watermark
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "bold 24px Inter"
      ctx.textAlign = "right"
      ctx.fillText("Created with EidSpark Studio 🌙", res - 60, res - 40)
    }

    drawElements()
  }, [
    originalImage, aiGeneratedImage, selectedFrame, senderName, textPosition, 
    zoom, rotation, posX, posY, activeStickers,
    message, fontSize, fontColor
  ])

  useEffect(() => {
    renderPoster()
  }, [renderPoster])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 py-8 grid lg:grid-cols-12 gap-10">
        
        {/* Left Toolbar: Studio Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl border border-white/20 h-full flex flex-col">
            <CardHeader className="p-8 border-b bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    Poster Studio
                  </CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professional Edition v2.0</CardDescription>
                </div>
                <div className="bg-secondary/20 p-2 rounded-xl">
                  <Maximize className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardHeader>

            <Tabs defaultValue="image" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-4 h-16 bg-white border-b rounded-none p-0">
                <TabsTrigger value="image" className="rounded-none data-[state=active]:bg-primary/5"><Camera className="w-5 h-5" /></TabsTrigger>
                <TabsTrigger value="text" className="rounded-none data-[state=active]:bg-primary/5"><Type className="w-5 h-5" /></TabsTrigger>
                <TabsTrigger value="stickers" className="rounded-none data-[state=active]:bg-primary/5"><ImageIcon className="w-5 h-5" /></TabsTrigger>
                <TabsTrigger value="theme" className="rounded-none data-[state=active]:bg-primary/5"><Sparkles className="w-5 h-5" /></TabsTrigger>
              </TabsList>

              <div className="p-8 overflow-y-auto max-h-[600px] custom-scrollbar flex-grow">
                {/* Image & Adjustment Tab */}
                <TabsContent value="image" className="space-y-8 mt-0">
                  <div className={cn("space-y-4", !showCamera && "hidden")}>
                    <div className="relative rounded-[2rem] overflow-hidden border-4 border-primary/10 aspect-video bg-black">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                    </div>
                    {hasCameraPermission === false && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                          Please allow camera access to use this feature.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-3">
                      <Button onClick={capturePhoto} className="flex-1 h-14 rounded-xl emerald-gradient font-black">Capture Selfie</Button>
                      <Button variant="outline" onClick={stopCamera} className="h-14 w-14 rounded-xl border-2"><X className="w-5 h-5" /></Button>
                    </div>
                  </div>

                  {!showCamera && (
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={startCamera} variant="outline" className="h-32 rounded-3xl flex-col gap-3 border-2 border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><Camera className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Studio</span>
                      </Button>
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/10 rounded-3xl cursor-pointer hover:bg-primary/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Upload className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest mt-3">Upload HD</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  )}

                  <div className="space-y-6 pt-6 border-t">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest">Zoom Factor</Label><span className="text-xs font-mono">{(zoom * 100).toFixed(0)}%</span></div>
                      <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={3} step={0.1} className="py-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase tracking-widest">Offset X</Label><Slider value={[posX]} onValueChange={([v]) => setPosX(v)} min={-500} max={500} /></div>
                      <div className="space-y-4"><Label className="text-[10px] font-black uppercase tracking-widest">Offset Y</Label><Slider value={[posY]} onValueChange={([v]) => setPosY(v)} min={-500} max={500} /></div>
                    </div>
                  </div>
                </TabsContent>

                {/* Text Controls Tab */}
                <TabsContent value="text" className="space-y-8 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Main Greeting</Label>
                      <Button variant="ghost" size="sm" onClick={handleGenerateCaption} disabled={isCaptioning} className="h-8 text-[10px] font-black text-secondary hover:bg-secondary/10 px-3 rounded-full">
                        {isCaptioning ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Sparkles className="w-3 h-3 mr-2" />}
                        Magic Caption
                      </Button>
                    </div>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message..." className="h-14 rounded-xl bg-slate-50 border-none px-5" />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest">From Name</Label>
                    <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your Name" className="h-14 rounded-xl bg-slate-50 border-none px-5" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Font Color</Label>
                      <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest">Size</Label>
                      <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={40} max={150} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Placement</Label>
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                      {['top', 'center', 'bottom'].map(p => (
                        <Button key={p} variant={textPosition === p ? "default" : "ghost"} onClick={() => setTextPosition(p as any)} className="flex-1 capitalize rounded-lg h-10 text-[10px] font-bold">{p}</Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Stickers Tab */}
                <TabsContent value="stickers" className="space-y-6 mt-0">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Tap to Add Decoration</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {stickers.map(s => (
                      <button key={s.id} onClick={() => addSticker(s)} className="h-24 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-transparent hover:border-primary/20 transition-all hover:scale-105 active:scale-95 group">
                        <span className="text-4xl group-hover:animate-bounce">{s.icon}</span>
                        <span className="text-[8px] font-black uppercase mt-2 text-muted-foreground">{s.name}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={() => setActiveStickers([])} className="w-full text-[10px] font-black uppercase text-muted-foreground mt-4"><X className="w-3 h-3 mr-2" /> Clear All Stickers</Button>
                </TabsContent>

                {/* AI Theme Tab */}
                <TabsContent value="theme" className="space-y-8 mt-0">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest">AI Backdrop Style</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {aiThemes.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => setSelectedTheme(t)}
                          className={cn(
                            "p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group",
                            selectedTheme.id === t.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-100 hover:border-primary/20"
                          )}
                        >
                          <div>
                            <p className={cn("font-black text-sm", selectedTheme.id === t.id ? "text-primary" : "text-slate-700")}>{t.name}</p>
                            <p className="text-[10px] font-medium text-muted-foreground">{t.description}</p>
                          </div>
                          <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", selectedTheme.id === t.id ? "text-primary" : "text-slate-300")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleGenerateAiBackground} 
                    disabled={isGenerating || !originalImage} 
                    className="w-full h-16 emerald-gradient text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    {isGenerating ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="w-5 h-5 mr-3" />}
                    Build AI Environment
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </aside>

        {/* Center: Interactive Canvas Studio */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-[600px] bg-white rounded-[3.5rem] overflow-hidden shadow-[0_64px_128px_-12px_rgba(0,0,0,0.3)] border-[12px] border-white group">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-12 animate-in fade-in duration-500">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-secondary rounded-full blur-[60px] opacity-50 animate-pulse"></div>
                  <Loader2 className="w-20 h-10 animate-spin text-secondary relative z-10" />
                </div>
                <h3 className="text-3xl font-black mb-3">✨ Creating your Eid poster...</h3>
                <p className="text-white/60 font-medium max-w-xs leading-relaxed">Our AI is meticulously crafting your high-resolution festive environment.</p>
              </div>
            )}

            {!(originalImage || aiGeneratedImage) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-12 text-center">
                <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-dashed border-primary/10">
                  <Camera className="w-12 h-12 text-primary/30 animate-pulse" />
                </div>
                <h4 className="text-2xl font-black text-primary/40 tracking-tight uppercase">Studio Ready</h4>
                <p className="text-xs text-muted-foreground mt-3 font-medium max-w-[200px]">Upload a photo to begin your professional transformation.</p>
              </div>
            )}

            <div className="absolute top-6 left-6 z-10">
               <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-primary/10 shadow-xl flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Preview</span>
               </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4 w-full max-w-[600px]">
             <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
               <Move className="w-3 h-3" /> Adjust position in sidebar
             </div>
             <div className="ml-auto flex gap-2">
                {frames.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setSelectedFrame(f)}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 shadow-sm",
                      selectedFrame.id === f.id ? "border-primary ring-4 ring-primary/10" : "border-white"
                    )}
                    style={{ backgroundColor: f.primary }}
                  />
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel: Export & Distribution */}
        <aside className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl border border-white/20 h-full">
            <CardHeader className="p-8 border-b bg-secondary/5">
              <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                <Download className="w-5 h-5 text-secondary" />
                Final Output
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest mt-1">Export high resolution</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    if (!canvasRef.current) return;
                    const link = document.createElement('a')
                    link.download = `EidSpark-Professional-Poster-${Date.now()}.png`
                    link.href = canvasRef.current.toDataURL('image/png')
                    link.click()
                    toast({ title: "HD Poster Exported" })
                  }} 
                  disabled={!(originalImage || aiGeneratedImage)} 
                  className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-lg shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
                >
                  <Download className="mr-3 w-6 h-6" /> Download HD
                </Button>
                <Button 
                  onClick={handleSaveToGallery} 
                  disabled={isSaving || !(originalImage || aiGeneratedImage)} 
                  variant="outline"
                  className="w-full h-16 rounded-2xl border-4 border-white glass-card text-primary font-black text-lg"
                >
                  {isSaving ? <Loader2 className="animate-spin w-6 h-6 mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                  Save to Profile
                </Button>
              </div>

              <div className="space-y-6 pt-10 border-t border-primary/5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> Viral Sharing
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-blue-50 text-blue-600"><Facebook className="w-6 h-6" /></Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-green-50 text-green-600"><MessageCircle className="w-6 h-6" /></Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 hover:bg-rose-50 text-rose-600"><Instagram className="w-6 h-6" /></Button>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-4 items-start">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
                <p className="text-[10px] font-bold text-primary/60 leading-relaxed">
                  Exported images are 1080x1080 pixels (High Definition) and optimized for Instagram, Facebook, and high-quality printing.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
