// src/entities/Client.ts

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'prospect';
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface UpdateClientInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'prospect';
}

export class ClientEntity {
  static create(input: CreateClientInput): Client {
    const now = new Date();
    return {
      id: input.id || Date.now().toString(), // In real app, ID would come from server
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      company: input.company,
      taxId: input.taxId,
      notes: input.notes,
      status: input.status || 'prospect',
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(client: Client, updates: Partial<UpdateClientInput>): Client {
    return {
      ...client,
      ...updates,
      updatedAt: new Date(),
    };
  }
}