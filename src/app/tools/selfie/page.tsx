
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, Loader2, Camera, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { generateSelfieBackground } from "@/ai/flows/generate-selfie-background"
import { useUser, useFirestore } from "@/firebase"
import { BackButton } from "@/components/back-button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const frames = [
  { id: 'royal', name: 'Royal Gold Arch', primary: '#0f172a', secondary: '#fbbf24' },
  { id: 'night', name: 'Deep Emerald', primary: '#064e3b', secondary: '#d97706' },
]

const aiThemes = [
  { id: 'grand_mosque_night', name: 'Grand Mosque' },
  { id: 'lantern_festival', name: 'Lantern Street' },
  { id: 'golden_crescent', name: 'Crescent Moon' },
  { id: 'islamic_palace', name: 'Royal Palace' },
  { id: 'eid_fireworks', name: 'Eid Fireworks' },
  { id: 'kaaba_night', name: 'Holy Night' },
  { id: 'bangladesh_village', name: 'Rural Morning' },
]

export default function SelfieStudioPage() {
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [selectedFrame, setSelectedFrame] = useState(frames[0]); const [selectedTheme, setSelectedTheme] = useState(aiThemes[0])
  const [originalImage, setOriginalImage] = useState<string | null>(null); const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastAiRequestTime, setLastAiRequestTime] = useState<number>(0)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Proper Cleanup for Camera Tracks
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  const startCamera = async () => {
    try { 
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); 
      if (videoRef.current) { 
        videoRef.current.srcObject = stream; 
        setShowCamera(true) 
      } 
    } catch (err) { toast({ variant: 'destructive', title: 'Camera Access Denied' }) }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const v = videoRef.current; 
      const c = document.createElement('canvas'); 
      c.width = v.videoWidth; 
      c.height = v.videoHeight; 
      const ctx = c.getContext('2d')
      if (ctx) { 
        ctx.drawImage(v, 0, 0); 
        setOriginalImage(c.toDataURL('image/png')); 
        setAiGeneratedImage(null); 
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup on unmount
  }, [stopCamera]);

  const handleGenerateAiBackground = async () => {
    if (!originalImage) { toast({ title: "No Photo" }); return }
    const now = Date.now(); 
    if (now - lastAiRequestTime < 5000) { 
      toast({ title: "AI generation temporarily busy. Please try again in a moment." }); 
      return 
    }
    setIsGenerating(true); 
    setLastAiRequestTime(now)
    try {
      const result = await generateSelfieBackground({ photoDataUri: originalImage, theme: selectedTheme.id as any })
      setAiGeneratedImage(result.generatedImageUrl); toast({ title: "Poster Perfected!" })
    } catch (error) {
      const fallbacks = ['fallback-crescent-moon', 'fallback-eid-mosque', 'fallback-night-lantern', 'fallback-fireworks-sky', 'fallback-islamic-pattern'];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      const fallback = PlaceHolderImages.find(img => img.id === randomFallback);
      if (fallback) { setAiGeneratedImage(fallback.imageUrl); toast({ title: "Applied Festive Backdrop" }) }
    } finally { setIsGenerating(false) }
  }

  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return
    const res = 1080; canvas.width = res; canvas.height = res; const imgSource = aiGeneratedImage || originalImage
    ctx.fillStyle = selectedFrame.primary; ctx.fillRect(0, 0, res, res)
    if (imgSource) {
      const img = new Image(); img.crossOrigin = "anonymous"; img.src = imgSource
      img.onload = () => { ctx.drawImage(img, 0, 0, res, res); ctx.strokeStyle = selectedFrame.secondary; ctx.lineWidth = 40; ctx.strokeRect(60, 60, res-120, res-120) }
    } else {
      ctx.strokeStyle = selectedFrame.secondary; ctx.lineWidth = 40; ctx.strokeRect(60, 60, res-120, res-120)
    }
  }, [originalImage, aiGeneratedImage, selectedFrame])

  useEffect(() => { renderPoster() }, [renderPoster])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-[1600px] mx-auto px-6 py-8 grid lg:grid-cols-12 gap-10 flex-grow">
          <aside className="lg:col-span-4 space-y-6">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Selfie Studio</h1>
              <p className="text-sm text-slate-500 font-medium">Transform your selfies with festive AI magic.</p>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8">
              <Tabs defaultValue="image">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-primary/5 rounded-xl">
                  <TabsTrigger value="image"><Camera className="w-4 h-4 mr-2" /> Source</TabsTrigger>
                  <TabsTrigger value="theme"><Sparkles className="w-4 h-4 mr-2" /> Style</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="space-y-6 outline-none">
                  {!showCamera ? (
                    <Button onClick={startCamera} className="w-full h-14 rounded-xl emerald-gradient font-black">Open Camera</Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative group rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                        <video ref={videoRef} autoPlay className="w-full bg-black aspect-square object-cover" />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                          onClick={stopCamera}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button onClick={capturePhoto} className="w-full h-14 rounded-xl gold-gradient font-black">Snap Photo</Button>
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Or</span></div>
                  </div>
                  <label className="block w-full border-2 border-dashed p-10 text-center rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Upload Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { setOriginalImage(r.result as string); setAiGeneratedImage(null) }; r.readAsDataURL(f) } }} />
                  </label>
                </TabsContent>
                <TabsContent value="theme" className="space-y-6 outline-none">
                  <div className="grid grid-cols-1 gap-2">
                    {aiThemes.map(t => <button key={t.id} onClick={() => setSelectedTheme(t)} className={cn("p-4 rounded-xl border text-left font-bold transition-all", selectedTheme.id === t.id ? "border-primary bg-primary/5" : "border-slate-100")}>{t.name}</button>)}
                  </div>
                  <Button onClick={handleGenerateAiBackground} disabled={isGenerating || !originalImage} className="w-full h-14 rounded-xl emerald-gradient font-black">{isGenerating ? <Loader2 className="animate-spin" /> : "Generate AI Backdrop"}</Button>
                </TabsContent>
              </Tabs>
            </Card>
          </aside>

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square bg-white rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.1)] border-[12px] border-white group">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              {isGenerating && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white gap-4"><Loader2 className="animate-spin w-12 h-12" /><p className="font-black uppercase tracking-widest text-xs">AI Studio Working...</p></div>}
            </div>
          </div>

          <aside className="lg:col-span-3">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-8 space-y-6 h-fit">
              <Button onClick={() => { if (canvasRef.current) { const link = document.createElement('a'); link.download = 'eid-spark-poster.png'; link.href = canvasRef.current.toDataURL(); link.click() } }} disabled={!originalImage} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black shadow-xl hover:scale-105 transition-transform">Download HD</Button>
              <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">Share your joy with the world</p>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
