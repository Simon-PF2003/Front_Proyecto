import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadopagoService {
  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Crea una preferencia de pago en MercadoPago
   * @param orderId ID de la orden creada
   * @param paymentMethod Método de pago seleccionado
   * @returns Observable con la respuesta de MercadoPago
   */
  createPreference(orderId: string, paymentMethod: string = 'MercadoPago_Tarjeta'): Observable<any> {
    const body = { 
      orderId, 
      paymentMethod 
    };
    return this.http.post<any>(`${this.URL}/payments/mp/create-preference`, body);
  }

  /**
   * Crea una preferencia para pago con QR
   * @param orderId ID de la orden creada
   * @returns Observable con la respuesta de MercadoPago
   */
  createQRPreference(orderId: string): Observable<any> {
    const body = { orderId };
    return this.http.post<any>(`${this.URL}/payments/mp/create-qr`, body);
  }

  /**
   * Obtiene el estado de pago de una orden
   * @param orderId ID de la orden
   * @returns Observable con el estado del pago
   */
  getPaymentStatus(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/payments/mp/status/${orderId}`);
  }

  /**
   * Verifica directamente el estado del pago en MercadoPago
   * @param orderId ID de la orden
   * @returns Observable con el estado actualizado
   */
  checkPaymentStatusDirect(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.URL}/payments/mp/check/${orderId}`);
  }

  /**
   * Sincroniza el estado del pago con MercadoPago
   * @param orderId ID de la orden
   * @param force Forzar sincronización aunque esté en estado final
   * @returns Observable con el estado sincronizado
   */
  syncPaymentStatus(orderId: string, force: boolean = false): Observable<any> {
    let url = `${this.URL}/payments/mp/sync/${orderId}`;
    if (force) {
      url += '?force=true';
    }
    return this.http.get<any>(url);
  }

  /**
   * Verifica la salud de la integración con MercadoPago
   * @returns Observable con el estado del sistema
   */
  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.URL}/payments/mp/health`);
  }
}