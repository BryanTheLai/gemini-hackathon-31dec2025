"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type OrderItem = {
  name: string
  quantity: number
  price: number
  notes?: string
}

interface OrderBoardProps {
  items: OrderItem[]
  total: number
}

export function OrderBoard({ items, total }: OrderBoardProps) {
  return (
    <Card className="border-2 border-primary/30 bg-black/40 backdrop-blur-md rounded-3xl shadow-[0_0_40px_rgba(255,199,0,0.1)] h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-primary/5 py-4 border-b border-primary/10">
        <CardTitle className="text-xl font-black flex items-center gap-3 text-primary">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
          Current Order
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-6 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-5xl opacity-20"
                >
                  🍔
                </motion.div>
                <div className="space-y-1">
                  <p className="text-white font-bold text-lg">Your order is empty</p>
                  <p className="text-muted-foreground text-xs max-w-[180px] mx-auto">
                    "I'd like a Gemini Classic and some fries please"
                  </p>
                </div>
              </motion.div>
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex justify-between items-center group bg-white/5 p-3 rounded-2xl border border-white/5"
                >
                  <div className="flex gap-3 items-center">
                    <Badge className="bg-primary text-black font-black h-6 w-6 flex items-center justify-center p-0 text-xs rounded-lg">
                      {item.quantity}
                    </Badge>
                    <div className="font-bold text-white text-base">{item.name}</div>
                  </div>
                  <div className="font-black text-primary text-base">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Total Amount</div>
            <div className="text-3xl font-black text-primary">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
