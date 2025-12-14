import { StoreOrder } from "@/types";
import api from "@/lib/api/client";

const STORE_ORDERS_ENDPOINT = "/tech/store-orders/";

export interface CreateStoreOrderData {
  order_name: string;
  description?: string;
  suppliers: number[];
  estimated_delivery_date?: string;
  notes?: string;
  reference?: string;
}

export interface UpdateStoreOrderData {
  id: number;
  data: Partial<StoreOrder>;
}

export const commandsApi = {
  /**
   * Fetch all store orders with optional pagination
   */
  fetchStoreOrders: async (page: number = 1) => {
    const response = await api.get(`${STORE_ORDERS_ENDPOINT}?page=${page}`);
    return response.data;
  },

  /**
   * Fetch a specific store order by ID
   */
  fetchStoreOrderById: async (id: number) => {
    const response = await api.get(`${STORE_ORDERS_ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Create a new store order
   */
  createStoreOrder: async (data: CreateStoreOrderData) => {
    const response = await api.post(STORE_ORDERS_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an existing store order
   */
  updateStoreOrder: async ({ id, data }: UpdateStoreOrderData) => {
    const response = await api.patch(`${STORE_ORDERS_ENDPOINT}${id}/`, data);
    return response.data;
  },

  /**
   * Delete a store order
   */
  deleteStoreOrder: async (id: number) => {
    const response = await api.delete(`${STORE_ORDERS_ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Update the status of a store order
   */
  updateStoreOrderStatus: async (id: number, status: string) => {
    const response = await api.patch(`${STORE_ORDERS_ENDPOINT}${id}/`, {
      status: status  // Send to the backend field name
    });
    return response.data;
  }
};