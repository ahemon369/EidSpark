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
  PanelTop,
  AlignCenter,
  PanelBottom,
  Facebook,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const frames = [
  { id: 'navy-gold', name: 'Royal Navy & Gold', primary: '#0f172a', secondary: '#fbbf24', accent: '#f59e0b' },
  { id: 'emerald-gold', name: 'Emerald & Gold', primary: '#064e3b', secondary: '#d97706', accent: '#fcd34d' },
  { id: 'ruby-gold', name: 'Ruby & Rose Gold', primary: '#881337', secondary: '#fb7185', accent: '#ffe4e6' },
  { id: 'midnight-silver', name: 'Midnight & Silver', primary: '#1e1b4b', secondary: '#94a3b8', accent: '#f1f5f9' },
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

  const drawLantern = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y)
    ctx.stroke()

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - 15, y)
    ctx.lineTo(x + 15, y)
    ctx.lineTo(x + 10, y + 25)
    ctx.lineTo(x - 10, y + 25)
    ctx.closePath()
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(x - 10, y + 25)
    ctx.lineTo(x + 10, y + 25)
    ctx.lineTo(x, y + 40)
    ctx.closePath()
    ctx.fill()
  }

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color
    ctx.save()
    ctx.translate(x, y)
    for (let i = 0; i < 2; i++) {
      ctx.rotate(Math.PI / 4)
      ctx.fillRect(-size / 2, -size / 2, size, size)
    }
    ctx.restore()
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
      const res = 1080
      canvas.width = res
      canvas.height = res

      // 1. Draw Background Selfie
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, res, res)

      // 2. Draw Frame Overlay (Mosque Arch)
      ctx.save()
      
      // Outer Navy Blue Frame
      ctx.fillStyle = selectedFrame.primary
      ctx.globalAlpha = 0.85
      
      // Draw the arch clipping path
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(res, 0)
      ctx.lineTo(res, res)
      ctx.lineTo(0, res)
      ctx.closePath()

      // Subtract the arch shape
      ctx.moveTo(100, res)
      ctx.lineTo(100, 400)
      ctx.bezierCurveTo(100, 100, res - 100, 100, res - 100, 400)
      ctx.lineTo(res - 100, res)
      ctx.closePath()
      ctx.fill('evenodd')

      ctx.globalAlpha = 1.0

      // Gold Arch Border
      ctx.strokeStyle = selectedFrame.secondary
      ctx.lineWidth = 15
      ctx.beginPath()
      ctx.moveTo(100, res)
      ctx.lineTo(100, 400)
      ctx.bezierCurveTo(100, 100, res - 100, 100, res - 100, 400)
      ctx.lineTo(res - 100, res)
      ctx.stroke()

      // Hanging Lanterns
      drawLantern(ctx, 200, 150, selectedFrame.secondary)
      drawLantern(ctx, res - 200, 150, selectedFrame.secondary)
      
      // Center Star Ornament
      drawStar(ctx, res / 2, 80, 40, selectedFrame.secondary)

      // Mosque Silhouette at bottom
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.moveTo(0, res)
      ctx.lineTo(0, res - 120)
      ctx.quadraticCurveTo(150, res - 220, 300, res - 120) // Dome 1
      ctx.lineTo(350, res - 120)
      ctx.lineTo(350, res - 250) // Minaret
      ctx.lineTo(380, res - 250)
      ctx.lineTo(380, res - 120)
      ctx.quadraticCurveTo(res / 2, res - 350, res - 380, res - 120) // Main Dome
      ctx.lineTo(res - 350, res - 120)
      ctx.lineTo(res - 350, res - 250)
      ctx.lineTo(res - 320, res - 250)
      ctx.lineTo(res - 320, res - 120)
      ctx.quadraticCurveTo(res - 150, res - 220, res, res - 120)
      ctx.lineTo(res, res)
      ctx.closePath()
      ctx.fill()

      // Crescent Moon above mosque
      ctx.fillStyle = selectedFrame.secondary
      ctx.beginPath()
      ctx.arc(res / 2 + 50, res - 380, 40, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = selectedFrame.primary // Cut out to make crescent
      ctx.beginPath()
      ctx.arc(res / 2 + 65, res - 380, 40, 0, Math.PI * 2)
      ctx.fill()

      // Text Overlays
      let textY = res - 60
      if (textPosition === 'top') textY = 250
      if (textPosition === 'center') textY = res / 2

      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 90px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Eid Mubarak", res / 2, textY)

      if (name) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.font = "600 50px Inter, sans-serif"
        ctx.fillText(name, res / 2, textY + 70)
      }

      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.font = "20px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText("Made with EidSpark", res - 40, res - 20)

      ctx.restore()
    }
  }

  useEffect(() => {
    if (image) generateImage()
  }, [image, selectedFrame, name, textPosition])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `EidSpark-Selfie-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast({ title: "Success!", description: "Your Eid Selfie has been downloaded." })
  }

  const shareToSocial = (platform: 'facebook' | 'whatsapp') => {
    const url = window.location.href
    const text = "Create your own premium Eid Selfie frame at EidSpark!"
    let shareUrl = ""
    
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    } else {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    }
    window.open(shareUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 islamic-pattern">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest border border-secondary/20">
            <Camera className="w-3 h-3" />
            <span>Premium Frames</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Mosque Arch Selfie</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Experience the elegance of traditional architecture with our new Mosque Arch frames.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
              <CardHeader className="p-8 pb-4 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  Customize Design
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">1. Your Selfie</Label>
                  <div className="relative group">
                    <input type="file" accept="image/*" className="hidden" id="selfie-upload" onChange={handleImageUpload} />
                    <label 
                      htmlFor="selfie-upload"
                      className="flex flex-col items-center justify-center h-40 border-4 border-dashed border-primary/10 rounded-[2.5rem] cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all bg-white/50"
                    >
                      <Upload className="w-8 h-8 text-primary mb-2" />
                      <span className="font-bold text-primary">Upload Photo</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="name" className="text-sm font-black text-muted-foreground uppercase tracking-widest">2. Name on Card</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="name"
                      placeholder="e.g. Abdullah Khan"
                      className="h-14 pl-12 rounded-2xl border-2 border-primary/10 focus:border-primary/30 text-lg font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">3. Pick a Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {frames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame)}
                        className={cn(
                          "relative h-20 rounded-2xl border-2 transition-all overflow-hidden p-3 text-left",
                          selectedFrame.id === frame.id ? "border-primary shadow-lg scale-105 bg-white" : "border-primary/5 hover:border-primary/10"
                        )}
                      >
                        <div className="absolute right-2 top-2 w-4 h-4 rounded-full" style={{ backgroundColor: frame.primary }}></div>
                        <div className="relative z-10">
                          <span className="text-[10px] font-black uppercase block tracking-tighter opacity-70">Theme</span>
                          <span className="text-xs font-bold leading-none">{frame.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">4. Message Alignment</Label>
                   <div className="flex gap-2">
                      {[
                        { id: 'top', icon: PanelTop },
                        { id: 'center', icon: AlignCenter },
                        { id: 'bottom', icon: PanelBottom }
                      ].map(pos => (
                        <Button
                          key={pos.id}
                          variant={textPosition === pos.id ? "default" : "outline"}
                          className={cn("flex-1 h-12 rounded-xl", textPosition === pos.id ? "emerald-gradient text-white" : "border-primary/10")}
                          onClick={() => setTextPosition(pos.id as any)}
                        >
                          <pos.icon className="w-4 h-4 mr-2" />
                          {pos.id}
                        </Button>
                      ))}
                   </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => shareToSocial('facebook')} disabled={!image} className="h-14 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl">
                <Facebook className="w-5 h-5 mr-2" /> Facebook
              </Button>
              <Button onClick={() => shareToSocial('whatsapp')} disabled={!image} className="h-14 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 shadow-xl">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center animate-in fade-in slide-in-from-right duration-700">
            <div className="relative w-full aspect-square max-w-2xl bg-white/50 backdrop-blur-md rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white group">
              {!image ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                    <Camera className="w-12 h-12 text-primary/20" />
                  </div>
                  <h3 className="text-2xl font-black text-primary/40 uppercase tracking-widest">Upload your photo</h3>
                </div>
              ) : (
                <canvas ref={canvasRef} className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
              )}
            </div>

            <div className="flex gap-4 mt-8 w-full max-w-2xl">
              <Button onClick={handleDownload} disabled={!image} className="flex-1 h-16 rounded-2xl emerald-gradient text-white font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                <Download className="w-6 h-6 mr-3" /> Download HD Photo
              </Button>
              <Button variant="outline" onClick={() => { setImage(null); setName(""); }} className="w-16 h-16 rounded-2xl border-2 border-primary/10 text-primary">
                <RefreshCcw className="w-6 h-6" />
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-muted-foreground font-medium bg-white/50 px-6 py-3 rounded-full border border-white">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <p className="text-sm uppercase tracking-widest font-black">Premium HD Rendering Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
