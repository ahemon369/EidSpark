
"use client"

import { useEffect, useState, use } from "react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Sparkles, Moon, Star, Gift, ExternalLink, RefreshCcw, Heart } from "lucide-react"
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

  const handlePaymentClick = () => {
    if (!card?.paymentLink) return;
    
    let url = card.paymentLink.trim();
    
    if (url.includes('<') || url.includes('>')) {
      console.warn("Invalid payment link detected:", url);
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (/^\d+$/.test(url)) {
        console.warn("Payment link is just a number, cannot open as URL.");
        return;
      }
      url = `https://${url}`;
    }

    try {
      new URL(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Malformed URL:", url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary font-black tracking-widest uppercase text-xs">Unsealing Blessing...</p>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Moon className="w-16 h-16 text-secondary animate-float" />
        <h1 className="text-4xl font-black">Envelope Not Found</h1>
        <p className="text-white/60">This magic link may have expired or is incorrect.</p>
        <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10" onClick={() => window.location.href = '/'}>Back Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#022c22] relative overflow-hidden selection:bg-secondary selection:text-emerald-950">
      <Navbar />
      
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 islamic-pattern"></div>
        <div className="absolute top-20 left-[10%] animate-pulse"><Star className="w-12 h-12 text-secondary/40 fill-secondary/20" /></div>
        <div className="absolute top-40 right-[15%] animate-float"><Moon className="w-24 h-24 text-secondary/30 fill-secondary/10" /></div>
        <div className="absolute bottom-20 left-[20%] animate-pulse delay-500"><Star className="w-10 h-10 text-white/10 fill-white/5" /></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] relative z-10">
        
        {/* Confetti Elements */}
        {showConfetti && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  backgroundColor: ['#fbbf24', '#059669', '#ffffff', '#92400e'][i % 4],
                  animationDuration: `${Math.random() * 2 + 2}s`,
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
              className="relative w-full aspect-[4/3] bg-amber-500 rounded-3xl shadow-[0_48px_96px_-12px_rgba(0,0,0,0.6)] cursor-pointer group hover:scale-[1.03] transition-all duration-500 overflow-hidden border-4 border-white/10"
              onClick={() => setIsOpen(true)}
            >
              {/* Internal Border Styling */}
              <div className="absolute inset-0 border-[16px] border-amber-600/20 m-6 rounded-2xl"></div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-950 space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/40 rounded-full blur-2xl animate-pulse"></div>
                  <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md animate-float relative border border-white/20">
                    <Gift className="w-14 h-14 text-amber-900 drop-shadow-sm" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black uppercase tracking-tighter drop-shadow-sm">Eid Salami</h2>
                  <div className="h-1 w-12 bg-amber-950/20 mx-auto rounded-full"></div>
                  <p className="font-black text-amber-900/60 uppercase tracking-[0.2em] text-xs">For {card.recipientName}</p>
                </div>

                <div className="inline-flex items-center gap-3 px-8 py-3 bg-amber-950 text-white rounded-full text-sm font-black uppercase tracking-widest border-2 border-white/10 shadow-2xl group-hover:bg-amber-900 transition-colors">
                  <Sparkles className="w-5 h-5 text-secondary animate-twinkle" /> 
                  <span>Tap to Open</span>
                </div>
              </div>

              {/* Envelope Flap visual simulation */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[300px] border-l-transparent border-r-[300px] border-r-transparent border-t-[180px] border-t-amber-600/30"></div>
            </div>
          ) : (
            /* Opened Card State */
            <div className="space-y-10 animate-in zoom-in slide-in-from-bottom duration-700">
              <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_64px_128px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden border-[12px] border-secondary/5 group">
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Sparkles className="w-32 h-32 text-primary" /></div>
                <div className="absolute bottom-0 left-0 p-8 opacity-5 group-hover:-rotate-12 transition-transform duration-700"><Heart className="w-24 h-24 text-primary" /></div>
                
                <div className="relative z-10 space-y-10 text-center">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      <Gift className="w-3 h-3" /> Digital Envelope
                    </div>
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Eid Mubarak!</p>
                    {card.amount > 0 && (
                      <h2 className="text-6xl font-black text-primary tracking-tighter drop-shadow-sm">৳{card.amount.toLocaleString()}</h2>
                    )}
                  </div>

                  <div className="h-px w-24 bg-primary/10 mx-auto rounded-full"></div>

                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif">"</div>
                      <p className="text-xl text-slate-700 font-medium italic leading-relaxed px-4">
                        {card.message || "Sending you warm wishes and digital blessings on this joyous day. May your life be filled with happiness and prosperity."}
                      </p>
                      <div className="absolute -bottom-10 -right-2 text-6xl text-primary/10 font-serif">"</div>
                    </div>
                    <div className="pt-4">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">With Love From</p>
                      <p className="font-black text-primary text-2xl tracking-tight">— {card.senderName}</p>
                    </div>
                  </div>

                  {card.paymentLink && (
                    <Button 
                      className="w-full h-16 rounded-2xl emerald-gradient text-white font-black text-lg shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 group"
                      onClick={handlePaymentClick}
                    >
                      <span className="flex items-center gap-3">
                        Collect Eidi <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest transition-all">
                  <RefreshCcw className="w-4 h-4" /> Reset Animation
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16 text-center text-white/30 space-y-3 animate-in fade-in duration-1000 delay-500">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sent via EidSpark ✨</p>
          <div className="flex justify-center gap-3">
            {[1,2,3].map(i => <Star key={i} className="w-4 h-4 fill-secondary/20 text-secondary/20 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />)}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .islamic-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}
