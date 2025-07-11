
export interface BlogCategoryRequest {
  name: string;
  description?: string;
}

export interface BlogCategoryDTO {
  _id: string;
  name: string;
  description: string;
  slug: string;
  blogCount: number;
}

export interface BlogRequest {
  title: string;
  content: string;
  image?: string;
  status?: string;
  category: string; // category ID
  author?: string; // optional because it will be set from the authenticated user
  tags?: string[]; // array of tag IDs
}

export interface PaginationResponse {
  page: number;
  totalPages: number;
  totalItems: number;
}
