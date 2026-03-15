
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { generateSelfieBackground } from "@/ai/flows/generate-selfie-background"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"

const frames = [
  { id: 'royal', name: 'Royal Islamic Arch', primary: '#0f172a', secondary: '#fbbf24', accent: '#f59e0b' },
  { id: 'night', name: 'Night Mosque Theme', primary: '#064e3b', secondary: '#d97706', accent: '#fcd34d' },
  { id: 'golden', name: 'Golden Eid Theme', primary: '#78350f', secondary: '#fbbf24', accent: '#fef3c7' },
  { id: 'minimal', name: 'Minimal Crescent', primary: '#1e1b4b', secondary: '#a5b4fc', accent: '#ffffff' },
]

const aiThemes = [
  { id: 'mosque_courtyard_sunset', name: 'Sunset Mosque', description: 'Courtyard at sunset' },
  { id: 'night_sky_moon_stars', name: 'Starry Night', description: 'Crescent moon & stars' },
  { id: 'lantern_eid_street', name: 'Festive Street', description: 'Decorated with lanterns' },
  { id: 'golden_geometric_patterns', name: 'Royal Gold', description: 'Geometric patterns' },
  { id: 'ramadan_night_mosque', name: 'Holy Night', description: 'Illuminated mosque' },
]

