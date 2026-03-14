
"use client"

import { useEffect, useState, use } from "react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Sparkles, Moon, Star, Gift, ExternalLink, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SalamiRevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useFirestore()
  const [isOpen, setIsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const cardRef = useMemoFirebase(() => {
    if (!db) return null
    return doc(db, "salamiCards", id)
  }, [db, id])

  const { data: card, isLoading } = useDoc(cardRef)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Moon className="w-16 h-16 text-secondary" />
        <h1 className="text-4xl font-black">Envelope Not Found</h1>
        <p className="text-white/60">This magic link may have expired or is incorrect.</p>
        <Button variant="outline" className="rounded-xl border-white/20 text-white" onClick={() => window.location.href = '/'}>Back Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-950 relative overflow-hidden selection:bg-secondary selection:text-emerald-950">
      <Navbar />
      
      {/* Festive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] animate-pulse"><Star className="w-8 h-8 text-secondary/40 fill-secondary/40" /></div>
        <div className="absolute top-40 right-[15%] animate-float"><Moon className="w-12 h-12 text-secondary/30 fill-secondary/30" /></div>
        <div className="absolute bottom-20 left-[20%] animate-pulse delay-500"><Star className="w-6 h-6 text-white/20" /></div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        
        {/* Confetti Container */}
        {showConfetti && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  backgroundColor: ['#fbbf24', '#059669', '#ffffff'][i % 3],
                  animationDelay: `${Math.random() * 3}s`,
                  transform: `scale(${Math.random() * 1.5})`
                }}
              ></div>
            ))}
          </div>
        )}

        <div className="w-full relative perspective-1000">
          {!isOpen ? (
            /* Closed Envelope Animation */
            <div 
              className="relative w-full aspect-[4/3] bg-amber-500 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] cursor-pointer group hover:scale-[1.02] transition-all duration-500 overflow-hidden"
              onClick={() => setIsOpen(true)}
            >
              <div className="absolute inset-0 border-[12px] border-amber-600/30 m-4 rounded-xl"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-950 space-y-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md animate-float">
                  <Gift className="w-12 h-12 text-amber-950" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Eid Salami</h2>
                  <p className="font-bold opacity-60">For {card.recipientName}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                  <Sparkles className="w-4 h-4" /> Tap to Open
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[250px] border-l-transparent border-r-[250px] border-r-transparent border-t-[140px] border-t-amber-600/40"></div>
            </div>
          ) : (
            /* Opened Card State */
            <div className="space-y-8 animate-in zoom-in slide-in-from-bottom duration-700">
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border-8 border-secondary/10">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Sparkles className="w-24 h-24 text-primary" /></div>
                
                <div className="relative z-10 space-y-8 text-center">
                  <div className="space-y-2">
                    <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Eid Mubarak!</p>
                    <h2 className="text-4xl font-black text-primary">৳{card.amount.toLocaleString()}</h2>
                  </div>

                  <div className="h-px w-20 bg-primary/10 mx-auto"></div>

                  <div className="space-y-4">
                    <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">
                      "{card.message || "Sending you warm wishes and digital blessings on this joyous day."}"
                    </p>
                    <p className="font-black text-primary text-xl">— {card.senderName}</p>
                  </div>

                  {card.paymentLink && (
                    <Button 
                      className="w-full h-14 rounded-2xl emerald-gradient text-white font-black text-lg shadow-xl"
                      onClick={() => window.open(card.paymentLink, '_blank')}
                    >
                      Collect via Payment Link <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white rounded-xl gap-2">
                  <RefreshCcw className="w-4 h-4" /> Close Envelope
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-white/40 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest">Sent via EidSpark</p>
          <div className="flex justify-center gap-2">
            {[1,2,3].map(i => <Star key={i} className="w-3 h-3 fill-secondary text-secondary" />)}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
