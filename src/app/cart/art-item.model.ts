export interface CartItem {
    _id: string;
    desc: string;
    price: number; 
    quantity: number;
    stock: number;
    discount?: number; 
    brand?: string;
    originalPrice?: number; 
  }