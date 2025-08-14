import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  createNewOrder (orderData: any): Observable<any> {
    console.log('intente', orderData)
    return this.http.post<any>(this.URL + '/generateNewOrder', orderData);
  };

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
  // Mis pedidos
  getPedidosUsuario(userId: string) {
    return this.http.get(`${this.URL}/orders/${userId}`);
  };

  //Obtener todos los pedidos (para el admin, es la parte de update)
  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/pedidos');
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

  