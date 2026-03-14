
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-secondary fill-secondary" />
            <span>AI Powered</span>
          </div>
          <h1 className="text-4xl font-bold font-headline text-primary">Eid Greeting Generator</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Create personalized Eid Mubarak cards instantly. Choose a style, enter a name, and let our AI craft the perfect message.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Wand2 className="w-5 h-5" />
                Customize Greeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Recipient's Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Grandma, Sarah, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-base">Greeting Style</Label>
                <Select value={style} onValueChange={(val: any) => setStyle(val)}>
                  <SelectTrigger className="h-12 rounded-xl text-lg">
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
                className="w-full emerald-gradient py-8 text-xl font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
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
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
              <Image 
                src={bgImage?.imageUrl || ""}
                alt="Card Background"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint="islamic background"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8 lg:p-12">
                <div className="glass p-8 lg:p-12 rounded-2xl w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                  {greeting ? (
                    <>
                      <div className="text-primary font-headline text-2xl lg:text-3xl font-bold italic leading-relaxed">
                        "{greeting}"
                      </div>
                      <div className="h-px bg-primary/20 w-1/3 mx-auto"></div>
                      <div className="text-primary/60 font-medium tracking-widest uppercase text-xs">Eid Mubarak</div>
                    </>
                  ) : (
                    <div className="space-y-4 py-12">
                      <Send className="w-12 h-12 text-primary/20 mx-auto" />
                      <p className="text-primary/40 font-medium">Your generated greeting will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {greeting && (
              <div className="flex gap-4 animate-in slide-in-from-bottom duration-500">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 text-primary hover:bg-primary/5">
                  <Download className="w-5 h-5 mr-2" />
                  Download Image
                </Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl border-primary/20 text-primary hover:bg-primary/5">
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
