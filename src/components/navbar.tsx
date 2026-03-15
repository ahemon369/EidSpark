
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogIn, LogOut, User, ChevronRight, Moon, Sun, Laugh } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Jamaat Finder", href: "/tools/jamaat-finder" },
  { name: "Zakat", href: "/tools/zakat" },
  { name: "Greeting", href: "/tools/greeting" },
  { name: "Selfie", href: "/tools/selfie" },
  { name: "Salami List", href: "/tools/salami-calculator" },
  { name: "Moon Sight", href: "/tools/moon-sighting" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading: loading } = useUser()
  const auth = useAuth()
  const { toast } = useToast()
  
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({ title: "Signed Out", description: "Come back soon!" })
      router.push("/")
    } catch (error) {}
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-[80px] flex items-center",
      scrolled 
        ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b shadow-xl shadow-primary/5" 
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <div className="relative h-10 w-10 transition-transform group-hover:scale-110">
               {logo?.imageUrl && (
                 <Image 
                  src={logo.imageUrl} 
                  alt="EidSpark Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                  priority
                 />
               )}
            </div>
            <span className="text-2xl font-black tracking-tight text-primary dark:text-secondary">
              EidSpark
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  pathname === item.href
                    ? "text-primary dark:text-secondary bg-primary/5 dark:bg-secondary/10"
                    : "text-muted-foreground hover:text-primary dark:hover:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/5"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="rounded-full text-primary dark:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/5"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl mt-2" align="end">
                  <DropdownMenuLabel className="font-bold p-4">
                    <p className="text-sm font-black text-primary">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl font-bold"><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold rounded-xl focus:text-destructive">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="emerald-gradient text-white rounded-full font-black px-8 h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Link href="/login">Get Started <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-2 z-50">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-primary bg-primary/5"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={cn(
        "fixed inset-0 bg-background/98 dark:bg-slate-950/98 backdrop-blur-2xl lg:hidden transition-all duration-500 ease-in-out z-40 flex flex-col items-center justify-center",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="space-y-6 w-full max-w-xs text-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block py-3 rounded-2xl text-2xl font-black transition-all",
                pathname === item.href ? "text-primary dark:text-secondary bg-primary/5" : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-8">
            {user ? (
              <Button asChild className="w-full h-14 rounded-2xl font-black text-lg emerald-gradient shadow-xl" onClick={() => setIsOpen(false)}>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="w-full h-14 rounded-2xl font-black text-lg emerald-gradient shadow-xl" onClick={() => setIsOpen(false)}>
                <Link href="/login">Join EidSpark</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
