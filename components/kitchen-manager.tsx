"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, RefreshCw, AlertTriangle, Zap, Bot, Power, PowerOff, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

type OrderItem = {
  name: string
  quantity: number
  notes?: string
}

type Order = {
  id: string
  orderNumber: number
  items: OrderItem[]
  status: "pending" | "completed"
  total: number
  createdAt: string
}

type KitchenAlert = {
  type: "bulk-prep" | "supervisor" | "efficiency"
  message: string
}

export function KitchenManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [alerts, setAlerts] = useState<KitchenAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [isAiEnabled, setIsAiEnabled] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null)
  const [spokenAlerts, setSpokenAlerts] = useState<Set<string>>(new Set())
  const [announcedOrders, setAnnouncedOrders] = useState<Set<string>>(new Set())
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)

  const announceAlerts = (newAlerts: KitchenAlert[]) => {
    if (!isVoiceEnabled || typeof window === "undefined") return

    newAlerts.forEach(alert => {
      if (!spokenAlerts.has(alert.message)) {
        const utterance = new SpeechSynthesisUtterance(alert.message.replace(/[^\w\s]/gi, ''))
        utterance.rate = 1.1 // Slightly faster for kitchen environment
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
        setSpokenAlerts(prev => new Set(prev).add(alert.message))
      }
    })
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        const pendingOrders = data.filter((o: Order) => o.status === "pending").sort((a: Order, b: Order) => a.orderNumber - b.orderNumber)
        
        // Announce new orders
        if (isVoiceEnabled && typeof window !== "undefined") {
          pendingOrders.forEach((order: Order) => {
            if (!announcedOrders.has(order.id)) {
              const utterance = new SpeechSynthesisUtterance(`NEW ORDER: #${order.orderNumber.toString().padStart(3, '0')}`)
              utterance.rate = 1.2
              window.speechSynthesis.speak(utterance)
              setAnnouncedOrders(prev => new Set(prev).add(order.id))
            }
          })
        }

        setOrders(pendingOrders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    if (!isAiEnabled) {
      setAlerts([])
      return
    }
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/kitchen/analyze")
      if (response.ok) {
        const data = await response.json()
        const newAlerts = data.alerts || []
        setAlerts(newAlerts)
        setLastAnalysisTime(new Date())
        if (newAlerts.length > 0) {
          announceAlerts(newAlerts)
        }
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    if (isAiEnabled) {
      fetchAlerts()
    }
    const orderInterval = setInterval(fetchOrders, 5000)
    const alertInterval = setInterval(() => {
      if (isAiEnabled) fetchAlerts()
    }, 15000) // Analyze every 15s
    return () => {
      clearInterval(orderInterval)
      clearInterval(alertInterval)
    }
  }, [isAiEnabled]) // Re-run when AI is toggled

  const toggleAi = () => {
    const newState = !isAiEnabled
    setIsAiEnabled(newState)
    if (newState) {
      // Trigger immediate analysis when enabling
      fetchAlerts()
    } else {
      setAlerts([])
    }
  }

  const completeOrder = async (id: string) => {
    try {
      await fetch(`/api/orders/${id}/done`, { method: "POST" })
      fetchOrders()
    } catch (error) {
      console.error("Failed to complete order:", error)
    }
  }

  const clearAllOrders = async () => {
    if (confirm("Are you sure you want to clear all orders?")) {
      try {
        await fetch("/api/seed") // The seed endpoint clears orders first
        setAnnouncedOrders(new Set())
        setSpokenAlerts(new Set())
        fetchOrders()
        fetchAlerts()
      } catch (error) {
        console.error("Failed to clear orders:", error)
      }
    }
  }

  const seedOrders = async () => {
    try {
      setLoading(true)
      await fetch("/api/seed")
      await fetchOrders()
      await fetchAlerts()
    } catch (error) {
      console.error("Failed to seed orders:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Control & Status */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-secondary/50 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${isAiEnabled ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,199,0,0.2)]" : "bg-muted text-muted-foreground"}`}>
            {isAnalyzing ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Bot className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white uppercase tracking-wider text-sm">Gemini Kitchen Intelligence</h3>
              {isAnalyzing && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] animate-pulse">
                  ANALYZING...
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {isAiEnabled 
                ? (isAnalyzing ? "Gemini is optimizing your kitchen flow..." : `Last analyzed ${lastAnalysisTime ? formatDistanceToNow(lastAnalysisTime, { addSuffix: true }) : "just now"}`)
                : "AI analysis is currently paused."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            variant="outline"
            className={`rounded-2xl w-12 h-12 p-0 border-white/10 transition-all duration-300 ${isVoiceEnabled ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground"}`}
            title={isVoiceEnabled ? "Mute Announcements" : "Unmute Announcements"}
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button 
            onClick={toggleAi}
            variant={isAiEnabled ? "default" : "outline"}
            className={`rounded-2xl font-bold gap-2 h-12 px-6 transition-all duration-500 ${
              isAiEnabled 
                ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(255,199,0,0.3)]" 
                : "border-white/10 text-white hover:bg-white/5"
            }`}
          >
            {isAiEnabled ? (
              <>
                <Power className="w-4 h-4" />
                AI ENABLED
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                AI DISABLED
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Kitchen Manager Alerts */}
      <AnimatePresence mode="popLayout">
        {isAiEnabled && alerts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {alerts.map((alert, idx) => {
              const isGrill = alert.message.includes("GRILL:")
              const isFry = alert.message.includes("FRY:")
              const isShake = alert.message.includes("SHAKE:")
              const isExpedite = alert.message.includes("EXPEDITE:")

              return (
                <Card key={idx} className={`border-2 transition-all duration-500 ${
                  isExpedite ? "border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : 
                  isGrill ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.1)]" : 
                  isFry ? "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.1)]" :
                  isShake ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]" :
                  "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(255,199,0,0.1)]"
                }`}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`p-2 rounded-xl mt-1 ${
                      isExpedite ? "bg-red-500/20 text-red-500" : 
                      isGrill ? "bg-orange-500/20 text-orange-500" : 
                      isFry ? "bg-yellow-500/20 text-yellow-500" :
                      isShake ? "bg-blue-500/20 text-blue-500" :
                      "bg-primary/20 text-primary"
                    }`}>
                      {isExpedite ? <AlertTriangle className="w-5 h-5" /> : 
                       isGrill ? <Zap className="w-5 h-5" /> : 
                       isFry ? <Zap className="w-5 h-5" /> :
                       isShake ? <Zap className="w-5 h-5" /> :
                       <Zap className="w-5 h-5" />}
                    </div>
                    <div className="font-black text-white leading-tight text-lg tracking-tight">
                      {alert.message}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-white tracking-tighter">ACTIVE <span className="text-primary">ORDERS</span></h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 rounded-lg">
            {orders.length} TOTAL
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={seedOrders} 
            variant="outline" 
            size="sm" 
            className="border-white/10 text-white hover:bg-white/5 rounded-xl font-bold gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            SEED DATA
          </Button>
          <Button 
            onClick={clearAllOrders} 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-bold"
          >
            CLEAR ALL
          </Button>
          <Button onClick={fetchOrders} variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl">
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-secondary/30 rounded-[3rem] border-2 border-dashed border-white/5">
            <div className="text-6xl mb-4 opacity-20">👨‍🍳</div>
            <div className="text-xl font-bold text-white">No pending orders</div>
            <p className="text-muted-foreground text-sm mt-2">The kitchen is currently clear.</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-2 border-white/5 bg-secondary/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden hover:border-primary/30 transition-all duration-300 group shadow-xl">
                <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Order Sequence</span>
                      <div className="flex items-baseline gap-2">
                        <CardTitle className="text-2xl font-black text-white">
                          #{ (order.orderNumber || 0).toString().padStart(3, '0') }
                        </CardTitle>
                        <span className="text-[10px] font-mono text-muted-foreground opacity-50">ID: {order.id}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-black/40 text-muted-foreground border-white/5 font-bold gap-1.5 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center font-black text-sm">
                            {item.quantity}
                          </div>
                          <span className="font-bold text-white">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => completeOrder(order.id)}
                    className="w-full bg-primary text-black hover:bg-primary/90 font-black rounded-2xl h-14 text-lg shadow-lg group-hover:scale-[1.02] transition-all duration-300"
                  >
                    <Check className="w-6 h-6 mr-2" />
                    MARK AS READY
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
