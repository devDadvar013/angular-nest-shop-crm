import { Customer } from './customer.model';
import { Product } from './product.model';

/** Matches orders/schemas/order.schema.ts -> OrderStatus */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** Matches orders/order.serializer.ts -> SerializedOrderItem */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

/** Matches orders/order.serializer.ts -> SerializedOrder */
export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  status_label: string;
  total_amount: number;
  notes: string | null;
  shipping_address: string | null;
  customer_id: number;
  customer?: Customer;
  items?: OrderItem[];
  items_count?: number;
  created_at: string;
  updated_at: string;
}

/** Matches orders/order.serializer.ts -> ORDER_STATUS_OPTIONS */
export interface OrderStatusOption {
  value: OrderStatus;
  label: string;
  color: string;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

/** Matches orders/dto/create-order.dto.ts */
export interface CreateOrderRequest {
  customer_id: number;
  status?: OrderStatus;
  notes?: string;
  shipping_address?: string;
  items: OrderItemInput[];
}

/** Matches orders/dto/update-order.dto.ts -> UpdateOrderDto */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  notes?: string;
  shipping_address?: string;
}

/** Matches orders/dto/update-order.dto.ts -> UpdateOrderStatusDto */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/** Matches orders/dto/list-orders.dto.ts */
export interface ListOrdersQuery {
  status?: OrderStatus;
  search?: string;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

/** Matches OrdersService.stats() return shape */
export interface OrderStats {
  total: number;
  pending: number;
  revenue: number;
  today: number;
}
