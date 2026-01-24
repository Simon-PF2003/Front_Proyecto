import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../cart/art-item.model';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiConfigService } from './api-config.service';
@Injectable({
  providedIn: 'root'
})
export class CartServiceService {
  private cartItems: CartItem[] = [];
  private apiUrl: string;
  

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getApiBaseUrl();
    this.loadCartItems()
  }

  /**
   * Agrega un producto al carrito con validación de stock en tiempo real
   */
  addToCart(item: CartItem): Observable<boolean> {
    return new Observable(observer => {
      const existingItemIndex = this.cartItems.findIndex(cartItem => cartItem._id === item._id);
    
      if (existingItemIndex !== -1) {
        console.log("El item ya está en el carrito.");
        Swal.fire({
          title: 'Producto repetido',
          text: "Puedes agregar más de este producto yendo a tu carrito",
          icon: 'warning'
        });
        observer.next(false);
        observer.complete();
        return;
      }

      // Validar stock actual antes de agregar
      this.validateCurrentStock(item._id, item.quantity).subscribe({
        next: (stockValid) => {
          if (stockValid) {
            this.cartItems.push(item);
            this.saveCartItems();
            observer.next(true);
          } else {
            Swal.fire({
              title: 'Stock insuficiente',
              text: `No hay suficiente stock para ${item.desc}`,
              icon: 'warning'
            });
            observer.next(false);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Error validando stock:', error);
          // En caso de error, agregar sin validación (fallback)
          this.cartItems.push(item);
          this.saveCartItems();
          observer.next(true);
          observer.complete();
        }
      });
    });
  }

  /**
   * Valida si hay stock suficiente para una cantidad específica
   */
  private validateCurrentStock(productId: string, quantity: number): Observable<boolean> {
    return new Observable(observer => {
      this.http.get<{stock: number}>(`${this.apiUrl}/products/${productId}/stock`).subscribe({
        next: (response) => {
          observer.next(response.stock >= quantity);
          observer.complete();
        },
        error: (error) => {
          console.error('Error obteniendo stock:', error);
          observer.next(true); // En caso de error, permitir agregar
          observer.complete();
        }
      });
    });
  }
  
  getCartItems(): CartItem[] {
    this.loadCartItems();
    return this.cartItems;
  }

  /**
   * Actualiza la cantidad con validación de stock
   */
  updateQuantity(productId: string, newQuantity: number): Observable<boolean> {
    return new Observable(observer => {
      const item = this.cartItems.find((cartItem) => cartItem._id === productId);
      if (!item) {
        observer.next(false);
        observer.complete();
        return;
      }

      if (newQuantity < 1) {
        item.quantity = 1;
        this.saveCartItems();
        observer.next(true);
        observer.complete();
        return;
      }

      // Validar stock antes de actualizar
      this.validateCurrentStock(productId, newQuantity).subscribe({
        next: (stockValid) => {
          if (stockValid) {
            item.quantity = newQuantity;
            this.saveCartItems();
            observer.next(true);
          } else {
            Swal.fire({
              title: 'Stock insuficiente',
              text: `No hay suficiente stock para la cantidad solicitada de ${item.desc}`,
              icon: 'warning'
            });
            observer.next(false);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Error validando stock:', error);
          // Usar validación local como fallback
          if (item.stock >= newQuantity) {
            item.quantity = newQuantity;
            this.saveCartItems();
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        }
      });
    });
  }

  removeFromCart(productId: string) {
    const index = this.cartItems.findIndex((cartItem) => cartItem._id === productId);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.saveCartItems();
    }
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
  }
  
  calculateProductsInCart(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity , 0);
  }
  
  private saveCartItems() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

private loadCartItems() {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      const parsedItems = JSON.parse(savedCartItems);

      if (Array.isArray(parsedItems)) {
        this.cartItems = parsedItems; // Si los datos guardados son un array, asignarlos directamente
      } else {
        this.cartItems = []; // Si no es un array, inicializar como un array vacío
      }
    } else {
      this.cartItems = []; // Si no hay datos guardados, inicializar como un array vacío
    }
  }
}

