
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Camera, 
  Upload, 
  Download, 
  RefreshCcw, 
  Sparkles, 
  User,
  Facebook,
  MessageCircle,
  Star as StarIcon,
  Loader2,
  Image as ImageIcon,
  Type,
  Sticker,
  Maximize,
  Sun,
  Contrast,
  RotateCw,
  X,
  Check,
  Move,
  Layout,
  Star,
  Moon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { generateSelfieBackground } from "@/ai/flows/generate-selfie-background"

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
  // Base state
  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [selectedTheme, setSelectedTheme] = useState(aiThemes[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [name, setName] = useState("")
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Editor transformations
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  // Custom Text
  const [message, setMessage] = useState("Eid Mubarak")
  const [fontSize, setFontSize] = useState(80)
  const [fontColor, setFontColor] = useState("#ffffff")
  const [fontFamily, setFontFamily] = useState("Hind Siliguri")
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom')

  // Stickers
  const [showLanterns, setShowLanterns] = useState(true)
  const [showStars, setShowStars] = useState(true)
  const [showCrescent, setShowCrescent] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
        setHasCameraPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.',
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
        const dataUri = canvas.toDataURL('image/png');
        setOriginalImage(dataUri);
        setAiGeneratedImage(null);
        stopCamera();
        toast({ title: "Photo Captured", description: "Your selfie is ready for editing." });
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
        setZoom(1)
        setRotation(0)
        setPosX(0)
        setPosY(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateAiBackground = async () => {
    if (!originalImage) {
      toast({ title: "Photo required", description: "Please upload or capture a selfie first.", variant: "destructive" })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateSelfieBackground({
        photoDataUri: originalImage,
        theme: selectedTheme.id as any
      })
      setAiGeneratedImage(result.generatedImageUrl)
      toast({ title: "Poster Generated!", description: "Your AI Eid scene is ready." })
    } catch (error) {
      toast({ title: "Generation failed", description: "Could not generate background. Please try again.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const drawLantern = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y)
    ctx.stroke()

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - 20, y)
    ctx.lineTo(x + 20, y)
    ctx.lineTo(x + 15, y + 35)
    ctx.lineTo(x - 15, y + 35)
    ctx.closePath()
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(x - 15, y + 35)
    ctx.lineTo(x + 15, y + 35)
    ctx.lineTo(x, y + 55)
    ctx.closePath()
    ctx.fill()
    
    ctx.fillStyle = "#ffffff30"
    ctx.fillRect(x - 5, y + 5, 10, 20)
    ctx.restore()
  }

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.save()
    ctx.fillStyle = color
    ctx.translate(x, y)
    for (let i = 0; i < 2; i++) {
      ctx.rotate(Math.PI / 4)
      ctx.fillRect(-size / 2, -size / 2, size, size)
    }
    ctx.restore()
  }

  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const res = 1080
    canvas.width = res
    canvas.height = res

    // 1. Base Layer
    ctx.fillStyle = "#fffbeb"
    ctx.fillRect(0, 0, res, res)

    const currentDisplayImage = aiGeneratedImage || originalImage;

    const drawFrame = () => {
      ctx.save()
      
      // Frame Body (Navy/Primary color with cutout)
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.rect(0, 0, res, res)

      // Arch Cutout path
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

      // Arch Border (Gold)
      ctx.strokeStyle = selectedFrame.secondary
      ctx.lineWidth = 15
      ctx.beginPath()
      ctx.moveTo(archX, res)
      ctx.lineTo(archX, curveHeight)
      ctx.bezierCurveTo(archX, archPeakY, res/2 - 50, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 50, archPeakY, res - archX, archPeakY, res - archX, curveHeight)
      ctx.lineTo(res - archX, res)
      ctx.stroke()

      // Corner Ornaments
      ctx.fillStyle = selectedFrame.secondary
      const cornerSize = 120
      // Top Left
      ctx.fillRect(0, 0, cornerSize, 10)
      ctx.fillRect(0, 0, 10, cornerSize)
      // Top Right
      ctx.fillRect(res - cornerSize, 0, cornerSize, 10)
      ctx.fillRect(res - 10, 0, 10, cornerSize)

      // Stickers
      if (showLanterns) {
        drawLantern(ctx, 180, 250, selectedFrame.secondary)
        drawLantern(ctx, res - 180, 250, selectedFrame.secondary)
      }
      if (showStars) {
        ctx.globalAlpha = 0.6
        drawStar(ctx, 80, 80, 30, selectedFrame.secondary)
        drawStar(ctx, res - 80, 80, 30, selectedFrame.secondary)
        drawStar(ctx, res / 2, 70, 40, selectedFrame.secondary)
        ctx.globalAlpha = 1.0
      }
      if (showCrescent) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.beginPath()
        ctx.arc(res / 2 + 80, res - 450, 45, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = selectedFrame.primary
        ctx.beginPath()
        ctx.arc(res / 2 + 110, res - 450, 45, 0, Math.PI * 2)
        ctx.fill()
      }

      // Mosque Silhouette at Bottom
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.moveTo(0, res)
      ctx.lineTo(0, res - 120)
      // Minarets
      ctx.lineTo(80, res - 120)
      ctx.lineTo(80, res - 300)
      ctx.lineTo(100, res - 300)
      ctx.lineTo(100, res - 120)
      // Domes
      ctx.quadraticCurveTo(res / 2, res - 400, res - 100, res - 120)
      ctx.lineTo(res - 100, res - 300)
      ctx.lineTo(res - 80, res - 300)
      ctx.lineTo(res - 80, res - 120)
      ctx.lineTo(res, res - 120)
      ctx.lineTo(res, res)
      ctx.closePath()
      ctx.fill()

      // Text Overlay
      let textY = res - 120
      if (textPosition === 'top') textY = 320
      if (textPosition === 'center') textY = res / 2

      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(0,0,0,0.4)"
      ctx.fillStyle = fontColor
      ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(message, res / 2, textY)

      if (name) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.font = `bold ${fontSize * 0.6}px "${fontFamily}", sans-serif`
        ctx.fillText(`— From ${name}`, res / 2, textY + (fontSize * 0.8))
      }

      // Watermark
      ctx.shadowBlur = 0
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
        // Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
        
        // Transformations
        ctx.translate(res / 2 + posX, res / 2 + posY)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(zoom, zoom)
        
        const size = Math.min(img.width, img.height)
        const offsetX = (img.width - size) / 2
        const offsetY = (img.height - size) / 2
        
        ctx.drawImage(img, offsetX, offsetY, size, size, -res/2, -res/2, res, res)
        ctx.restore()
        
        drawFrame()
      }
    } else {
      drawFrame()
    }
  }, [
    originalImage, aiGeneratedImage, selectedFrame, name, textPosition, 
    zoom, rotation, posX, posY, brightness, contrast,
    message, fontSize, fontColor, fontFamily,
    showLanterns, showStars, showCrescent
  ])

  useEffect(() => {
    renderPoster()
  }, [renderPoster])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas || (!originalImage && !aiGeneratedImage)) {
      toast({ title: "Photo required", description: "Please upload or capture a selfie first.", variant: "destructive" })
      return
    }
    const link = document.createElement('a')
    link.download = `EidSpark-Poster-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast({ title: "Poster Saved!", description: "High resolution image downloaded." })
  }

  const handleReset = () => {
    setOriginalImage(null)
    setAiGeneratedImage(null)
    setName("")
    setMessage("Eid Mubarak")
    setZoom(1)
    setRotation(0)
    setPosX(0)
    setPosY(0)
    setBrightness(100)
    setContrast(100)
    toast({ title: "Design Reset" })
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Design Studio</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">AI Selfie Poster</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-16 bg-primary/5 rounded-none border-b">
                  <TabsTrigger value="image" className="rounded-none"><Camera className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="adjust" className="rounded-none"><Maximize className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="text" className="rounded-none"><Type className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="stickers" className="rounded-none"><Sticker className="w-4 h-4" /></TabsTrigger>
                </TabsList>

                <CardContent className="p-8 space-y-8">
                  {/* TAB: IMAGE & AI */}
                  <TabsContent value="image" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Selfie Source</Label>
                      
                      {showCamera ? (
                        <div className="space-y-4 animate-in fade-in">
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-primary/20">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={capturePhoto} className="flex-1 emerald-gradient font-black">Capture Now</Button>
                            <Button variant="outline" onClick={stopCamera} className="w-12 h-10 rounded-xl"><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <Button onClick={startCamera} variant="outline" className="h-24 rounded-2xl flex-col gap-2 border-2 border-dashed border-primary/20">
                            <Camera className="w-6 h-6 text-primary" />
                            <span className="text-xs font-bold">Use Camera</span>
                          </Button>
                          <label htmlFor="selfie-upload" className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 text-xs font-bold gap-2 text-muted-foreground">
                            {originalImage ? (
                                <img src={originalImage} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                              ) : (
                                <><Upload className="w-6 h-6 text-primary" /><span>Gallery</span></>
                              )}
                          </label>
                          <input type="file" accept="image/*" className="hidden" id="selfie-upload" onChange={handleImageUpload} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-primary/10">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">AI Backdrop</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {aiThemes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all",
                              selectedTheme.id === theme.id ? "border-primary bg-primary/5" : "border-primary/5"
                            )}
                          >
                            <p className="text-[10px] font-black uppercase text-primary">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                      <Button 
                        onClick={handleGenerateAiBackground} 
                        disabled={!originalImage || isGenerating}
                        className="w-full emerald-gradient rounded-xl font-black h-12"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate AI Scene
                      </Button>
                    </div>
                  </TabsContent>

                  {/* TAB: ADJUSTMENTS */}
                  <TabsContent value="adjust" className="space-y-8 mt-0">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><Label className="text-xs font-bold uppercase">Zoom & Position</Label><span className="text-xs font-mono">{zoom.toFixed(1)}x</span></div>
                      <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={3} step={0.1} />
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold">Offset X</Label>
                           <Slider value={[posX]} onValueChange={([v]) => setPosX(v)} min={-500} max={500} step={10} />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold">Offset Y</Label>
                           <Slider value={[posY]} onValueChange={([v]) => setPosY(v)} min={-500} max={500} step={10} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="flex justify-between items-center"><Label className="text-xs font-bold uppercase">Filters</Label></div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-[10px] font-black">Brightness</span><span className="text-[10px]">{brightness}%</span></div>
                          <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={50} max={150} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-[10px] font-black">Contrast</span><span className="text-[10px]">{contrast}%</span></div>
                          <Slider value={[contrast]} onValueChange={([v]) => setContrast(v)} min={50} max={150} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <Label className="text-xs font-bold uppercase">Rotation</Label>
                      <Slider value={[rotation]} onValueChange={([v]) => setRotation(v)} min={-180} max={180} />
                    </div>
                  </TabsContent>

                  {/* TAB: TEXT */}
                  <TabsContent value="text" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Main Message</Label>
                        <Input value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Your Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Abdullah" className="rounded-xl" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-primary/10">
                      <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase">Size</Label>
                        <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={40} max={160} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase">Color</Label>
                        <div className="flex gap-2">
                          {["#ffffff", "#fbbf24", "#064e3b", "#ef4444"].map(c => (
                            <button key={c} onClick={() => setFontColor(c)} className={cn("w-7 h-7 rounded-full border border-black/10", fontColor === c && "ring-2 ring-primary")} style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase">Placement</Label>
                      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                        {['top', 'center', 'bottom'].map(pos => (
                          <Button key={pos} variant={textPosition === pos ? "default" : "ghost"} className="flex-1 h-10 rounded-lg text-[10px] font-black uppercase" onClick={() => setTextPosition(pos as any)}>{pos}</Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB: STICKERS */}
                  <TabsContent value="stickers" className="space-y-8 mt-0">
                    <div className="space-y-4">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Poster Frames</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {frames.map((frame) => (
                          <button
                            key={frame.id}
                            onClick={() => setSelectedFrame(frame)}
                            className={cn(
                              "h-14 rounded-xl border-2 px-5 flex items-center justify-between transition-all",
                              selectedFrame.id === frame.id ? "border-primary bg-primary/5" : "border-primary/5"
                            )}
                          >
                            <span className="text-xs font-black uppercase text-primary">{frame.name}</span>
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: frame.primary }}></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Decorations</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <Button variant={showLanterns ? "default" : "outline"} className="h-12 rounded-xl justify-between px-5 font-bold" onClick={() => setShowLanterns(!showLanterns)}>
                          <span>Hanging Lanterns</span>
                          {showLanterns && <Check className="w-4 h-4" />}
                        </Button>
                        <Button variant={showStars ? "default" : "outline"} className="h-12 rounded-xl justify-between px-5 font-bold" onClick={() => setShowStars(!showStars)}>
                          <span>Magic Stars</span>
                          {showStars && <Check className="w-4 h-4" />}
                        </Button>
                        <Button variant={showCrescent ? "default" : "outline"} className="h-12 rounded-xl justify-between px-5 font-bold" onClick={() => setShowCrescent(!showCrescent)}>
                          <span>Crescent Moon</span>
                          {showCrescent && <Check className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              {!(originalImage || aiGeneratedImage) && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <Camera className="w-16 h-16 text-primary/20 animate-float" />
                  <p className="font-black text-primary/40 uppercase tracking-widest text-sm">Snap or Upload a Selfie to Begin Designing</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-10 w-full max-w-xl">
              <Button onClick={handleDownload} disabled={!(originalImage || aiGeneratedImage)} className="flex-1 h-16 rounded-2xl emerald-gradient text-white font-black text-xl shadow-xl hover:scale-[1.02] transition-transform">
                <Download className="w-6 h-6 mr-3" /> Save Poster
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-16 h-16 rounded-2xl border-2 border-primary/10 text-primary">
                <RefreshCcw className="w-6 h-6" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-xl">
              <Button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')} disabled={!(originalImage || aiGeneratedImage)} variant="outline" className="h-14 rounded-2xl border-2 border-blue-100 text-blue-600 font-bold">
                <Facebook className="w-5 h-5 mr-2" /> Facebook
              </Button>
              <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Check out my AI Eid Poster!')}`, '_blank')} disabled={!(originalImage || aiGeneratedImage)} variant="outline" className="h-14 rounded-2xl border-2 border-green-100 text-green-600 font-bold">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
