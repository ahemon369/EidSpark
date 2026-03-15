
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogIn, LogOut, User, ChevronRight, Sparkles } from "lucide-react"
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
  { name: "Zakat", href: "/tools/zakat" },
  { name: "Greeting", href: "/tools/greeting" },
  { name: "Selfie", href: "/tools/selfie" },
  { name: "Salami", href: "/tools/salami" },
  { name: "Countdown", href: "/tools/countdown" },
  { name: "Mosques", href: "/tools/mosque" },
  { name: "About", href: "/about" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading: loading } = useUser()
  const auth = useAuth()
  const { toast } = useToast()
  
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({
        title: "Signed Out",
        description: "Come back soon for more Eid celebrations!",
      })
      router.push("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      })
    }
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[70px] flex items-center",
      scrolled 
        ? "bg-white/80 backdrop-blur-md border-b shadow-sm shadow-primary/5" 
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Brand Section */}
          <Link href="/" className="flex items-center gap-[10px] group relative z-50">
            <div className="relative h-[40px] w-auto transition-all duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(6,95,70,0.3)]">
               {logo?.imageUrl && (
                 <Image 
                  src={logo.imageUrl} 
                  alt="EidSpark Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain h-[40px] w-auto"
                  priority
                 />
               )}
            </div>
            <span className="text-2xl font-black tracking-tight text-primary transition-colors group-hover:text-primary/90">
              EidSpark
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4 relative z-50">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 ring-offset-2 hover:ring-primary/20 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.[0] || <User className="w-5 h-5" />}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl mt-2" align="end">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black leading-none text-primary">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/dashboard">My Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/tools/salami">Salami Tracker</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive rounded-xl">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="lg" asChild className="emerald-gradient text-white rounded-full font-black px-8 h-11 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group overflow-hidden">
                <Link href="/login" className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-4 relative z-50">
            {!loading && !user && (
              <Button size="sm" asChild className="emerald-gradient text-white rounded-full font-black h-9 px-4 shadow-md">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={cn(
        "fixed inset-0 bg-background/95 backdrop-blur-xl lg:hidden transition-all duration-300 ease-in-out z-40 flex flex-col items-center justify-center",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col items-center space-y-6 w-full px-8 text-center animate-in fade-in slide-in-from-bottom duration-500">
          <div className="mb-8">
             <div className="relative h-16 w-16 mx-auto mb-4">
                {logo?.imageUrl && (
                  <Image src={logo.imageUrl} alt="Logo" width={64} height={64} className="object-contain" />
                )}
             </div>
             <h2 className="text-3xl font-black text-primary tracking-tight">EidSpark</h2>
          </div>
          
          <div className="space-y-4 w-full max-w-xs">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block py-3 rounded-2xl text-xl font-bold transition-all",
                  pathname === item.href
                    ? "text-primary bg-primary/5 border-l-4 border-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-12 w-full max-w-xs space-y-4">
            {user ? (
              <>
                <Button asChild className="w-full h-14 rounded-2xl font-black text-lg emerald-gradient shadow-lg" onClick={() => setIsOpen(false)}>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl font-bold text-destructive border-destructive/20">
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full h-14 rounded-2xl emerald-gradient font-black text-lg shadow-lg" onClick={() => setIsOpen(false)}>
                <Link href="/login">
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
