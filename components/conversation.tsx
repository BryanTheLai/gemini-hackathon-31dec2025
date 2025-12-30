"use client"

import { useConversation } from "@11labs/react"
import { useCallback, useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { OrderBoard, type OrderItem } from "./order-board"
import { useToast } from "@/hooks/use-toast"
import { getPriceByName } from "@/lib/menu"

export function Conversation() {
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastOrderNumber, setLastOrderNumber] = useState<number | null>(null)
  const [draftOrder, setDraftOrder] = useState<OrderItem[]>([])
  const draftOrderRef = useRef<OrderItem[]>([])
  const { toast } = useToast()

  // Sync ref with state for tool access
  useEffect(() => {
    draftOrderRef.current = draftOrder
  }, [draftOrder])

  const total = draftOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true)
      setIsSpeaking(true)
    },
    onDisconnect: () => {
      setIsConnected(false)
      setIsSpeaking(false)
    },
    onMessage: (message) => {
      console.log("ElevenLabs Message:", message)
    },
    onError: (error: any) => {
      console.error("ElevenLabs Error:", error)
      setError(error?.message || "An unknown error occurred")
    },
    // Client-side tools for ElevenLabs
    clientTools: {
      update_order_board: async ({ items }: { items: string | OrderItem[] }) => {
        console.log("Tool Call: update_order_board", items)
        try {
          const parsedItems = typeof items === "string" ? JSON.parse(items) : items
          
          // Ensure each item has a price
          const itemsWithPrices = parsedItems.map((item: OrderItem) => ({
            ...item,
            price: item.price || getPriceByName(item.name)
          }))
          
          setDraftOrder(itemsWithPrices)
          return "Order board updated successfully"
        } catch (err) {
          console.error("Failed to parse order items:", err)
          return "Error updating order board: Invalid format"
        }
      },
      submit_order: async () => {
        console.log("Tool Call: submit_order. Current items in ref:", draftOrderRef.current)
        
        const currentOrder = draftOrderRef.current
        if (currentOrder.length === 0) {
          console.warn("submit_order called but order is empty")
          return "Order is empty. Please add items before submitting."
        }
        
        setIsSubmitting(true)
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: currentOrder }),
          })
          
          if (response.ok) {
            const data = await response.json()
            setDraftOrder([])
            setLastOrderNumber(data.orderNumber)
            toast({
              title: "Order Submitted!",
              description: `Order #${data.orderNumber.toString().padStart(3, '0')} has been sent to the kitchen.`,
            })
            
            // Reset success message after 5 seconds
            setTimeout(() => setLastOrderNumber(null), 5000)
            
            return `Order submitted successfully as #${data.orderNumber}. The customer can now proceed.`
          }
          const errorData = await response.json()
          console.error("Order submission failed:", errorData)
          return `Failed to submit order: ${errorData.error || 'Unknown error'}`
        } catch (err) {
          console.error("Error in submit_order tool:", err)
          return "Error submitting order to the server."
        } finally {
          setIsSubmitting(false)
        }
      }
    }
  })

  const startConversation = useCallback(async () => {
    try {
      console.log("Voice: Starting conversation session...")
      setError(null)
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("Voice: Microphone permission granted")

      // Fetch the signed URL from our API
      const response = await fetch("/api/conversation-token")
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to get token: ${response.statusText || response.status}`)
      }
      const { signedUrl } = await response.json()

      if (!signedUrl) {
        throw new Error("No signed URL returned from API")
      }

      console.log("Voice: Connecting to ElevenLabs...")
      // Start the conversation with the signed URL
      await conversation.startSession({
        signedUrl, // Use the signed URL directly
      })
    } catch (err) {
      console.error("Voice: Failed to start conversation:", err)
      setError(err instanceof Error ? err.message : "Failed to start conversation")
    }
  }, [conversation])

  const stopConversation = useCallback(async () => {
    try {
      console.log("Voice: Ending conversation session...")
      await conversation.endSession()
    } catch (err) {
      console.error("Voice: Failed to stop conversation:", err)
    }
  }, [conversation])

  return (
    <div className="h-full flex flex-col gap-8 min-h-0">
      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Order Board */}
        <div className="min-h-0">
          <OrderBoard items={draftOrder} total={total} />
        </div>

        {/* Voice Interface */}
        <Card className="border-2 border-white/5 bg-black/40 backdrop-blur-md rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <CardHeader className="py-4 border-b border-white/5">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-white">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              Gemini Drive-Thru
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative">
            <div className="relative flex items-center justify-center">
              <AnimatePresence>
                {isConnected && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "mirror" }}
                      className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"
                    />
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0.5 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, repeatType: "mirror", delay: 0.5 }}
                      className="absolute inset-0 border-2 border-primary/30 rounded-full"
                    />
                  </>
                )}
              </AnimatePresence>
              
              <Button
                size="lg"
                className={`w-32 h-32 rounded-full shadow-2xl transition-all duration-500 z-10 ${
                  isConnected 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/40 scale-110" 
                    : "bg-primary hover:bg-primary/90 shadow-primary/40 hover:scale-105"
                }`}
                onClick={isConnected ? stopConversation : startConversation}
              >
                {isConnected ? (
                  <MicOff className="w-12 h-12 text-white" />
                ) : (
                  <Mic className="w-12 h-12 text-black" />
                )}
              </Button>
            </div>

            <div className="text-center space-y-3 z-10">
              <div className={`text-2xl font-black tracking-tight ${isConnected ? "text-primary" : "text-white"}`}>
                {isSubmitting ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    Submitting Order...
                  </motion.span>
                ) : lastOrderNumber ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-green-500 flex flex-col items-center gap-2"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                    <span>ORDER #{lastOrderNumber.toString().padStart(3, '0')} SENT!</span>
                  </motion.div>
                ) : isConnected ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    I'm Listening...
                  </motion.span>
                ) : "Ready to Order?"}
              </div>
              {!lastOrderNumber && (
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto font-medium">
                  {isSubmitting 
                    ? "Sending your order to the kitchen..."
                    : isConnected 
                      ? "Tell me what you'd like to eat today." 
                      : "Tap the mic to start your order."}
                </p>
              )}
            </div>

            {/* Error Message - Centered and Styled */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-8 right-8"
                >
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 rounded-2xl backdrop-blur-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
