"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Reusable Back Button for feature pages.
 * Handles navigation back or redirects to home if no history exists.
 */
export function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    // Check if there is browser history to go back to
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleBack}
      className="fixed top-24 left-4 z-[60] bg-white/90 backdrop-blur-md shadow-xl rounded-2xl h-12 px-5 sm:h-14 sm:px-8 font-black gap-3 border-2 border-primary/5 hover:bg-primary/5 hover:border-primary/20 transition-all group active:scale-95 lg:left-8 lg:top-28"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-primary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 hidden sm:inline">Back to Home</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 sm:hidden">Back</span>
    </Button>
  )
}
