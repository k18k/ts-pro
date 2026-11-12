export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
}

export type Order = {
  id: string
  customerId: string
  amount: number
  status: OrderStatus
}

let orders: Order[] = []

export function addOrder(order: any): void {
  if (order.amount == null) {
    order.amount = 0
  }
  orders.push(order)
}

export function getOrdersByStatus(status: OrderStatus, includeCancelled: boolean): Order[] {
  let result: Order[] = []
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].status == status || (includeCancelled && orders[i].status == OrderStatus.Cancelled)) {
      result.push(orders[i])
    }
  }
  return result
}

export function getOrderAmount(id: string): number {
  const order: any = orders.find((o) => o.id == id)
  if (!order) return -1
  return order.amount
}
