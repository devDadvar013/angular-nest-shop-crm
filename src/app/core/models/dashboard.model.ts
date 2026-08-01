import { OrderStatus } from './order.model';

/** Matches DashboardService.summary() return shape (already { data: ... } wrapped by the controller) */
export interface DashboardSummary {
  range_days: number;
  total_revenue: number;
  orders_count: number;
  pending_orders: number;
  customers_count: number;
  products_count: number;
  low_stock_count: number;
  average_order_value: number;
  status_breakdown: Record<OrderStatus, number>;
  daily_revenue: { date: string; total: number; orders: number }[];
}

/** Matches DashboardService.topProducts() return shape */
export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  sold: number;
  revenue: number;
}
