import { getPriceByName } from "./menu";

export type OrderItem = { name: string; quantity: number; notes?: string; price?: number }
export type OrderRow = { id: string; orderNumber: number; items: OrderItem[]; status: "pending" | "completed"; total: number; createdAt: string }

// Use globalThis to persist data across hot reloads in development
const store = globalThis as unknown as { orders: OrderRow[]; nextOrderNumber: number };

if (!store.orders) {
  store.orders = [];
}
if (!store.nextOrderNumber) {
  store.nextOrderNumber = 1;
}

export const globalStore = {
  getOrders: () => {
    console.log("Fetching orders from store:", store.orders);
    return [...store.orders];
  },
  addOrder: (items: OrderItem[]) => {
    console.log("Adding order to store:", JSON.stringify(items, null, 2));
    const total = items.reduce((sum, item) => {
      const price = item.price || getPriceByName(item.name);
      console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${item.quantity}`);
      return sum + price * item.quantity;
    }, 0);
    const roundedTotal = Math.round(total * 100) / 100;
    console.log("Calculated Total:", roundedTotal);
    
    const orderNumber = store.nextOrderNumber++;
    const newOrder: OrderRow = {
      id: Math.random().toString(36).substring(2, 9),
      orderNumber,
      items,
      status: "pending",
      total: roundedTotal,
      createdAt: new Date().toISOString()
    };
    store.orders.push(newOrder);
    console.log(`New order #${orderNumber} added. Total orders:`, store.orders.length);
    return newOrder;
  },
  clearOrders: () => {
    store.orders = [];
    store.nextOrderNumber = 1;
    console.log("All orders cleared and counter reset");
  },
  updateOrderStatus: (id: string, status: "pending" | "completed") => {
    const order = store.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  }
};
