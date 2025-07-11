// Cart request DTO for adding item to cart
export interface CartAddItemRequest {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

// Cart update request DTO
export interface CartUpdateRequest {
    quantity: number;
}

// Cart response interfaces
export interface CartItemResponse {
    id: string;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        sizes?: string[];
        colors?: string[];
    };
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
}

export interface CartResponse {
    id: string;
    user: string;
    items: CartItemResponse[];
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
