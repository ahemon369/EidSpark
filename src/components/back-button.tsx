
"use client"

import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

/**
 * Reusable Navigation block for feature pages.
 * Includes sticky breadcrumbs and a robust back button.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  // Generate breadcrumbs from current pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" }
  ]

  let accumulatedPath = ""
  pathSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({
      label,
      href: index === pathSegments.length - 1 ? undefined : accumulatedPath
    })
  })

  return (
    <div className={cn("w-full max-w-7xl mx-auto px-6 mb-8 space-y-6 transition-all duration-300", className)}>
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            {crumb.href ? (
              <Link 
                href={crumb.href} 
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {crumb.label === "Home" && <Home className="w-3 h-3" />}
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-600 font-black">{crumb.label}</span>
            )}
            {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 opacity-50" />}
          </div>
        ))}
      </nav>

      {/* Modern Back Button */}
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-2xl h-12 px-6 sm:h-14 sm:px-8 font-black gap-3 border-none hover:bg-slate-50 transition-all group active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Back</span>
      </Button>
    </div>
  )
}
