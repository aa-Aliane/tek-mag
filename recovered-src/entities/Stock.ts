// src/entities/Stock.ts

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  supplier?: string;
  unitPrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  location?: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'discontinued';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStockItemInput {
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand?: string;
  supplier?: string;
  unitPrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  location?: string;
  barcode?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  notes?: string;
}

export interface UpdateStockItemInput {
  id: string;
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  brand?: string;
  supplier?: string;
  unitPrice?: number;
  sellingPrice?: number;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
  barcode?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  notes?: string;
}

export class StockEntity {
  static create(input: CreateStockItemInput): StockItem {
    const now = new Date();
    return {
      id: Date.now().toString(), // In real app, ID would come from server
      name: input.name,
      sku: input.sku,
      description: input.description,
      category: input.category,
      brand: input.brand,
      supplier: input.supplier,
      unitPrice: input.unitPrice,
      sellingPrice: input.sellingPrice,
      quantity: input.quantity,
      minStockLevel: input.minStockLevel,
      maxStockLevel: input.maxStockLevel,
      location: input.location,
      barcode: input.barcode,
      status: input.status || 'active',
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(stockItem: StockItem, updates: Partial<UpdateStockItemInput>): StockItem {
    return {
      ...stockItem,
      ...updates,
      updatedAt: new Date(),
    };
  }
  
  static isLowStock(stockItem: StockItem): boolean {
    return stockItem.quantity <= stockItem.minStockLevel;
  }
  
  static calculateTotalValue(stockItem: StockItem): number {
    return stockItem.quantity * stockItem.unitPrice;
  }
}