/**
 * Interface for Contact request data
 */
export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

/**
 * Interface for Contact response data
 */
export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for pagination response
 */
export interface PaginationResponse {
  page: number;
  totalPages: number;
  totalItems: number;
}
