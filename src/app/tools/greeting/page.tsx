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

const fonts = [
  { name: 'Hind Siliguri', value: 'Hind Siliguri' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Playfair Display', value: 'Playfair Display' },
]

export default function CanvaGreetingGenerator() {
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

  const selectedElement = elements.find(el => el.id === selectedId)

  const updateElement = (id: string, updates: Partial<CardElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const updateStyle = (id: string, styleUpdates: Partial<CardElement['style']>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, style: { ...el.style, ...styleUpdates } } : el))
  }

  const addElement = (type: ElementType, content: string) => {
    const newEl: CardElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 540,
      y: 540,
      width: type === 'text' ? 600 : 200,
      height: type === 'text' ? 100 : 200,
      rotation: 0,
      content,
      style: type === 'text' ? { fontSize: 40, color: template.textColor, fontFamily: 'Hind Siliguri', textAlign: 'center' } : { opacity: 1 }
    }
    setElements(prev => [...prev, newEl])
    setSelectedId(newEl.id)
  }

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    setSelectedId(null)
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

  const handleMouseDown = (e: React.MouseEvent, el: CardElement) => {
    e.stopPropagation()
    setSelectedId(el.id)
    setIsDragging(true)
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scale = 1080 / rect.width
    const mouseX = (e.clientX - rect.left) * scale
    const mouseY = (e.clientY - rect.top) * scale
    setDragOffset({ x: mouseX - el.x, y: mouseY - el.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scale = 1080 / rect.width
    const mouseX = (e.clientX - rect.left) * scale
    const mouseY = (e.clientY - rect.top) * scale
    updateElement(selectedId, { x: mouseX - dragOffset.x, y: mouseY - dragOffset.y })
  }, [isDragging, selectedId, dragOffset])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

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
      } else if (el.type === 'image') {
        const img = new Image(); img.src = el.content
        ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height)
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader(); reader.onload = (event) => { addElement('image', event.target?.result as string) }; reader.readAsDataURL(file)
    }
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

  const handleReset = () => {
    setElements([
      { id: 'title', type: 'text', x: 540, y: 200, width: 800, height: 120, rotation: 0, content: 'Eid Mubarak', style: { fontSize: 80, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' } },
      { id: 'message', type: 'text', x: 540, y: 500, width: 800, height: 400, rotation: 0, content: 'Wishing you a blessed and joyful Eid celebration full of peace and happiness.', style: { fontSize: 40, color: '#ffffff', fontFamily: 'Hind Siliguri', textAlign: 'center' } },
      { id: 'recipient', type: 'text', x: 540, y: 850, width: 800, height: 100, rotation: 0, content: 'Dear Friend', style: { fontSize: 50, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' } }
    ])
    setSelectedId(null)
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-[1600px] mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8 flex-grow">
          {/* Toolbar */}
          <aside className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl">
              <CardHeader className="p-6 border-b">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Layout className="w-5 h-5 text-secondary" />
                  Studio Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="ai" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-primary/5 rounded-xl h-12">
                    <TabsTrigger value="ai" className="text-xs font-bold">AI</TabsTrigger>
                    <TabsTrigger value="layers" className="text-xs font-bold">Layers</TabsTrigger>
                    <TabsTrigger value="theme" className="text-xs font-bold">Theme</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ai" className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Recipient Name</Label>
                      <Input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="Name" className="rounded-xl h-12" />
                    </div>
                    <Button className="w-full emerald-gradient h-12 font-black rounded-xl" onClick={handleAiGenerate} disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Magic Text</>}
                    </Button>
                  </TabsContent>
                  <TabsContent value="layers" className="space-y-4">
                    <Button variant="outline" onClick={() => addElement('text', 'New Text')} className="w-full h-12 rounded-xl text-xs font-bold">Add Text</Button>
                    <label htmlFor="file-upload" className="w-full flex items-center justify-center border-2 border-dashed rounded-xl h-12 cursor-pointer hover:bg-primary/5 text-xs font-bold text-primary">Upload Image</label>
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </TabsContent>
                  <TabsContent value="theme" className="space-y-4">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => setTemplate(t)} className={cn("w-full h-14 rounded-xl border-2 flex items-center justify-between px-4 transition-all", template.id === t.id ? "border-primary bg-primary/5" : "border-transparent bg-slate-100")}>
                        <span className="text-xs font-bold">{t.name}</span>
                        <div className={cn("w-4 h-4 rounded-full", t.bg)} />
                      </button>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </aside>

          {/* Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/50 rounded-[3rem] p-8 relative">
            <div ref={containerRef} className="relative shadow-2xl w-full max-w-[600px] aspect-square bg-white overflow-hidden" onMouseDown={() => setSelectedId(null)}>
              <div className={cn("absolute inset-0 transition-all duration-500", template.bg)}>
                <div className="absolute inset-0 opacity-20 islamic-pattern"></div>
              </div>
              {elements.map(el => (
                <div key={el.id} onMouseDown={(e) => handleMouseDown(e, el)} style={{ position: 'absolute', left: `${(el.x / 1080) * 100}%`, top: `${(el.y / 1080) * 100}%`, width: `${(el.width / 1080) * 100}%`, transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`, zIndex: selectedId === el.id ? 50 : 10, outline: selectedId === el.id ? '2px solid #fbbf24' : 'none', outlineOffset: '4px' }}>
                  {el.type === 'text' ? (
                    <div style={{ color: el.style.color, fontSize: `${(el.style.fontSize! / 1080) * 100}cqw`, fontFamily: el.style.fontFamily, textAlign: el.style.textAlign, fontWeight: 'bold', lineHeight: 1.2 }}>{el.content}</div>
                  ) : (
                    <img src={el.content} className="w-full h-auto" draggable={false} />
                  )}
                </div>
              ))}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="mt-8 flex gap-4">
               <Button variant="ghost" onClick={handleReset} className="rounded-xl font-bold text-muted-foreground">Reset Card</Button>
            </div>
          </div>

          {/* Sidebar Right */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl h-full p-8 space-y-8">
              <Button onClick={handleDownload} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-lg shadow-xl">Download PNG</Button>
              <Button onClick={handleSaveToGallery} disabled={isSaving} variant="outline" className="w-full h-16 rounded-2xl border-4 border-white glass-card text-primary font-black text-lg">
                {isSaving ? <Loader2 className="animate-spin" /> : "Save to Gallery"}
              </Button>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
