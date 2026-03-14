
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Menu, X, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/#tools" },
  { name: "Zakat", href: "/tools/zakat" },
  { name: "Greeting", href: "/tools/greeting" },
  { name: "Salami", href: "/tools/salami" },
  { name: "Countdown", href: "/tools/countdown" },
  { name: "Mosques", href: "/tools/mosque" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-xl font-bold font-headline tracking-tight text-primary">EidSpark</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-primary bg-accent/50"
                    : "text-muted-foreground hover:text-primary hover:bg-accent/20"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button size="sm" className="ml-4 emerald-gradient">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === item.href
                    ? "text-primary bg-accent/50"
                    : "text-muted-foreground hover:text-primary hover:bg-accent/20"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-3 pt-2">
              <Button className="w-full emerald-gradient">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
