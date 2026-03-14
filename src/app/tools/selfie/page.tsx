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
  RefreshCcw, 
  Sparkles, 
  User,
  PanelTop,
  AlignCenter,
  PanelBottom,
  Facebook,
  MessageCircle,
  Star as StarIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const frames = [
  { id: 'classic-navy', name: 'Classic Navy & Gold', primary: '#0f172a', secondary: '#fbbf24', accent: '#f59e0b' },
  { id: 'royal-emerald', name: 'Royal Emerald', primary: '#064e3b', secondary: '#d97706', accent: '#fcd34d' },
  { id: 'deep-maroon', name: 'Traditional Maroon', primary: '#4c0519', secondary: '#fbbf24', accent: '#fecdd3' },
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
    ctx.lineWidth = 3
    // Hanging cord
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, y)
    ctx.stroke()

    // Lantern body
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - 20, y)
    ctx.lineTo(x + 20, y)
    ctx.lineTo(x + 15, y + 35)
    ctx.lineTo(x - 15, y + 35)
    ctx.closePath()
    ctx.fill()
    
    // Lantern cap
    ctx.beginPath()
    ctx.moveTo(x - 15, y + 35)
    ctx.lineTo(x + 15, y + 35)
    ctx.lineTo(x, y + 55)
    ctx.closePath()
    ctx.fill()
    
    // Shine
    ctx.fillStyle = "#ffffff30"
    ctx.fillRect(x - 5, y + 5, 10, 20)
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
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const res = 1080
    canvas.width = res
    canvas.height = res

    // 1. Base Cream Background
    ctx.fillStyle = "#fffbeb" // Light cream
    ctx.fillRect(0, 0, res, res)

    const drawFrameContent = () => {
      // 3. Draw Islamic Arch Overlay
      ctx.save()
      
      // Outer Frame Mask (Navy Blue)
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(res, 0)
      ctx.lineTo(res, res)
      ctx.lineTo(0, res)
      ctx.closePath()

      // The Arch Hole (Subtracting from the mask)
      const archWidth = 880
      const archX = (res - archWidth) / 2
      const archBaseY = res
      const archPeakY = 150
      const curveStartY = 500

      ctx.moveTo(archX, archBaseY)
      ctx.lineTo(archX, curveStartY) // Straight vertical side
      // Islamic Pointed Arch Path (Ogee-style curves)
      ctx.bezierCurveTo(archX, 250, res/2 - 50, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 50, archPeakY, res - archX, 250, res - archX, curveStartY)
      ctx.lineTo(res - archX, archBaseY)
      ctx.closePath()
      ctx.fill('evenodd')

      // 4. Gold Arch Border
      ctx.strokeStyle = selectedFrame.secondary
      ctx.lineWidth = 15
      ctx.beginPath()
      ctx.moveTo(archX, archBaseY)
      ctx.lineTo(archX, curveStartY)
      ctx.bezierCurveTo(archX, 250, res/2 - 50, archPeakY, res/2, archPeakY)
      ctx.bezierCurveTo(res/2 + 50, archPeakY, res - archX, 250, res - archX, curveStartY)
      ctx.lineTo(res - archX, archBaseY)
      ctx.stroke()

      // 5. Corner Ornaments (Geometric stars)
      ctx.globalAlpha = 0.5
      drawStar(ctx, 60, 60, 40, selectedFrame.secondary)
      drawStar(ctx, res - 60, 60, 40, selectedFrame.secondary)
      ctx.globalAlpha = 1.0

      // 6. Hanging Lanterns from the arch peak area
      drawLantern(ctx, 200, 200, selectedFrame.secondary)
      drawLantern(ctx, res - 200, 200, selectedFrame.secondary)
      
      // 7. Center Star at Top
      drawStar(ctx, res / 2, 80, 50, selectedFrame.secondary)

      // 8. Mosque Silhouette at bottom (Foreground layer)
      ctx.fillStyle = selectedFrame.primary
      ctx.beginPath()
      ctx.moveTo(0, res)
      ctx.lineTo(0, res - 140)
      // Left Minaret
      ctx.lineTo(60, res - 140)
      ctx.lineTo(60, res - 280)
      ctx.lineTo(85, res - 280)
      ctx.lineTo(85, res - 140)
      // Small Dome Left
      ctx.quadraticCurveTo(180, res - 240, 280, res - 140)
      // Main Center Dome
      ctx.quadraticCurveTo(res / 2, res - 400, res - 280, res - 140)
      // Small Dome Right
      ctx.quadraticCurveTo(res - 180, res - 240, res - 85, res - 140)
      // Right Minaret
      ctx.lineTo(res - 85, res - 280)
      ctx.lineTo(res - 60, res - 280)
      ctx.lineTo(res - 60, res - 140)
      ctx.lineTo(res, res - 140)
      ctx.lineTo(res, res)
      ctx.closePath()
      ctx.fill()

      // 9. Crescent Moon in the sky area
      ctx.fillStyle = selectedFrame.secondary
      ctx.beginPath()
      ctx.arc(res / 2 + 70, res - 420, 40, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = selectedFrame.primary // Cutting out the crescent
      ctx.beginPath()
      ctx.arc(res / 2 + 95, res - 420, 40, 0, Math.PI * 2)
      ctx.fill()

      // 10. Text Overlays (Eid Mubarak & Name)
      let textY = res - 100
      if (textPosition === 'top') textY = 350
      if (textPosition === 'center') textY = res / 2

      ctx.shadowBlur = 15
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 110px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Eid Mubarak", res / 2, textY)

      if (name) {
        ctx.fillStyle = selectedFrame.secondary
        ctx.font = "600 65px Inter, sans-serif"
        ctx.fillText(name, res / 2, textY + 85)
      }

      // 11. Subtle Watermark
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255,255,255,0.4)"
      ctx.font = "bold 24px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText("Made with EidSpark", res - 60, res - 40)

      ctx.restore()
    }

    if (image) {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.src = image
      img.onload = () => {
        // Draw user image scaled and centered
        const size = Math.min(img.width, img.height)
        const offsetX = (img.width - size) / 2
        const offsetY = (img.height - size) / 2
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, res, res)
        drawFrameContent()
      }
    } else {
      drawFrameContent()
    }
  }

  useEffect(() => {
    generateImage()
  }, [image, selectedFrame, name, textPosition])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) {
      toast({ title: "Photo required", description: "Please upload a selfie first.", variant: "destructive" })
      return
    }
    const link = document.createElement('a')
    link.download = `EidSpark-Selfie-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast({ title: "Card Downloaded!", description: "Share the joy with your community." })
  }

  const shareSocial = (platform: 'facebook' | 'whatsapp') => {
    const url = window.location.href
    const text = "Celebrate Eid with my custom EidSpark Selfie card!"
    let shareUrl = ""
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    } else {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    }
    window.open(shareUrl, '_blank')
  }

  const handleReset = () => {
    setImage(null)
    setName("")
    toast({ title: "Reset complete", description: "Ready for another selfie." })
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Camera className="w-4 h-4" />
            <span>Islamic Arch Card Frame</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Eid Selfie Frame</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Redesign your festive selfies into a beautiful mosque-inspired greeting card with our architectural arch frames.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
              <CardHeader className="p-8 pb-4 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-secondary" />
                  Customize Frame
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">1. Your Selfie</Label>
                  <div className="relative group">
                    <input type="file" accept="image/*" className="hidden" id="selfie-upload" onChange={handleImageUpload} />
                    <label 
                      htmlFor="selfie-upload"
                      className="flex flex-col items-center justify-center h-44 border-4 border-dashed border-primary/10 rounded-[2.5rem] cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all bg-white/50"
                    >
                      <Upload className="w-10 h-10 text-primary mb-3" />
                      <span className="font-black text-primary uppercase text-xs tracking-widest">Upload Photo</span>
                    </label>
                  </div>
                </div>

                {/* Recipient/User Name */}
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-sm font-black text-muted-foreground uppercase tracking-widest">2. Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="name"
                      placeholder="e.g. Abdullah Khan"
                      className="h-14 pl-12 rounded-2xl border-2 border-primary/10 focus:border-primary/30 text-lg font-bold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Frame Style Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">3. Card Style</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {frames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame)}
                        className={cn(
                          "relative h-16 rounded-2xl border-2 transition-all overflow-hidden p-4 text-left flex items-center justify-between",
                          selectedFrame.id === frame.id ? "border-primary shadow-lg scale-[1.02] bg-white" : "border-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: frame.primary }}></div>
                          <span className="text-sm font-black uppercase tracking-tighter">{frame.name}</span>
                        </div>
                        {selectedFrame.id === frame.id && <StarIcon className="w-4 h-4 text-secondary fill-secondary" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Positioning */}
                <div className="space-y-4">
                   <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">4. Message Position</Label>
                   <div className="flex gap-2">
                      {[
                        { id: 'top', icon: PanelTop },
                        { id: 'center', icon: AlignCenter },
                        { id: 'bottom', icon: PanelBottom }
                      ].map(pos => (
                        <Button
                          key={pos.id}
                          variant={textPosition === pos.id ? "default" : "outline"}
                          className={cn("flex-1 h-12 rounded-xl font-bold", textPosition === pos.id ? "emerald-gradient text-white border-none" : "border-primary/10")}
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
              <Button onClick={() => shareSocial('facebook')} disabled={!image} className="h-14 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl transition-transform">
                <Facebook className="w-5 h-5 mr-2" /> Facebook
              </Button>
              <Button onClick={() => shareSocial('whatsapp')} disabled={!image} className="h-14 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 shadow-xl transition-transform">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7 flex flex-col items-center animate-in fade-in slide-in-from-right duration-700">
            <div className="relative w-full aspect-square max-w-2xl bg-white rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white group">
              <canvas ref={canvasRef} className="w-full h-full object-cover transition-all duration-500" />
              {!image && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center space-y-6 pointer-events-none">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                    <Camera className="w-12 h-12 text-primary/20" />
                  </div>
                  <h3 className="text-2xl font-black text-primary/40 uppercase tracking-widest leading-tight">Upload your selfie <br />to see the frame</h3>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8 w-full max-w-2xl">
              <Button onClick={handleDownload} disabled={!image} className="flex-1 h-16 rounded-2xl emerald-gradient text-white font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                <Download className="w-6 h-6 mr-3" /> Download Eid Card
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-16 h-16 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary/5">
                <RefreshCcw className="w-6 h-6" />
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-muted-foreground font-medium bg-white/50 px-8 py-4 rounded-full border border-white shadow-sm">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
              <p className="text-sm uppercase tracking-[0.2em] font-black">High Definition Card Export Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
