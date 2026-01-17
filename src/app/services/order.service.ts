import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem } from '../cart/art-item.model';

export interface StockValidationResult {
  valid: boolean;
  invalidItems: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
    error: string;
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
export class OrderService {

  private URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS
  
  /**
   * Crea una nueva orden con validación de stock y transacciones atómicas
   * Esta es la función principal para crear órdenes
   */
  generateOrder(orderData: OrderRequest): Observable<any> {
    console.log('Creando orden:', orderData);
    return this.http.post<any>(this.URL + '/generateNewOrder', orderData);
  }

  /**
   * Valida que todos los productos tengan stock suficiente antes de crear el pedido
   */
  validateStockBeforeOrder(items: CartItem[]): Observable<StockValidationResult> {
    const validationRequest = {
      items: items.map(item => ({
        productId: item._id,
        requestedQuantity: item.quantity
      }))
    };

    return this.http.post<StockValidationResult>(
      `${this.URL}/orders/validate-stock`, 
      validationRequest
    );
  }

  /**
   * @deprecated Usar generateOrder() en su lugar
   */
  createNewOrder(orderData: any): Observable<any> {
    console.log('Método obsoleto, usar generateOrder()');
    return this.generateOrder(orderData);
  }

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
  // Mis pedidos
  getPedidosUsuario(userId: string) {
    return this.http.get(`${this.URL}/orders/${userId}`);
  };

  /**
   * Obtener todos los pedidos (para el admin, parte de update)
   * @param status - Filtro opcional por estado (legacy, mantener por compatibilidad)
   */
  getPedidos(status?: string): Observable<any[]> {
    const url = status ? `${this.URL}/pedidos?status=${encodeURIComponent(status)}` : `${this.URL}/pedidos`;
    return this.http.get<any[]>(url);
  };

  getPedidosWithFilters(filters: {
    businessName?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string[];
    billed?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;      // Campo por el cual ordenar: 'createdAt', 'code', 'total'
    sortOrder?: string;   // Dirección: 'asc' o 'desc'
  }): Observable<any[]> {

    let params: any = {};
    
    if (filters.businessName) params.businessName = filters.businessName;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.status && filters.status.length > 0) params.status = filters.status.join(',');
    if (filters.billed !== undefined) params.billed = filters.billed.toString();
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice.toString();
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice.toString();
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return this.http.get<any[]>(`${this.URL}/pedidos/filtered`, { params });
  }

  /**
   * @deprecated El backend ahora envía el email automáticamente al actualizar pedidos.
   * Ya no es necesario llamar a este endpoint desde el frontend.
   * Mantener solo por compatibilidad con código legacy.
   */
  getEmailByOrder(pedId: string){
    return this.http.get(`${this.URL}/getEmail/${pedId}`);
  }

  // Filtra los pedidos por su estado (legacy - usar getPedidosWithFilters en su lugar)
  getOrdersFiltered(searchTerm: string): Observable<any[]> {
    console.log(searchTerm, 'service');
    const url = `${this.URL}/searchOrders/${searchTerm}`;
    console.log(url);
    return this.http.get<any[]>(url);
  }
  
  //Para la parte de facturacion
  getFinishedOrders(filters: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/finishedOrders`, { params: filters });
  }


//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH

  cancelOrder(userId: string) {
    const body = { status: 'cancelado' };
    return this.http.patch(`${this.URL}/cancelOrder/${userId}`, body);
  };

  /**
   * @deprecated Usar updatePedidoMultipleFields() en su lugar para actualizar pedidos.
   * Esta función solo actualiza el estado, mientras que updatePedidoMultipleFields
   * permite actualizar múltiples campos (status, payment_status, payment_method).
   */
  cambiarEstado(pedId:string, nuevoEstado:string)
  {
    const body = { status: nuevoEstado};
    console.log(body);
    return this.http.patch(`${this.URL}/changeStatus/${pedId}`, body);
  }

  updatePedidoMultipleFields(pedId: string, updateData: {
    status?: string;
    payment_status?: string;
    payment_method?: string;
  }): Observable<any> {
    console.log(`Actualizando pedido ${pedId} con:`, updateData);
    return this.http.patch(`${this.URL}/pedidos/${pedId}`, updateData);
  }
}

  