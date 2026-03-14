
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
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const frames = [
  { id: 'frame-1', name: 'Golden Crescent', color: 'from-amber-400 to-amber-600', textColor: 'text-amber-100', bg: 'bg-amber-500/10' },
  { id: 'frame-2', name: 'Emerald Mosque', color: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-100', bg: 'bg-emerald-500/10' },
  { id: 'frame-3', name: 'Royal Lantern', color: 'from-purple-500 to-purple-700', textColor: 'text-purple-100', bg: 'bg-purple-500/10' },
  { id: 'frame-4', name: 'Ruby Tradition', color: 'from-rose-500 to-rose-700', textColor: 'text-rose-100', bg: 'bg-rose-500/10' },
]

export default function SelfieFrameGenerator() {
  const [selectedFrame, setSelectedFrame] = useState(frames[0])
  const [name, setName] = useState("")
  const [image, setImage] = useState<string | null>(null)
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
      canvas.width = 1080
      canvas.height = 1080

      const size = Math.min(img.width, img.height)
      const x = (img.width - size) / 2
      const y = (img.height - size) / 2
      ctx.drawImage(img, x, y, size, size, 0, 0, 1080, 1080)

      ctx.lineWidth = 40
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
      if (selectedFrame.id === 'frame-1') {
        gradient.addColorStop(0, '#fbbf24')
        gradient.addColorStop(1, '#b45309')
      } else if (selectedFrame.id === 'frame-2') {
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(1, '#065f46')
      } else if (selectedFrame.id === 'frame-3') {
        gradient.addColorStop(0, '#a855f7')
        gradient.addColorStop(1, '#6b21a8')
      } else {
        gradient.addColorStop(0, '#f43f5e')
        gradient.addColorStop(1, '#9f1239')
      }
      
      ctx.strokeStyle = gradient
      ctx.strokeRect(20, 20, 1040, 1040)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, 850, 1080, 230)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 80px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText("Eid Mubarak", 540, 930)

      if (name) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = '500 50px Inter, sans-serif'
        ctx.fillText(name, 540, 990)
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = 'italic 24px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText("Made with EidSpark", 1040, 1060)
    }
  }

  useEffect(() => {
    if (image) {
      generateImage()
    }
  }, [image, selectedFrame, name])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `EidSpark-Selfie-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    toast({
      title: "Success!",
      description: "Your Eid Selfie has been downloaded.",
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
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Camera className="w-3 h-3" />
            <span>Celebrate in Style</span>
          </div>
          <h1 className="text-5xl font-black text-primary tracking-tight">Eid Selfie Frame</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Personalize your Eid moments with our exclusive themed frames.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
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
                      className="flex flex-col items-center justify-center h-48 border-4 border-dashed border-primary/10 rounded-[2rem] cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group-active:scale-95"
                    >
                      <div className="p-4 bg-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="mt-4 font-bold text-primary">Click to upload selfie</span>
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
                      placeholder="Enter your name"
                      className="h-14 pl-12 rounded-2xl border-2 border-primary/10 focus:border-primary/30 text-lg font-medium"
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
                            ? "border-primary shadow-lg scale-105" 
                            : "border-primary/5 hover:border-primary/20"
                        )}
                      >
                        <div className={cn("absolute inset-0 opacity-10", frame.bg)}></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <span className={cn("text-xs font-black uppercase tracking-tighter", frame.textColor.replace('100', '700'))}>
                            {frame.name}
                          </span>
                          <div className={cn("h-1 w-full rounded-full bg-gradient-to-r", frame.color)}></div>
                        </div>
                        {selectedFrame.id === frame.id && (
                          <div className="absolute top-2 right-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
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

          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-2xl bg-slate-50 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              {!image ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                    <Camera className="w-12 h-12 text-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-primary/40">Preview Appears Here</h3>
                    <p className="text-muted-foreground font-medium">Upload your selfie to start creating the magic.</p>
                  </div>
                </div>
              ) : (
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-cover animate-in fade-in zoom-in duration-500"
                />
              )}

              <div className="absolute top-6 left-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <Moon className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute bottom-6 right-6 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <Star className="w-12 h-12 text-secondary fill-secondary" />
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <Download className="w-5 h-5" />
                 </div>
                 <p className="text-sm font-bold text-muted-foreground">High Definition Export</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                   <Share2 className="w-5 h-5" />
                 </div>
                 <p className="text-sm font-bold text-muted-foreground">Instant Social Sharing</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
