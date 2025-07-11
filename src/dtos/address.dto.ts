export interface AddressRequest {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
}

export interface AddressResponse {
  id: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
