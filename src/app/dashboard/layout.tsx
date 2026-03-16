
"use client"

import { ReactNode, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { 
  LayoutDashboard, 
  Send, 
  Camera, 
  Wallet, 
  MapPin, 
  History, 
  Settings, 
  LogOut, 
  Plus, 
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { NotificationCenter } from "@/components/notification-center"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Greetings", href: "/dashboard/greetings", icon: Send },
  { name: "My Selfie Gallery", href: "/dashboard/selfies", icon: Camera },
  { name: "Salami History", href: "/dashboard/salami", icon: Wallet },
  { name: "Saved Mosques", href: "/dashboard/mosques", icon: MapPin },
  { name: "Zakat History", href: "/dashboard/zakat", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading: isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({ title: "Signed Out", description: "See you next Eid!" })
      router.push("/")
    } catch (error) {}
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Mobile Header Toggle */}
      <div className="lg:hidden h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          {logo?.imageUrl && <Image src={logo.imageUrl} alt="Logo" width={28} height={28} />}
          <span className="font-black text-primary text-sm">EidSpark</span>
        </Link>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transition-transform duration-300 lg:relative lg:translate-x-0 lg:h-screen",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-8 hidden lg:block">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex items-center justify-center">
                 {logo?.imageUrl && <Image src={logo.imageUrl} alt="Logo" width={40} height={40} className="object-contain" />}
              </div>
              <span className="text-xl font-black text-primary">EidSpark</span>
            </Link>
          </div>

          <nav className="flex-grow px-4 space-y-1 md:space-y-2 py-4 lg:py-0">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                  pathname === item.href 
                    ? "bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10" 
                    : "text-muted-foreground hover:bg-slate-50 hover:text-primary"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
                {item.name}
                {pathname === item.href && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t space-y-2 mt-auto">
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-slate-50 hover:text-primary transition-all group"
            >
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Main Website
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:bg-destructive/5 font-bold rounded-xl h-12"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <div className="flex-grow flex flex-col h-full lg:h-screen overflow-hidden">
        <header className="h-20 bg-white border-b hidden lg:flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 text-primary border-primary/20 hover:bg-primary/5" asChild>
              <Link href="/"><ArrowLeft className="w-4 h-4" /> Back to Website</Link>
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <h1 className="text-xl font-black text-slate-800">
              {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 rounded-xl flex items-center gap-3 hover:bg-slate-50">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-primary text-white font-black">{user?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800">{user?.displayName}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Premium User</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl p-2" align="end">
                <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg"><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-destructive">Log Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
