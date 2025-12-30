"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MENU_ITEMS } from "@/lib/menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function Menu() {
  const [selectedItem, setSelectedItem] = useState<any>(null)

  return (
    <>
      <Card className="h-full border-2 border-white/5 bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl">📋</span> Menu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 custom-scrollbar overflow-y-auto h-[calc(100%-80px)]">
          {MENU_ITEMS.map((section, index) => (
            <div key={section.category}>
              <h3 className="text-xs font-black mb-4 text-primary/60 uppercase tracking-[0.3em] flex items-center gap-2">
                {section.category}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {section.items.map((item) => (
                  <div 
                    key={item.name} 
                    onClick={() => setSelectedItem(item)}
                    className="flex justify-between items-center group p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 cursor-pointer"
                  >
                    <div className="flex gap-4 items-center">
                      <span className="text-3xl bg-secondary w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors text-base">{item.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 font-medium">{item.description}</div>
                        <div className="text-[10px] text-primary/40 font-bold mt-0.5">{item.nutrition}</div>
                      </div>
                    </div>
                    <div className="font-black text-primary text-lg">${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              {index < MENU_ITEMS.length - 1 && <Separator className="my-6 bg-white/5" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-black/90 border-2 border-primary/20 backdrop-blur-xl rounded-[2.5rem] p-8 max-w-md">
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center text-6xl shadow-2xl border border-white/5">
                  {selectedItem.icon}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <DialogTitle className="text-3xl font-black text-white tracking-tighter">
                  {selectedItem.name.toUpperCase()}
                </DialogTitle>
                <div className="text-2xl font-black text-primary">
                  ${selectedItem.price.toFixed(2)}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Ingredients & Description</h4>
                  <p className="text-white/80 text-sm leading-relaxed font-medium">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Nutritional Info</h4>
                  <div className="text-primary font-bold text-xs">
                    {selectedItem.nutrition}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
