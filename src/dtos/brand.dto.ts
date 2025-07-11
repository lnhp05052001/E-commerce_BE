/**
 * Interface for Brand request data
 */
export interface BrandRequest {
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

/**
 * Interface for Brand Category Product DTO
 * Used for returning top brands with their associated categories/products
 */
export interface BrandCategoryProductDTO {
  _id: string;
  name: string;
  logo?: string;
  slug: string;
  productCount: number;
}
