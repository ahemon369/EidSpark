"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { 
  Camera, 
  Upload, 
  Download, 
  Share2, 
  RefreshCcw, 
  Sparkles, 
  Moon, 
  Star,
  User,
  Layout,
  PanelTop,
  AlignCenter,
  PanelBottom
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const frames = [
  { id: 'frame-1', name: 'Golden Crescent', color: '#fbbf24', secondaryColor: '#b45309', textColor: 'text-amber-100', bg: 'bg-amber-500/10' },
  { id: 'frame-2', name: 'Emerald Mosque', color: '#10b981', secondaryColor: '#065f46', textColor: 'text-emerald-100', bg: 'bg-emerald-500/10' },
  { id: 'frame-3', name: 'Royal Lantern', color: '#a855f7', secondaryColor: '#6b21a8', textColor: 'text-purple-100', bg: 'bg-purple-500/10' },
  { id: 'frame-4', name: 'Ruby Tradition', color: '#f43f5e', secondaryColor: '#9f1239', textColor: 'text-rose-100', bg: 'bg-rose-500/10' },
]

export default function SelfieFrameGenerator() {
  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [name, setName] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = image

    img.onload = () => {
      // Setup High Res Canvas
      const resolution = 1080
      canvas.width = resolution
      canvas.height = resolution

      // Draw Main Image (Clipped to Square)
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, resolution, resolution)

      // Apply Frame
      ctx.lineWidth = 40
      const gradient = ctx.createLinearGradient(0, 0, resolution, resolution)
      gradient.addColorStop(0, selectedFrame.color)
      gradient.addColorStop(1, selectedFrame.secondaryColor)
      
      ctx.strokeStyle = gradient
      ctx.strokeRect(20, 20, resolution - 40, resolution - 40)

      // Overlay Text Background (Gradients)
      let textY = 0
      let bgY = 0
      let bgHeight = 220

      if (textPosition === 'top') {
        bgY = 0
        textY = 120
      } else if (textPosition === 'center') {
        bgY = resolution / 2 - bgHeight / 2
        textY = resolution / 2 + 10
      } else {
        bgY = resolution - bgHeight
        textY = resolution - 100
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, bgY, resolution, bgHeight)

      // Draw Text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 80px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText("Eid Mubarak", resolution / 2, textY)

      if (name) {
        ctx.fillStyle = selectedFrame.color
        ctx.font = '500 50px Inter, sans-serif'
        ctx.fillText(name, resolution / 2, textY + 65)
      }

      // Watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.font = 'bold 24px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText("Made with EidSpark", resolution - 60, resolution - 60)
    }
  }

  useEffect(() => {
    if (image) {
      generateImage()
    }
  }, [image, selectedFrame, name, textPosition])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `EidSpark-Selfie-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    toast({
      title: "Success!",
      description: "Your Eid Selfie has been downloaded in High Definition.",
    })
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      const file = new File([blob], 'eid-selfie.png', { type: 'image/png' })
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Eid Selfie',
            text: 'Check out my Eid selfie frame from EidSpark!',
          })
        } catch (err) {
          console.error('Error sharing:', err)
        }
      } else {
        handleDownload()
      }
    }, 'image/png')
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 islamic-pattern">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest border border-secondary/20">
            <Camera className="w-3 h-3" />
            <span>Celebrate in Style</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Eid Selfie Frame</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Personalize your Eid moments with our exclusive themed frames and share the joy with the world.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="p-8 pb-4 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  Customize Frame
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">1. Upload Photo</Label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="selfie-upload" 
                      onChange={handleImageUpload} 
                    />
                    <label 
                      htmlFor="selfie-upload"
                      className="flex flex-col items-center justify-center h-48 border-4 border-dashed border-primary/10 rounded-[2rem] cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group-active:scale-95 bg-white/50"
                    >
                      <div className="p-4 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="mt-4 font-bold text-primary">Drag & Drop or Click to Upload</span>
                      <span className="text-xs text-muted-foreground">Supports JPG, PNG</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="name" className="text-sm font-black text-muted-foreground uppercase tracking-widest">2. Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="name"
                      placeholder="e.g. Farhan Ahmed"
                      className="h-14 pl-12 rounded-2xl border-2 border-primary/10 focus:border-primary/30 text-lg font-medium bg-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">3. Select Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {frames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame)}
                        className={cn(
                          "relative h-24 rounded-2xl border-2 transition-all overflow-hidden text-left p-4 group",
                          selectedFrame.id === frame.id 
                            ? "border-primary shadow-lg scale-105 bg-white" 
                            : "border-primary/5 hover:border-primary/20 bg-white/50"
                        )}
                      >
                        <div className={cn("absolute inset-0 opacity-10", frame.bg)}></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <span className={cn("text-xs font-black uppercase tracking-tighter", frame.textColor.replace('100', '700'))}>
                            {frame.name}
                          </span>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                             <div className="h-full bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${frame.color}, ${frame.secondaryColor})`, width: '100%' }}></div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">4. Text Position</Label>
                   <div className="flex gap-2">
                      {[
                        { id: 'top', icon: PanelTop },
                        { id: 'center', icon: AlignCenter },
                        { id: 'bottom', icon: PanelBottom }
                      ].map(pos => (
                        <Button
                          key={pos.id}
                          variant={textPosition === pos.id ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-12 rounded-xl transition-all",
                            textPosition === pos.id ? "emerald-gradient text-white" : "border-primary/10"
                          )}
                          onClick={() => setTextPosition(pos.id as any)}
                        >
                          <pos.icon className="w-5 h-5 mr-2" />
                          {pos.id.charAt(0).toUpperCase() + pos.id.slice(1)}
                        </Button>
                      ))}
                   </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                onClick={handleShare}
                disabled={!image}
                className="flex-1 h-16 rounded-2xl gold-gradient text-primary font-black text-lg shadow-xl hover:scale-105 transition-transform"
              >
                <Share2 className="w-6 h-6 mr-2" />
                Share Photo
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setName("");
                  toast({ description: "Reset successfully." })
                }}
                className="w-16 h-16 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary/5"
              >
                <RefreshCcw className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center animate-in fade-in slide-in-from-right duration-700">
            <div className="relative w-full aspect-square max-w-2xl bg-white/50 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-8 border-white group">
              {!image ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                    <Camera className="w-12 h-12 text-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-primary/40 uppercase tracking-widest">Preview Appears Here</h3>
                    <p className="text-muted-foreground font-medium">Upload your selfie to start creating the magic.</p>
                  </div>
                </div>
              ) : (
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                  style={{ imageRendering: 'auto' }}
                />
              )}

              {/* Decorative elements only visible in UI, not on canvas */}
              <div className="absolute top-6 left-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <Moon className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute bottom-6 right-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <Star className="w-12 h-12 text-secondary fill-secondary" />
              </div>
              <div className="absolute top-6 right-6 pointer-events-none text-primary/20 font-black text-xs uppercase tracking-[0.3em]">
                HD Render
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
               <div className="flex items-center gap-4 bg-white/50 p-6 rounded-[2rem] border border-white">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                   <Download className="w-6 h-6" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-black text-primary uppercase tracking-wider">High Definition</p>
                   <p className="text-xs text-muted-foreground font-medium">Optimized for Facebook & Insta</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 bg-white/50 p-6 rounded-[2rem] border border-white">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                   <Layout className="w-6 h-6" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm font-black text-primary uppercase tracking-wider">Smart Overlays</p>
                   <p className="text-xs text-muted-foreground font-medium">Dynamic text & frame blending</p>
                 </div>
               </div>
            </div>

            <Button 
                onClick={handleDownload} 
                disabled={!image}
                size="lg"
                className="mt-8 emerald-gradient text-white h-16 px-12 rounded-2xl text-lg font-black shadow-2xl hover:scale-105 transition-transform"
            >
                <Download className="w-6 h-6 mr-3" />
                Download Final HD Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
