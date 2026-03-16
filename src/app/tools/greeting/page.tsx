
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { generateEidGreeting, type GenerateEidGreetingOutput } from "@/ai/flows/generate-eid-greeting"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { 
  Loader2, 
  Send, 
  Download, 
  Sparkles, 
  Moon, 
  Star, 
  Layout, 
  Save, 
  Facebook, 
  MessageCircle, 
  RefreshCcw, 
  Copy, 
  Type, 
  ImageIcon, 
  Trash2, 
  Move, 
  RotateCw, 
  AlignCenter,
  AlignLeft,
  AlignRight,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { BackButton } from "@/components/back-button"

// --- Types ---
type ElementType = 'text' | 'sticker' | 'image'

interface CardElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  content: string 
  style: {
    fontSize?: number
    color?: string
    fontFamily?: string
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
  }
}

const templates = [
  { id: 'moon', name: 'Crescent Moon', bg: 'bg-emerald-950', gradient: ['#064e3b', '#022c22'], textColor: '#ffffff', secondaryColor: '#fbbf24' },
  { id: 'lantern', name: 'Lantern Glow', bg: 'bg-amber-900', gradient: ['#78350f', '#451a03'], textColor: '#ffffff', secondaryColor: '#fbbf24' },
  { id: 'mosque', name: 'Mosque Silhouette', bg: 'bg-indigo-950', gradient: ['#1e1b4b', '#0f172a'], textColor: '#ffffff', secondaryColor: '#a5b4fc' },
  { id: 'gold', name: 'Golden Pattern', bg: 'bg-amber-50', gradient: ['#fffbeb', '#fef3c7'], textColor: '#451a03', secondaryColor: '#92400e' },
]

