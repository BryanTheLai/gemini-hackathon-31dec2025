import { Conversation } from "@/components/conversation"
import { Menu } from "@/components/menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChefHat } from "lucide-react"

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden p-8 flex flex-col bg-black">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(255,199,0,0.4)] rotate-3">
            🍔
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white leading-none">
              HUMAN<span className="text-primary">LESS</span>
            </h1>
            <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase mt-1">24/7 Drive-Thru. Zero Humans.</p>
          </div>
        </div>
        <Link href="/kitchen">
          <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-black font-bold rounded-xl px-6">
            <ChefHat className="w-4 h-4" />
            KITCHEN VIEW
          </Button>
        </Link>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        {/* Left Column: Menu */}
        <div className="col-span-4 h-full min-h-0">
          <Menu />
        </div>
        
        {/* Right Column: Interaction & Order Board */}
        <div className="col-span-8 flex flex-col gap-8 min-h-0">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white">
                THE END OF <span className="text-primary">SERVICE</span>
              </h2>
              <p className="text-muted-foreground text-base font-medium">
                Speak naturally. No humans. No friction. Just food.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-2xl bg-secondary border border-border flex items-center gap-3 shadow-xl">
                <span className="text-xl">🗣️</span>
                <span className="text-[11px] text-muted-foreground uppercase font-black tracking-widest">ElevenLabs</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-secondary border border-border flex items-center gap-3 shadow-xl">
                <span className="text-xl">🧠</span>
                <span className="text-[11px] text-muted-foreground uppercase font-black tracking-widest">Gemini 2.5</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <Conversation />
          </div>
        </div>
      </div>
    </main>
  )
}
