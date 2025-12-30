import { NextResponse } from "next/server"
import { globalStore } from "@/lib/store"

export async function GET() {
  const orders = globalStore.getOrders()
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("API: Received new order request:", JSON.stringify(body, null, 2))
    
    // Validate body
    if (!body.items || !Array.isArray(body.items)) {
      console.warn("API: Invalid order data received:", body)
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    const order = globalStore.addOrder(body.items)
    console.log("API: Order successfully created and stored:", order.id)
    
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
