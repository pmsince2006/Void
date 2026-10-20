export type PaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  sku?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderShippingAddress {
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customer: OrderCustomer;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  idempotencyKey?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
}

export interface OrderListResponse {
  status: string;
  orders: Order[];
  pagination: OrderPagination;
}

export interface OrderDetailResponse {
  status: string;
  order: Order;
}

export interface CreateOrderPayload {
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
    email: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  items?: Array<{
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  notes?: string;
  idempotencyKey?: string;
}

export interface CreateOrderResponse {
  status: string;
  message?: string;
  order: Order;
  cartCleared?: boolean;
}
