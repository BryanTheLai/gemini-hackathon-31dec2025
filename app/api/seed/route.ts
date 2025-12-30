import { NextResponse } from "next/server"
import { globalStore } from "@/lib/store"

export async function GET() {
  // Clear existing orders
  globalStore.clearOrders()

  // Add some sample orders
  globalStore.addOrder([
    { name: "Gemini Classic", quantity: 2, notes: "No pickles", price: 5.99 },
    { name: "Asteroid Fries", quantity: 1, price: 2.99 }
  ])

  globalStore.addOrder([
    { name: "Double Nebula", quantity: 1, price: 7.99 },
    { name: "Galaxy Shake", quantity: 2, price: 4.99 }
  ])

  globalStore.addOrder([
    { name: "Gemini Classic", quantity: 3, price: 5.99 },
    { name: "Asteroid Fries", quantity: 2, price: 2.99 },
    { name: "Nebula Soda", quantity: 1, price: 1.99 }
  ])

  globalStore.addOrder([
    { name: "Gemini Classic", quantity: 1, price: 5.99 },
    { name: "Onion Rings", quantity: 2, price: 3.49 }
  ])

  globalStore.addOrder([
    { name: "Double Nebula", quantity: 2, price: 7.99 },
    { name: "Asteroid Fries", quantity: 3, price: 2.99 }
  ])

  globalStore.addOrder([
    { name: "Galaxy Shake", quantity: 4, notes: "Extra stars", price: 4.99 }
  ])

  return NextResponse.json({ message: "Seeded successfully", orders: globalStore.getOrders() })
}
