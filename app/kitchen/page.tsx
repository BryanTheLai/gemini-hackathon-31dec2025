import { KitchenManager } from "@/components/kitchen-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function KitchenPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-black">
      <header className="flex justify-between items-center mb-12 container mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
              <ArrowLeft className="w-8 h-8" />
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            KITCHEN <span className="text-primary">DISPLAY</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-full border border-border">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <span className="text-sm font-bold text-white uppercase tracking-widest">System Online</span>
        </div>
      </header>

      <div className="container mx-auto">
        <KitchenManager />
      </div>
    </main>
  )
}
