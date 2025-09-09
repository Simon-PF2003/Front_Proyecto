import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface CartItem {
  _id: string;            // productId
  code?: string;
  desc?: string;
  brand?: any;
  cat?: any;
  image?: string;
  stock?: number;
  stockMin?: number;
  price?: number;
  // cualquier otro campo que ya estés usando en la tarjeta
  quantityToBuy: number;
}

type SupplierId = string;
type CartsState = Record<SupplierId, CartItem[]>;

const LS_KEY = 'supplierCarts:v1';

function loadFromLS(): CartsState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch {
    return {};
  }
}

function saveToLS(state: CartsState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

@Injectable({ providedIn: 'root' })
export class StockCartService {
  private state$ = new BehaviorSubject<CartsState>(loadFromLS());
  private currentSupplierId$ = new BehaviorSubject<SupplierId | null>(null);

  // ---- Gestión del proveedor actual (opcional pero muy cómodo)
  setCurrentSupplier(id: SupplierId | null) {
    this.currentSupplierId$.next(id);
  }
  get currentSupplierId(): SupplierId | null {
    return this.currentSupplierId$.value;
  }
  currentSupplierIdChanges(): Observable<SupplierId | null> {
    return this.currentSupplierId$.asObservable();
  }

  // ---- Observables por proveedor
  cartForSupplier$(supplierId: SupplierId): Observable<CartItem[]> {
    return this.state$.pipe(map(s => s[supplierId] ?? []));
  }

  // ---- Lecturas sincrónicas
  getCartItems(supplierId: SupplierId): CartItem[] {
    const s = this.state$.value;
    return s[supplierId] ? [...s[supplierId]] : [];
  }
  getQuantity(supplierId: SupplierId, productId: string): number {
    const cart = this.getCartItems(supplierId);
    const item = cart.find(i => i._id === productId);
    return item ? item.quantityToBuy : 0;
  }
  getTotalUnits(supplierId: SupplierId): number {
    return this.getCartItems(supplierId).reduce((acc, i) => acc + i.quantityToBuy, 0);
  }

  // ---- Mutaciones
  addItem(supplierId: SupplierId, product: CartItem, quantity: number) {
    if (!supplierId || !product || quantity <= 0) return;
    const state = { ...this.state$.value };
    const cart = state[supplierId] ? [...state[supplierId]] : [];

    const idx = cart.findIndex(i => i._id === product._id);
    if (idx >= 0) {
      cart[idx] = { ...cart[idx], quantityToBuy: cart[idx].quantityToBuy + quantity };
    } else {
      cart.push({ ...product, quantityToBuy: quantity });
    }

    state[supplierId] = cart;
    this.commit(state);
  }

  updateQuantity(supplierId: SupplierId, productId: string, quantity: number) {
    if (!supplierId || !productId) return;
    const state = { ...this.state$.value };
    const cart = state[supplierId] ? [...state[supplierId]] : [];
    const idx = cart.findIndex(i => i._id === productId);

    if (idx === -1) return;
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx] = { ...cart[idx], quantityToBuy: quantity };
    }

    state[supplierId] = cart;
    this.commit(state);
  }

  removeItem(supplierId: SupplierId, productId: string) {
    this.updateQuantity(supplierId, productId, 0);
  }

  clearCart(supplierId: SupplierId) {
    const state = { ...this.state$.value };
    delete state[supplierId];
    this.commit(state);
  }

  // Limpiar TODOS los carritos (útil para un botón global de admin)
  clearAll() {
    this.commit({});
  }

  // ---- Utilitario
  private commit(next: CartsState) {
    this.state$.next(next);
    saveToLS(next);
  }
}
