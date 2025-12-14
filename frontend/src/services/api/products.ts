import { Product } from "@/types";
import api from "@/lib/api/client";

const PRODUCTS_ENDPOINT = "/tech/products/";

export interface CreateProductData {
  name: string;
  ean13?: string;
  sku?: string;
  serial_number?: string;
  image_url?: string;
  price: number;
  repair_price: number;
  special_price: number;
  other_price: number;
  brand?: number;
  model?: number;
}

export interface UpdateProductData {
  id: number;
  data: Partial<Product>;
}

export interface SearchProductsParams {
  page?: number;
  search?: string;
  brand?: number;
  model?: number;
  device_type?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export const productsApi = {
  /**
   * Fetch all products with optional filtering and pagination
   */
  fetchProducts: async (params: SearchProductsParams = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.brand) queryParams.append('brand', params.brand.toString());
    if (params.model) queryParams.append('model', params.model.toString());
    if (params.device_type) queryParams.append('device_type', params.device_type);
    if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
    if (params.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${PRODUCTS_ENDPOINT}?${queryString}` : PRODUCTS_ENDPOINT;
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch a specific product by ID
   */
  fetchProductById: async (id: number) => {
    const response = await api.get(`${PRODUCTS_ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (data: CreateProductData) => {
    const response = await api.post(PRODUCTS_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async ({ id, data }: UpdateProductData) => {
    const response = await api.patch(`${PRODUCTS_ENDPOINT}${id}/`, data);
    return response.data;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: number) => {
    const response = await api.delete(`${PRODUCTS_ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Search products with advanced filters
   */
  searchProducts: async (searchTerm: string) => {
    const response = await api.get(`${PRODUCTS_ENDPOINT}?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  /**
   * Get products by device type
   */
  getProductsByDeviceType: async (deviceType: string) => {
    const response = await api.get(`${PRODUCTS_ENDPOINT}?device_type=${deviceType}`);
    return response.data;
  }
};