/**
 * Interface for Product request data
 */
export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  isSale?: boolean;
  sizes?: string[];    // Available sizes (XS, S, M, L, XL, etc.)
  colors?: string[];   // Available colors
  material?: string;   // Fabric material (Cotton, Polyester, etc.)
  gender?: string;     // Target gender (Men, Women, Unisex, Children)
  style?: string;      // Clothing style (Casual, Formal, Sports, etc.)
  season?: string;     // Season appropriateness (Summer, Winter, etc.)
  category: string;    // category ID
  brand?: string;      // brand ID
  stock: number;
  productImages?: string[]; // array of image URLs
  isActive?: boolean;
}

/**
 * Interface for pagination response
 */
export interface PaginationResponse {
  page: number;
  totalPages: number;
  totalItems: number;
}
