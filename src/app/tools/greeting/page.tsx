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
  content: string // Text content or SVG/Sticker ID or Image DataURI
  style: {
    fontSize?: number
    color?: string
    fontFamily?: string
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
  }
}

const templates = [
  { 
    id: 'moon', 
    name: 'Crescent Moon', 
    bg: 'bg-emerald-950', 
    gradient: ['#064e3b', '#022c22'], 
    textColor: '#ffffff', 
    secondaryColor: '#fbbf24' 
  },
  { 
    id: 'lantern', 
    name: 'Lantern Glow', 
    bg: 'bg-amber-900', 
    gradient: ['#78350f', '#451a03'], 
    textColor: '#ffffff', 
    secondaryColor: '#fbbf24' 
  },
  { 
    id: 'mosque', 
    name: 'Mosque Silhouette', 
    bg: 'bg-indigo-950', 
    gradient: ['#1e1b4b', '#0f172a'], 
    textColor: '#ffffff', 
    secondaryColor: '#a5b4fc' 
  },
  { 
    id: 'gold', 
    name: 'Golden Pattern', 
    bg: 'bg-amber-50', 
    gradient: ['#fffbeb', '#fef3c7'], 
    textColor: '#451a03', 
    secondaryColor: '#92400e' 
  },
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

  // --- State ---
  const [elements, setElements] = useState<CardElement[]>([
    {
      id: 'title',
      type: 'text',
      x: 540,
      y: 200,
      width: 800,
      height: 120,
      rotation: 0,
      content: 'Eid Mubarak',
      style: { fontSize: 80, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' }
    },
    {
      id: 'message',
      type: 'text',
      x: 540,
      y: 500,
      width: 800,
      height: 400,
      rotation: 0,
      content: 'Wishing you a blessed and joyful Eid celebration full of peace and happiness.',
      style: { fontSize: 40, color: '#ffffff', fontFamily: 'Hind Siliguri', textAlign: 'center' }
    },
    {
      id: 'recipient',
      type: 'text',
      x: 540,
      y: 850,
      width: 800,
      height: 100,
      rotation: 0,
      content: 'Dear Friend',
      style: { fontSize: 50, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' }
    }
  ])
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [template, setTemplate] = useState(templates[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // AI Params State
  const [aiName, setAiName] = useState("")
  const [aiLang, setAiLang] = useState("bangla")
  const [aiStyle, setAiStyle] = useState("heartfelt")

  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // --- Helpers ---
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

  // --- AI Integration ---
  const handleAiGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateEidGreeting({ 
        recipientName: aiName || "Friend", 
        greetingStyle: aiStyle as any, 
        language: aiLang as any 
      })
      
      // Update existing text elements
      setElements(prev => prev.map(el => {
        if (el.id === 'title') return { ...el, content: result.title }
        if (el.id === 'message') return { ...el, content: result.message }
        if (el.id === 'recipient') return { ...el, content: result.recipientLine }
        return el
      }))
      
      toast({ title: "AI Message Generated", description: "Your card text has been updated." })
    } catch (error) {
      toast({ title: "AI Generation Failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // --- Interaction Logic ---
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
    
    updateElement(selectedId, {
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y
    })
  }, [isDragging, selectedId, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // --- Rendering & Export ---
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1080

    // 1. Background
    const grad = ctx.createLinearGradient(0, 0, 0, 1080)
    grad.addColorStop(0, template.gradient[0])
    grad.addColorStop(1, template.gradient[1])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1080)

    // 2. Decorative elements (static border)
    ctx.lineWidth = 20
    ctx.strokeStyle = `${template.secondaryColor}40`
    ctx.strokeRect(30, 30, 1020, 1020)

    // 3. Render Elements
    for (const el of elements) {
      ctx.save()
      ctx.translate(el.x, el.y)
      ctx.rotate((el.rotation * Math.PI) / 180)

      if (el.type === 'text') {
        ctx.fillStyle = el.style.color || '#ffffff'
        ctx.font = `bold ${el.style.fontSize}px "${el.style.fontFamily}", sans-serif`
        ctx.textAlign = el.style.textAlign || 'center'
        
        const words = el.content.split(' ')
        let line = ''
        let lines = []
        const maxWidth = el.width
        
        for (let i = 0; i < words.length; i++) {
          let testLine = line + words[i] + ' '
          let metrics = ctx.measureText(testLine)
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line)
            line = words[i] + ' '
          } else {
            line = testLine
          }
        }
        lines.push(line)
        
        const lineHeight = (el.style.fontSize || 40) * 1.2
        lines.forEach((l, i) => {
          ctx.fillText(l.trim(), 0, i * lineHeight - (lines.length * lineHeight) / 2)
        })
      } else if (el.type === 'image') {
        const img = new Image()
        img.src = el.content
        ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height)
      } else if (el.type === 'sticker') {
        ctx.fillStyle = template.secondaryColor
        ctx.beginPath()
        ctx.arc(0, 0, el.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(el.content, 0, 0)
      }
      ctx.restore()
    }
  }, [elements, template])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `EidSpark-Card-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast({ title: "Card Exported", description: "Your PNG has been downloaded." })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        addElement('image', event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveToGallery = async () => {
    if (!db || !user) {
      toast({ title: "Sign in required", description: "Log in to save greetings to your gallery." })
      return
    }
    setIsSaving(true)
    try {
      await addDoc(collection(db, "users", user.uid, "eidGreetings"), {
        userId: user.uid,
        recipientName: aiName || elements.find(el => el.id === 'recipient')?.content || 'Friend',
        templateId: template.id,
        elements: elements,
        generationDate: new Date().toISOString()
      })
      
      // Trigger Notification
      await addDoc(collection(db, "users", user.uid, "notifications"), {
        userId: user.uid,
        title: "Greeting Created! 💌",
        message: `Your personalized card for ${aiName || 'Friend'} has been saved to your gallery.`,
        type: "greeting",
        isRead: false,
        createdAt: new Date().toISOString()
      })

      toast({ title: "Saved to Gallery", description: "Find this in your profile history." })
    } catch (error) {
      // Handled globally
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setElements([
      {
        id: 'title',
        type: 'text',
        x: 540,
        y: 200,
        width: 800,
        height: 120,
        rotation: 0,
        content: 'Eid Mubarak',
        style: { fontSize: 80, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' }
      },
      {
        id: 'message',
        type: 'text',
        x: 540,
        y: 500,
        width: 800,
        height: 400,
        rotation: 0,
        content: 'Wishing you a blessed and joyful Eid celebration full of peace and happiness.',
        style: { fontSize: 40, color: '#ffffff', fontFamily: 'Hind Siliguri', textAlign: 'center' }
      },
      {
        id: 'recipient',
        type: 'text',
        x: 540,
        y: 850,
        width: 800,
        height: 100,
        rotation: 0,
        content: 'Dear Friend',
        style: { fontSize: 50, color: '#fbbf24', fontFamily: 'Hind Siliguri', textAlign: 'center' }
      }
    ])
    setSelectedId(null)
    toast({ title: "Card Reset", description: "All manual changes cleared." })
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      
      <div className="relative pt-[80px]">
        <BackButton />
        
        <main className="max-w-[1600px] mx-auto px-4 py-8 grid lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">
          {/* Left Toolbar */}
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
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recipient Name</Label>
                      <Input 
                        value={aiName}
                        onChange={(e) => setAiName(e.target.value)}
                        placeholder="Name" 
                        className="rounded-xl h-12" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Style & Language</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={aiLang} onValueChange={aiLang}>
                          <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bangla">Bengali</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="arabic">Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={aiStyle} onValueChange={aiStyle}>
                          <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="heartfelt">Heartfelt</SelectItem>
                            <SelectItem value="blessing">Blessing</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      className="w-full emerald-gradient h-12 font-black rounded-xl"
                      onClick={handleAiGenerate}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Magic Text</>}
                    </Button>
                  </TabsContent>

                  <TabsContent value="layers" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => addElement('text', 'New Text')} className="h-12 rounded-xl text-xs font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Text
                      </Button>
                      <label htmlFor="file-upload" className="flex items-center justify-center border-2 border-dashed rounded-xl h-12 cursor-pointer hover:bg-primary/5 transition-colors text-xs font-bold text-primary">
                        <ImageIcon className="w-4 h-4 mr-2" /> Upload
                      </label>
                      <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Manage Layers</Label>
                      {elements.map(el => (
                        <div key={el.id} className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                          selectedId === el.id ? "border-primary bg-primary/5 shadow-sm" : "border-transparent bg-slate-50"
                        )} onClick={() => setSelectedId(el.id)}>
                          <div className="flex items-center gap-3">
                            {el.type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            <span className="text-xs font-bold truncate max-w-[120px]">{el.content}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="theme" className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Template</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {templates.map(t => (
                        <button key={t.id} onClick={() => setTemplate(t)} className={cn(
                          "h-14 rounded-xl border-2 transition-all flex items-center justify-between px-4",
                          template.id === t.id ? "border-primary bg-primary/5" : "border-transparent bg-slate-100"
                        )}>
                          <span className="text-xs font-bold">{t.name}</span>
                          <div className={cn("w-4 h-4 rounded-full", t.bg)} />
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Style Controls (Conditional) */}
            {selectedElement && selectedElement.type === 'text' && (
              <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl animate-in slide-in-from-left duration-300">
                <CardHeader className="p-6 border-b">
                  <CardTitle className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-widest">
                    <Type className="w-4 h-4 text-secondary" /> Style Layer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">Content</Label>
                    <Input value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} className="rounded-xl h-12" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Font Family</Label>
                      <Select value={selectedElement.style.fontFamily} onValueChange={(val) => updateStyle(selectedElement.id, { fontFamily: val })}>
                        <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {fonts.map(f => <SelectItem key={f.value} value={f.value}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Font Size</Label>
                      <Slider value={[selectedElement.style.fontSize || 40]} onValueChange={([val]) => updateStyle(selectedElement.id, { fontSize: val })} min={10} max={200} step={2} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                     <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        <Button variant={selectedElement.style.textAlign === 'left' ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => updateStyle(selectedElement.id, { textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Button>
                        <Button variant={selectedElement.style.textAlign === 'center' ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => updateStyle(selectedElement.id, { textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Button>
                        <Button variant={selectedElement.style.textAlign === 'right' ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => updateStyle(selectedElement.id, { textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Button>
                     </div>
                     <input type="color" value={selectedElement.style.color} onChange={(e) => updateStyle(selectedElement.id, { color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-none" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between"><Label className="text-xs font-bold">Rotation</Label> <span className="text-xs font-mono">{selectedElement.rotation}°</span></div>
                    <Slider value={[selectedElement.rotation]} onValueChange={([val]) => updateElement(selectedElement.id, { rotation: val })} min={-180} max={180} step={1} />
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Center Canvas Area */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-primary/5 p-8 relative group">
            <div 
              ref={containerRef}
              className="relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[600px] aspect-square bg-white overflow-hidden select-none cursor-default"
              onMouseDown={() => setSelectedId(null)}
            >
              {/* Background Layer */}
              <div className={cn("absolute inset-0 transition-all duration-500", template.bg)}>
                <div className="absolute inset-0 opacity-20 pointer-events-none islamic-pattern"></div>
              </div>

              {/* Elements Rendering */}
              {elements.map(el => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${(el.x / 1080) * 100}%`,
                    top: `${(el.y / 1080) * 100}%`,
                    width: `${(el.width / 1080) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                    zIndex: selectedId === el.id ? 50 : 10,
                    outline: selectedId === el.id ? '2px solid #fbbf24' : 'none',
                    outlineOffset: '4px',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  className="group"
                >
                  {el.type === 'text' ? (
                    <div style={{
                      color: el.style.color,
                      fontSize: `${(el.style.fontSize! / 1080) * 100}cqw`,
                      fontFamily: el.style.fontFamily,
                      textAlign: el.style.textAlign,
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                      wordWrap: 'break-word',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {el.content}
                    </div>
                  ) : (
                    <img src={el.content} alt="Element" className="w-full h-auto" draggable={false} />
                  )}
                  
                  {selectedId === el.id && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-primary rounded-full" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-primary rounded-full" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-primary rounded-full" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-primary rounded-full" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/80 p-1 rounded-full shadow-lg">
                         <RotateCw className="w-4 h-4 text-primary" />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Hidden Canvas for Export */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="mt-8 flex gap-4">
               <Button variant="ghost" onClick={handleReset} className="rounded-xl font-bold text-muted-foreground"><RefreshCcw className="w-4 h-4 mr-2" /> Reset Card</Button>
               <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                 <Move className="w-3 h-3" /> Drag to move • <RotateCw className="w-3 h-3" /> Edit in sidebar
               </div>
            </div>
          </div>

          {/* Right Panel: Export & Social */}
          <aside className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-xl rounded-[2rem] bg-white/80 backdrop-blur-xl h-full">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Download className="w-5 h-5 text-secondary" />
                  Export Design
                </CardTitle>
                <CardDescription>Share your masterpiece</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Button onClick={handleDownload} className="w-full h-16 rounded-2xl gold-gradient text-white font-black text-lg shadow-xl hover:scale-105 transition-transform">
                    <Download className="w-6 h-6 mr-2" /> Download PNG
                  </Button>
                  <Button onClick={handleSaveToGallery} disabled={isSaving} variant="outline" className="w-full h-16 rounded-2xl border-4 border-white glass-card text-primary font-black text-lg">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-6 h-6 mr-2" /> Save to Gallery</>}
                  </Button>
                </div>

                <div className="pt-8 border-t border-primary/10 space-y-4">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick Share</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Eid Mubarak! Check out my card: ' + window.location.href)}`, '_blank')} className="h-14 rounded-2xl border-2 border-green-100 text-green-600 font-bold hover:bg-green-50">
                      <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                    </Button>
                    <Button variant="outline" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="h-14 rounded-2xl border-2 border-blue-100 text-blue-600 font-bold hover:bg-blue-50">
                      <Facebook className="w-5 h-5 mr-2" /> Facebook
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                       <Star className="w-4 h-4 text-white fill-white" />
                     </div>
                     <span className="text-xs font-black text-primary uppercase">Pro Tip</span>
                   </div>
                   <p className="text-xs text-primary/70 font-medium leading-relaxed">
                     Use the **Magic Text** button in the sidebar to have our AI write a beautiful blessing for you!
                   </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}
