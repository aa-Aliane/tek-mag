// src/entities/Repair.ts

export interface RepairItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  problemDescription: string;
  estimatedCost?: number;
  status: 'received' | 'diagnosing' | 'repairing' | 'awaiting_parts' | 'ready' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Repair {
  id: string;
  clientId: string;
  clientName: string;
  repairNumber: string;
  item: RepairItem;
  receptionDate: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  technician?: string;
  cost?: number;
  status: 'received' | 'diagnosing' | 'repairing' | 'awaiting_parts' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRepairInput {
  clientId: string;
  clientName: string;
  item: Omit<RepairItem, 'id'>;
  receptionDate: Date;
  estimatedCompletionDate?: Date;
  technician?: string;
  cost?: number;
  notes?: string;
  internalNotes?: string;
  status?: 'received' | 'diagnosing' | 'repairing' | 'awaiting_parts' | 'ready' | 'delivered' | 'cancelled';
}

export interface UpdateRepairInput {
  id: string;
  clientId?: string;
  clientName?: string;
  item?: Partial<Omit<RepairItem, 'id'>>;
  receptionDate?: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  technician?: string;
  cost?: number;
  status?: 'received' | 'diagnosing' | 'repairing' | 'awaiting_parts' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  internalNotes?: string;
}

export class RepairEntity {
  static create(input: CreateRepairInput): Repair {
    const now = new Date();
    
    const newItem: RepairItem = {
      id: `item-${Date.now()}`,
      ...input.item,
      status: input.status || 'received',
      priority: input.item.priority || 'medium',
    };
    
    return {
      id: Date.now().toString(), // In real app, ID would come from server
      repairNumber: `REP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${Date.now()}`,
      clientId: input.clientId,
      clientName: input.clientName,
      item: newItem,
      receptionDate: input.receptionDate,
      estimatedCompletionDate: input.estimatedCompletionDate,
      technician: input.technician,
      cost: input.cost,
      status: input.status || 'received',
      notes: input.notes,
      internalNotes: input.internalNotes,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(repair: Repair, updates: Partial<UpdateRepairInput>): Repair {
    return {
      ...repair,
      ...updates,
      item: updates.item ? { ...repair.item, ...updates.item } : repair.item,
      updatedAt: new Date(),
    };
  }
}