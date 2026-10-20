import { apiClient } from './api';
import {
  Order,
  CreateOrderPayload,
  CreateOrderResponse,
  OrderListResponse,
  OrderDetailResponse
} from '../types/order';

/**
 * Generates a unique, cryptographically random idempotency key.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export const orderService = {
  /**
   * Submits a new verified order to the backend.
   * Transmits the provided idempotency key in both header and body.
   */
  async createOrder(
    payload: CreateOrderPayload,
    idempotencyKey?: string
  ): Promise<CreateOrderResponse> {
    const key = idempotencyKey || payload.idempotencyKey;
    const headers: Record<string, string> = {};
    if (key) {
      headers['Idempotency-Key'] = key;
    }

    const bodyPayload = {
      ...payload,
      idempotencyKey: key
    };

    return await apiClient<CreateOrderResponse>('/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload)
    });
  },

  /**
   * Retrieves the current authenticated user's order history with pagination.
   */
  async getOrders(page: number = 1, limit: number = 10): Promise<OrderListResponse> {
    return await apiClient<OrderListResponse>(`/orders?page=${page}&limit=${limit}`);
  },

  /**
   * Retrieves a single order by MongoDB _id or human-readable orderNumber.
   */
  async getOrderById(id: string): Promise<Order> {
    const res = await apiClient<OrderDetailResponse>(`/orders/${encodeURIComponent(id)}`);
    return res.order;
  }
};