export default function GreetingStudioPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [elements, setElements] = useState<CardElement[]>([
    { id: 'title', type: 'text', x: 540, y: 200, width: 800, height: 120, rotation: 0, content: 'Eid Mubarak', style: { fontSize: 80, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' } },
    { id: 'message', type: 'text', x: 540, y: 500, width: 800, height: 400, rotation: 0, content: 'Wishing you a blessed and joyful Eid celebration full of peace and happiness.', style: { fontSize: 40, color: '#ffffff', fontFamily: 'Hind Siliguri', textAlign: 'center' } },
    { id: 'recipient', type: 'text', x: 540, y: 850, width: 800, height: 100, rotation: 0, content: 'Dear Friend', style: { fontSize: 50, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' } }
  ])
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [template, setTemplate] = useState(templates[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [aiName, setAiName] = useState("")
  const [aiLang, setAiLang] = useState("bangla")
  const [aiStyle, setAiStyle] = useState("heartfelt")

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateElement = (id: string, updates: Partial<CardElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const handleAiGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateEidGreeting({ 
        recipientName: aiName || "Friend", 
        greetingStyle: aiStyle as any, 
        language: aiLang as any 
      })
      setElements(prev => prev.map(el => {
        if (el.id === 'title') return { ...el, content: result.title }
        if (el.id === 'message') return { ...el, content: result.message }
        if (el.id === 'recipient') return { ...el, content: result.recipientLine }
        return el
      }))
      toast({ title: "AI Message Generated" })
    } catch (error) {
      toast({ title: "AI Generation Failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, el: CardElement) => {
    setSelectedId(el.id)
    setIsDragging(true)
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scale = 1080 / rect.width
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const mouseX = (clientX - rect.left) * scale
    const mouseY = (clientY - rect.top) * scale
    setDragOffset({ x: mouseX - el.x, y: mouseY - el.y })
  }

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !selectedId || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scale = 1080 / rect.width
    const mouseX = (clientX - rect.left) * scale
    const mouseY = (clientY - rect.top) * scale
    updateElement(selectedId, { x: mouseX - dragOffset.x, y: mouseY - dragOffset.y })
  }, [isDragging, selectedId, dragOffset])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault()
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onEnd = () => setIsDragging(false)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [handleMove, isDragging])

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 1080
    canvas.height = 1080
    const grad = ctx.createLinearGradient(0, 0, 0, 1080)
    grad.addColorStop(0, template.gradient[0])
    grad.addColorStop(1, template.gradient[1])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1080)
    ctx.lineWidth = 20
    ctx.strokeStyle = `${template.secondaryColor}40`
    ctx.strokeRect(30, 30, 1020, 1020)
    for (const el of elements) {
      ctx.save()
      ctx.translate(el.x, el.y)
      ctx.rotate((el.rotation * Math.PI) / 180)
      if (el.type === 'text') {
        ctx.fillStyle = el.style.color || '#ffffff'
        ctx.font = `bold ${el.style.fontSize}px "${el.style.fontFamily}", sans-serif`
        ctx.textAlign = el.style.textAlign || 'center'
        const words = el.content.split(' ')
        let line = ''; let lines = []
        const maxWidth = el.width
        for (let i = 0; i < words.length; i++) {
          let testLine = line + words[i] + ' '
          let metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) { lines.push(line); line = words[i] + ' ' } else { line = testLine }
        }
        lines.push(line)
        const lineHeight = (el.style.fontSize || 40) * 1.2
        lines.forEach((l, i) => { ctx.fillText(l.trim(), 0, i * lineHeight - (lines.length * lineHeight) / 2) })
      }
      ctx.restore()
    }
  }, [elements, template])

  useEffect(() => { renderCanvas() }, [renderCanvas])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a'); link.download = `EidSpark-Card-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click()
  }

  const handleSaveToGallery = async () => {
    if (!db || !user) { toast({ title: "Sign in required" }); return }
    setIsSaving(true)
    try {
      await addDoc(collection(db, "users", user.uid, "eidGreetings"), {
        userId: user.uid, recipientName: aiName || 'Friend', templateId: template.id, elements: elements, generationDate: new Date().toISOString()
      })
      toast({ title: "Saved to Gallery" })
    } catch (error) {} finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[70px] flex flex-col flex-grow">
        <div className="bg-white border-b py-4">
          <BackButton className="mb-0" />
        </div>
        
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
          {/* Toolbar Sidebar */}
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="space-y-2 mb-4 lg:mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Greeting Studio</h1>
              <p className="text-sm text-slate-500 font-medium">Design professional AI-powered Eid cards.</p>
            </div>

            <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl">
              <CardHeader className="p-6 border-b">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Layout className="w-5 h-5 text-secondary" />
                  Studio Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="ai" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary/5 rounded-xl h-12">
                    <TabsTrigger value="ai" className="text-xs font-bold">AI Magic</TabsTrigger>
                    <TabsTrigger value="theme" className="text-xs font-bold">Themes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ai" className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Recipient Name</Label>
                      <Input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Abdullah" className="rounded-xl h-12" />
                    </div>
                    <Button className="w-full emerald-gradient h-12 font-black rounded-xl text-xs" onClick={handleAiGenerate} disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Magic Text</>}
                    </Button>
                  </TabsContent>
                  <TabsContent value="theme" className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => setTemplate(t)} className={cn("w-full h-14 rounded-xl border-2 flex items-center justify-between px-4 transition-all", template.id === t.id ? "border-primary bg-primary/5" : "border-transparent bg-slate-100")}>
                        <span className="text-xs font-bold">{t.name}</span>
                        <div className={cn("w-5 h-5 rounded-full shadow-sm", t.bg)} />
                      </button>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </aside>

          {/* Canvas Main Area */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/50 rounded-[2rem] lg:rounded-[3rem] p-4 md:p-8 order-1 lg:order-2">
            <div 
              ref={containerRef} 
              className="relative shadow-2xl w-full max-w-[600px] aspect-square bg-white overflow-hidden rounded-2xl touch-none" 
              onMouseDown={() => setSelectedId(null)}
              onTouchStart={() => setSelectedId(null)}
            >
              <div className={cn("absolute inset-0 transition-all duration-500", template.bg)}>
                <div className="absolute inset-0 opacity-20 islamic-pattern"></div>
              </div>
              {elements.map(el => (
                <div 
                  key={el.id} 
                  onMouseDown={(e) => handleMouseDown(e, el)} 
                  onTouchStart={(e) => handleMouseDown(e, el)}
                  className="cursor-move select-none"
                  style={{ 
                    position: 'absolute', 
                    left: `${(el.x / 1080) * 100}%`, 
                    top: `${(el.y / 1080) * 100}%`, 
                    width: `${(el.width / 1080) * 100}%`, 
                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`, 
                    zIndex: selectedId === el.id ? 50 : 10, 
                    outline: selectedId === el.id ? '3px solid #fbbf24' : 'none', 
                    outlineOffset: '4px' 
                  }}
                >
                  {el.type === 'text' && (
                    <div style={{ 
                      color: el.style.color, 
                      fontSize: `${(el.style.fontSize! / 1080) * 100}cqw`, 
                      fontFamily: el.style.fontFamily, 
                      textAlign: el.style.textAlign, 
                      fontWeight: 'bold', 
                      lineHeight: 1.2 
                    }}>
                      {el.content}
                    </div>
                  )}
                </div>
              ))}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <p className="mt-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] animate-pulse">Drag elements to customize layout</p>
          </div>

          {/* Action Sidebar */}
          <aside className="lg:col-span-3 space-y-6 order-3">
            <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 md:p-8 space-y-4 md:space-y-6">
              <Button onClick={handleDownload} className="w-full h-14 md:h-16 rounded-2xl gold-gradient text-primary font-black text-lg shadow-xl active:scale-95 transition-transform">
                <Download className="w-5 h-5 mr-2" /> Download PNG
              </Button>
              <Button onClick={handleSaveToGallery} disabled={isSaving} variant="outline" className="w-full h-14 md:h-16 rounded-2xl border-4 border-white glass-card text-primary font-black text-lg active:scale-95 transition-transform">
                {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Save to Gallery</>}
              </Button>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] font-black uppercase text-muted-foreground opacity-60">
                <Sparkles className="w-3 h-3" />
                <span>Premium Quality 1080x1080</span>
              </div>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
