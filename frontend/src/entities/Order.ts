// src/entities/Order.ts

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  description?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  clientId: string;
  clientName: string;
  items: Omit<OrderItem, 'id' | 'total'>[];
  currency?: string;
  status?: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
}

export interface UpdateOrderInput {
  id: string;
  clientId?: string;
  clientName?: string;
  items?: Omit<OrderItem, 'id' | 'total'>[];
  status?: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  deliveryDate?: Date;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
}

export class OrderEntity {
  static create(input: CreateOrderInput): Order {
    const now = new Date();
    const itemsWithIds = input.items.map((item, idx) => ({
      ...item,
      id: `order-item-${idx}-${Date.now()}`,
      total: item.quantity * item.unitPrice,
    }));
    
    const subtotal = itemsWithIds.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.2; // 20% tax as default
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      id: Date.now().toString(), // In real app, ID would come from server
      orderNumber: `ORD-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Date.now()}`,
      clientId: input.clientId,
      clientName: input.clientName,
      items: itemsWithIds,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: input.currency || 'USD',
      status: input.status || 'draft',
      orderDate: input.orderDate,
      deliveryDate: input.deliveryDate,
      notes: input.notes,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      paymentStatus: input.paymentStatus || 'pending',
      paymentMethod: input.paymentMethod,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(order: Order, updates: Partial<UpdateOrderInput>): Order {
    const updatedItems = updates.items 
      ? updates.items.map((item, idx) => ({
          ...item,
          id: `order-item-${idx}-${Date.now()}`,
          total: item.quantity * item.unitPrice,
        }))
      : order.items;
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = order.taxRate;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      ...order,
      ...updates,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
      updatedAt: new Date(),
    };
  }
}