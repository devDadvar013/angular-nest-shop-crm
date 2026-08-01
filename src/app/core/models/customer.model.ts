/** Matches customers/customer.serializer.ts -> SerializedCustomer */
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  orders_count?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

/** Matches customers/dto/customer.dto.ts -> CreateCustomerDto */
export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

/** Matches customers/dto/customer.dto.ts -> UpdateCustomerDto */
export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** Matches customers/dto/list-customers.dto.ts */
export interface ListCustomersQuery {
  search?: string;
  page?: number;
  per_page?: number;
}