export default function SelfieFrameGenerator() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [selectedTheme, setSelectedTheme] = useState(aiThemes[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  const [message, setMessage] = useState("Eid Mubarak")
  const [fontSize, setFontSize] = useState(80)
  const [fontColor, setFontColor] = useState("#ffffff")
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom')

  const [showLanterns, setShowLanterns] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
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
    if (!originalImage) return
    setIsGenerating(true)
    try {
      const result = await generateSelfieBackground({
        photoDataUri: originalImage,
        theme: selectedTheme.id as any
      })
      setAiGeneratedImage(result.generatedImageUrl)
      toast({ title: "Backdrop Generated!" })
    } catch (error) {
      toast({ title: "Failed to generate background", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToGallery = async () => {
    if (!user || !db || !canvasRef.current) {
      toast({ title: "Login Required", description: "Please sign in to save your posters." });
      return
    }
    
    setIsSaving(true)
    try {
      const imageUrl = canvasRef.current.toDataURL('image/png')
      await addDoc(collection(db, "users", user.uid, "selfiePosters"), {
        userId: user.uid,
        imageUrl,
        themeId: selectedTheme.id,
        frameId: selectedFrame.id,
        createdAt: new Date().toISOString()
      })
      toast({ title: "Saved to Gallery", description: "View this in your Dashboard." })
    } catch (error) {
      toast({ title: "Save Failed", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
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

    const drawFrame = () => {
      ctx.save()
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.rect(0, 0, res, res)

      const archWidth = 900
      const archX = (res - archWidth) / 2
      const archPeakY = 120
      const curveHeight = 400

      ctx.moveTo(archX, res)
      ctx.lineTo(archX, curveHeight)
      ctx.bezierCurveTo(archX, archPeakY, res/2 - 50, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 50, archPeakY, res - archX, archPeakY, res - archX, curveHeight)
      ctx.lineTo(res - archX, res)
      ctx.closePath()
      ctx.fill('evenodd')

      ctx.strokeStyle = selectedFrame.secondary
      ctx.lineWidth = 15
      ctx.stroke()

      let textY = res - 120
      if (textPosition === 'top') textY = 320
      if (textPosition === 'center') textY = res / 2

      ctx.fillStyle = fontColor
      ctx.font = `bold ${fontSize}px "Hind Siliguri", sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(message, res / 2, textY)

      if (name) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.font = `bold ${fontSize * 0.6}px "Hind Siliguri", sans-serif`
        ctx.fillText(`— From ${name}`, res / 2, textY + (fontSize * 0.8))
      }

      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.font = "bold 24px Inter"
      ctx.textAlign = "right"
      ctx.fillText("Created with EidSpark 🌙", res - 60, res - 40)
      ctx.restore()
    }

    if (currentDisplayImage) {
      const img = new Image()
      img.src = currentDisplayImage
      img.onload = () => {
        ctx.save()
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
        ctx.translate(res / 2 + posX, res / 2 + posY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(zoom, zoom)
        ctx.drawImage(img, -res/2, -res/2, res, res)
        ctx.restore()
        drawFrame()
      }
    } else {
      drawFrame()
    }
  }, [
    originalImage, aiGeneratedImage, selectedFrame, name, textPosition, 
    zoom, rotation, posX, posY, brightness, contrast,
    message, fontSize, fontColor, showLanterns
  ])

  useEffect(() => {
    renderPoster()
  }, [renderPoster])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">AI Selfie Poster</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-16 bg-primary/5 rounded-none border-b">
                  <TabsTrigger value="image"><Camera className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="adjust"><Maximize className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="text"><Check className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="theme"><Sparkles className="w-4 h-4" /></TabsTrigger>
                </TabsList>
                <CardContent className="p-8 space-y-8">
                  <TabsContent value="image" className="space-y-6 mt-0">
                    {showCamera ? (
                      <div className="space-y-4">
                        <video ref={videoRef} className="w-full aspect-video rounded-2xl bg-black object-cover" autoPlay muted />
                        <div className="flex gap-2">
                          <Button onClick={capturePhoto} className="flex-1 emerald-gradient">Capture</Button>
                          <Button variant="outline" onClick={stopCamera}><X className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Button onClick={startCamera} variant="outline" className="h-24 rounded-2xl flex-col gap-2">
                          <Camera className="w-6 h-6" />
                          <span className="text-xs">Camera</span>
                        </Button>
                        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer">
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Upload</span>
                          <input type="file" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="adjust" className="space-y-6">
                    <Label className="text-xs font-black uppercase">Zoom & Position</Label>
                    <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={3} step={0.1} />
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Slider value={[posX]} onValueChange={([v]) => setPosX(v)} min={-500} max={500} />
                      <Slider value={[posY]} onValueChange={([v]) => setPosY(v)} min={-500} max={500} />
                    </div>
                  </TabsContent>
                  <TabsContent value="text" className="space-y-6">
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Main Message" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="From Name" />
                    <div className="flex gap-2">
                      {['top', 'center', 'bottom'].map(p => (
                        <Button key={p} variant={textPosition === p ? "default" : "outline"} onClick={() => setTextPosition(p as any)} className="flex-1 capitalize">{p}</Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="theme" className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                      {aiThemes.map(t => (
                        <Button key={t.id} variant={selectedTheme.id === t.id ? "default" : "outline"} onClick={() => setSelectedTheme(t)} className="h-10 text-[10px]">{t.name}</Button>
                      ))}
                    </div>
                    <Button onClick={handleGenerateAiBackground} disabled={isGenerating || !originalImage} className="w-full emerald-gradient">
                      {isGenerating ? <Loader2 className="animate-spin" /> : "Generate AI Backdrop"}
                    </Button>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              {!(originalImage || aiGeneratedImage) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-12 text-center">
                  <Camera className="w-16 h-16 text-primary/20 animate-float" />
                  <p className="font-black text-primary/40 uppercase tracking-widest mt-6">Snap or Upload a Selfie</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-10 w-full max-w-xl">
              <Button onClick={() => {
                const link = document.createElement('a')
                link.download = `EidSpark-Poster.png`
                link.href = canvasRef.current!.toDataURL('image/png')
                link.click()
              }} disabled={!(originalImage || aiGeneratedImage)} className="flex-1 h-16 rounded-2xl emerald-gradient text-white font-black text-xl shadow-xl">
                <Download className="mr-3" /> Download
              </Button>
              <Button onClick={handleSaveToGallery} disabled={isSaving || !(originalImage || aiGeneratedImage)} className="h-16 rounded-2xl border-2 px-8 flex items-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => { setOriginalImage(null); setAiGeneratedImage(null); }} className="w-16 h-16 rounded-2xl border-2"><RefreshCcw /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
