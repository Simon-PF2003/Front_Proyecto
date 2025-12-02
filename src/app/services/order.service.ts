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

  //Obtener todos los pedidos (para el admin, es la parte de update)
  getPedidos(status?: string): Observable<any[]> {
    const url = status ? `${this.URL}/pedidos?status=${encodeURIComponent(status)}` : `${this.URL}/pedidos`;
    return this.http.get<any[]>(url);
  };

  //Obtiene el mail del usuario del pedido para comunicarle el cambio de estado
  getEmailByOrder(pedId: string){
    return this.http.get(`${this.URL}/getEmail/${pedId}`);
  }

  // Filtra los pedidos por su estado
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

  cambiarEstado(pedId:string, nuevoEstado:string)
  {
    const body = { status: nuevoEstado};
    console.log(body);
    return this.http.patch(`${this.URL}/changeStatus/${pedId}`, body);
  }
}

  