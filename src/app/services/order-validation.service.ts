import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../cart/art-item.model';
import { environment } from '../../environments/environment';

export interface StockValidationResult {
  valid: boolean;
  invalidItems: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
  message?: string;
}

export interface OrderRequest {
  items: CartItem[];
  total: number;
  userId: string;
  date: string;
  orderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderValidationService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Valida que todos los productos tengan stock suficiente
   * antes de crear el pedido
   */
  validateStockBeforeOrder(items: CartItem[]): Observable<StockValidationResult> {
    const validationRequest = {
      items: items.map(item => ({
        productId: item._id,
        requestedQuantity: item.quantity
      }))
    };

    console.log('Enviando validación de stock:', validationRequest);

    return this.http.post<StockValidationResult>(
      `${this.apiUrl}/orders/validate-stock`, 
      validationRequest
    );
  }

  /**
   * Crea una orden con validación de stock y actualización atómica
   * Todo en una sola transacción en el backend
   */
  generateOrder(orderData: OrderRequest): Observable<any> {
    console.log('Enviando orden:', orderData);
    
    return this.http.post(`${this.apiUrl}/orders`, orderData);
  }

  /**
   * Obtiene el stock actual de un producto específico
   */
  getCurrentStock(productId: string): Observable<{stock: number}> {
    return this.http.get<{stock: number}>(`${this.apiUrl}/products/${productId}/stock`);
  }
}
