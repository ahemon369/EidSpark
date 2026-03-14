
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { generateEidGreeting } from "@/ai/flows/generate-eid-greeting"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, Send, Download, Share2, Sparkles, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function GreetingGenerator() {
  const [name, setName] = useState("")
  const [style, setStyle] = useState<"formal" | "casual" | "heartfelt" | "humorous">("heartfelt")
  const [isLoading, setIsLoading] = useState(false)
  const [greeting, setGreeting] = useState("")
  const { toast } = useToast()

  const bgImage = PlaceHolderImages.find(img => img.id === "greeting-bg")

  const handleGenerate = async () => {
    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter a recipient name to generate a greeting.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateEidGreeting({
        recipientName: name,
        greetingStyle: style
      })
      setGreeting(result.greetingMessage)
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!greeting) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Eid Mubarak Greeting',
          text: greeting,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(greeting)
      toast({
        title: "Copied to clipboard!",
        description: "You can now paste your greeting anywhere."
      })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-secondary fill-secondary" />
            <span>AI Powered</span>
          </div>
          <h1 className="text-4xl font-bold font-headline text-primary tracking-tight">Eid Greeting Generator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Create personalized Eid Mubarak cards instantly. Choose a style, enter a name, and let our AI craft the perfect message.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Card className="shadow-lg border-primary/10 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
              <CardTitle className="flex items-center gap-2 text-primary font-black">
                <Wand2 className="w-5 h-5 text-secondary" />
                Customize Greeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-bold text-primary">Recipient's Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Grandma, Sarah, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-base font-bold text-primary">Greeting Style</Label>
                <Select value={style} onValueChange={(val: any) => setStyle(val)}>
                  <SelectTrigger className="h-14 rounded-xl text-lg border-2 border-primary/10">
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

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full emerald-gradient py-8 text-xl font-black rounded-2xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Sparking magic...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6 mr-2" />
                    Generate AI Greeting
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              <Image 
                src={bgImage?.imageUrl || ""}
                alt="Card Background"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint="islamic background"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8 lg:p-12">
                <div className="glass p-8 lg:p-12 rounded-[2rem] w-full text-center space-y-6 animate-in fade-in zoom-in duration-500 border-white/30 backdrop-blur-xl">
                  {greeting ? (
                    <>
                      <div className="text-primary font-headline text-2xl lg:text-3xl font-black italic leading-relaxed">
                        "{greeting}"
                      </div>
                      <div className="h-1 bg-secondary/30 w-1/4 mx-auto rounded-full"></div>
                      <div className="text-primary/60 font-black tracking-[0.3em] uppercase text-xs">Eid Mubarak</div>
                    </>
                  ) : (
                    <div className="space-y-4 py-12">
                      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                        <Send className="w-10 h-10 text-primary/20" />
                      </div>
                      <p className="text-primary/40 font-black uppercase tracking-widest text-sm">Your AI Greeting Preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {greeting && (
              <div className="flex gap-4 animate-in slide-in-from-bottom duration-500">
                <Button variant="outline" className="flex-1 h-16 rounded-2xl border-2 border-primary/10 text-primary font-black hover:bg-primary/5">
                  <Download className="w-5 h-5 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handleShare} className="flex-1 h-16 rounded-2xl gold-gradient text-primary font-black shadow-lg">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Card
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
