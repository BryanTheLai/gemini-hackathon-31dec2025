import { NextResponse } from "next/server"
import { globalStore } from "@/lib/store"

export async function POST() {
  globalStore.clearOrders()
  return NextResponse.json({ message: "All orders cleared" })
}
