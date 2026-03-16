"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Reusable Back Button for feature pages.
 * Handles navigation back or redirects to home if no history exists.
 * Positioned relatively to avoid navbar overlap.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2", className)}>
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="bg-white/90 backdrop-blur-md shadow-sm rounded-2xl h-12 px-5 sm:h-14 sm:px-8 font-black gap-3 border-2 border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all group active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 hidden sm:inline">Back to Home</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 sm:hidden">Back</span>
      </Button>
    </div>
  )
}
