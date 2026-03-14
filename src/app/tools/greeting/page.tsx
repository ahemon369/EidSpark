
"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { generateEidGreeting } from "@/ai/flows/generate-eid-greeting"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Loader2, Send, Download, Share2, Sparkles, Wand2, Moon, Star, Layout, Check, Palette, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const templates = [
  { id: 'moon', name: 'Celestial Moon', bg: 'bg-emerald-950', accent: 'text-secondary', icon: Moon, gradient: ['#064e3b', '#022c22'] },
  { id: 'lantern', name: 'Glowing Lantern', bg: 'bg-amber-900', accent: 'text-amber-400', icon: Sparkles, gradient: ['#78350f', '#451a03'] },
  { id: 'mosque', name: 'Twilight Mosque', bg: 'bg-indigo-950', accent: 'text-indigo-300', icon: Layout, gradient: ['#1e1b4b', '#0f172a'] },
  { id: 'gold', name: 'Royal Golden', bg: 'bg-amber-700', accent: 'text-yellow-100', icon: Star, gradient: ['#b45309', '#78350f'] },
]

export default function GreetingGenerator() {
  const { user } = useUser()
  const db = useFirestore()
  const [name, setName] = useState("")
  const [style, setStyle] = useState<"formal" | "casual" | "heartfelt" | "humorous">("heartfelt")
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [greeting, setGreeting] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!name) {
      toast({ title: "Name required", description: "Please enter a recipient name.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateEidGreeting({ recipientName: name, greetingStyle: style })
      setGreeting(result.greetingMessage)
    } catch (error) {
      toast({ title: "Generation failed", description: "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToGallery = async () => {
    if (!db || !user) {
      toast({ title: "Sign in required", description: "Log in to save greetings to your gallery." })
      return
    }
    if (!greeting) return

    setIsSaving(true)
    try {
      // Note: We're saving the metadata. Real image hosting would require Firebase Storage.
      await addDoc(collection(db, "users", user.uid, "eidGreetings"), {
        userId: user.uid,
        recipientName: name,
        templateId: selectedTemplate.id,
        greetingStyle: style,
        message: greeting,
        generatedImageUrl: "", // Storage not configured for this MVP
        generationDate: new Date().toISOString()
      })
      toast({ title: "Saved to Gallery", description: "You can find your saved greetings in your profile." })
    } catch (error) {
      // Error handled by global listener
    } finally {
      setIsSaving(false)
    }
  }

  const renderToCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = 2
    canvas.width = 1080 * scale
    canvas.height = 1080 * scale
    ctx.scale(scale, scale)

    const gradient = ctx.createLinearGradient(0, 0, 0, 1080)
    gradient.addColorStop(0, selectedTemplate.gradient[0])
    gradient.addColorStop(1, selectedTemplate.gradient[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1080)

    ctx.lineWidth = 40
    ctx.strokeStyle = '#ffffff20'
    ctx.strokeRect(20, 20, 1040, 1040)

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    
    ctx.font = 'bold 120px Inter, sans-serif'
    ctx.fillText("Eid Mubarak", 540, 250)

    const words = greeting || `Wishing you a blessed and joyful Eid celebration full of peace and happiness.`
    const lines = wrapText(ctx, words, 800)
    
    let y = 500
    lines.forEach(line => {
      ctx.fillText(line, 540, y)
      y += 65
    })

    if (name) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 60px Inter, sans-serif'
      ctx.fillText(`Dearest ${name}`, 540, 850)
    }

    ctx.fillStyle = '#ffffff40'
    ctx.font = '300 24px Inter, sans-serif'
    ctx.fillText("Created with EidSpark", 540, 1020)
  }

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  useEffect(() => {
    renderToCanvas()
  }, [greeting, selectedTemplate, name])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `EidGreeting-${name || 'Friend'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast({ title: "Card Downloaded!", description: "Share the joy with your loved ones." })
  }

  return (
    <div className="min-h-screen islamic-pattern pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-widest border border-secondary/20">
            <Sparkles className="w-4 h-4" />
            <span>AI Greeting Engine</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Eid Mubarak Cards</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Generate personalized, high-quality Eid greetings instantly with our advanced AI and beautiful themes.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="p-10 pb-6 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Wand2 className="w-6 h-6 text-secondary" />
                  Customize Card
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-black text-muted-foreground uppercase tracking-widest">Recipient's Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Grandma, Sarah, Bhai"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-2xl h-14 text-lg border-2 border-primary/5 focus:border-primary/30"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="style" className="text-sm font-black text-muted-foreground uppercase tracking-widest">Message Style</Label>
                  <Select value={style} onValueChange={(val: any) => setStyle(val)}>
                    <SelectTrigger className="h-14 rounded-2xl text-lg border-2 border-primary/5">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heartfelt">Heartfelt & Warm</SelectItem>
                      <SelectItem value="formal">Formal & Respectful</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="humorous">Lighthearted & Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-black text-muted-foreground uppercase tracking-widest">Pick a Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          "relative group h-24 rounded-2xl border-2 transition-all overflow-hidden text-left p-4",
                          selectedTemplate.id === template.id ? "border-primary shadow-lg scale-105" : "border-primary/5"
                        )}
                      >
                        <div className={cn("absolute inset-0 opacity-10", template.bg)}></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <span className={cn("text-xs font-black uppercase tracking-widest", template.accent)}>
                            {template.name}
                          </span>
                          <template.icon className={cn("w-5 h-5", template.accent)} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={isLoading} className="w-full emerald-gradient h-16 text-xl font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                  {isLoading ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Crafting...</> : <><Send className="w-6 h-6 mr-2" /> Generate AI Message</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-right duration-700">
            <div className="relative group w-full max-w-xl aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
              <canvas ref={canvasRef} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full max-w-xl">
              <Button onClick={handleDownload} disabled={!greeting} className="flex-1 h-16 rounded-2xl gold-gradient text-white font-black text-lg shadow-xl hover:scale-105 transition-transform">
                <Download className="w-6 h-6 mr-2" /> Download
              </Button>
              <Button onClick={handleSaveToGallery} disabled={!greeting || isSaving} variant="outline" className="flex-1 h-16 rounded-2xl border-4 border-white glass-card text-primary font-black text-lg">
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-6 h-6 mr-2" /> Save to Gallery</>}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
