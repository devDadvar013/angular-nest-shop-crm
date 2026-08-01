/** Matches products/product.serializer.ts -> SerializedProduct */
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches products/dto/create-product.dto.ts */
export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active?: boolean;
}

/** Matches products/dto/update-product.dto.ts (PartialType of create) */
export type UpdateProductRequest = Partial<CreateProductRequest>;

export type ProductSort = 'latest' | 'price_asc' | 'price_desc' | 'name' | 'stock';

/** Matches products/dto/list-products.dto.ts */
export interface ListProductsQuery {
  search?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: ProductSort;
  page?: number;
  per_page?: number;
}

/** Matches ProductsService.stats() return shape */
export interface ProductStats {
  total: number;
  active: number;
  low_stock: number;
  out_of_stock: number;
  inventory_value: number;
}
