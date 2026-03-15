
"use client"

import { useState } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import { Bell, Send, Heart, MapPin, Moon, Clock, Sparkles } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

type NotificationType = 'greeting' | 'like' | 'mosque' | 'moon' | 'jamaat'

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'greeting': return Send
    case 'like': return Heart
    case 'mosque': return MapPin
    case 'moon': return Moon
    case 'jamaat': return Clock
    default: return Sparkles
  }
}

export function NotificationCenter() {
  const { user } = useUser()
  const db = useFirestore()
  const [isOpen, setIsOpen] = useState(false)

  const notificationQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: notifications, isLoading } = useCollection(notificationQuery)
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  const markAsRead = async (id: string) => {
    if (!db || !user) return
    try {
      await updateDoc(doc(db, "users", user.uid, "notifications", id), {
        isRead: true
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-50">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[8px] font-black text-white">{unreadCount}</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 rounded-[2rem] shadow-2xl border-primary/5 overflow-hidden bg-white/95 backdrop-blur-xl" align="end">
        <div className="p-6 emerald-gradient text-white flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest">Notifications</h3>
          {unreadCount > 0 && <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-primary/30" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                You're all caught up 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => {
                const Icon = getIcon(n.type as NotificationType)
                return (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                      !n.isRead && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                      n.isRead ? "bg-slate-100 text-slate-400" : "bg-primary text-white shadow-lg"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className={cn("text-xs font-black truncate", n.isRead ? "text-slate-600" : "text-primary")}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                        {n.message}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-4 shrink-0"></div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t text-center">
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white" asChild>
            <Link href="/dashboard/settings" onClick={() => setIsOpen(false)}>Settings</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

import Link from "next/link"
