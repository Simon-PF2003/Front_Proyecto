import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS
  createNewProduct(productData: FormData): Observable<any> {
    return this.http.post<any>(this.URL + '/createNewProduct', productData);
  }

  notifyMe(productId: any, userId: any) {
    const url = `${this.URL}/createStockNotification`;
    return this.http.post(url, { productId, userId });
  }

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/product');
  }

  getFeaturedProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/featuredProducts');
  }

  getNoStockProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/noProducts`);
  }

  getProductDetailsById(productId: any): Observable<any> {
    const url = `${this.URL}/product/${productId}`;
    return this.http.get<any>(url);
  }

  // Método unificado para filtros combinados
  getProductsWithFilters(searchTerm?: string, category?: string | string[], brand?: string | string[], hasStock?: boolean, minPrice?: number, maxPrice?: number, supplierId?: string, lowStockOnly?: boolean, noStockOnly?: boolean): Observable<any[]> {
    let url = `${this.URL}/products/filter?`;
    const params: string[] = [];

    if (searchTerm && searchTerm.trim() !== '') {
      params.push(`search=${encodeURIComponent(searchTerm)}`);
    }
    
    // Soporte para múltiples categorías
    if (category && category !== 'all') {
      if (Array.isArray(category)) {
        // Múltiples categorías: categories[]=cat1&categories[]=cat2
        category.forEach(cat => {
          params.push(`categories[]=${encodeURIComponent(cat)}`);
        });
      } else {
        // Categoría única
        params.push(`category=${encodeURIComponent(category)}`);
      }
    }

    // Soporte para múltiples marcas
    if (brand && brand !== 'all') {
      if (Array.isArray(brand)) {
        // Múltiples marcas: brands[]=brand1&brands[]=brand2
        brand.forEach(br => {
          params.push(`brands[]=${encodeURIComponent(br)}`);
        });
      } else {
        // Marca única
        params.push(`brand=${encodeURIComponent(brand)}`);
      }
    }
    
    if (hasStock !== undefined) {
      params.push(`hasStock=${hasStock}`);
    }

    if (minPrice !== undefined && minPrice > 0) {
      params.push(`minPrice=${minPrice}`);
    }

    if (maxPrice !== undefined && maxPrice > 0) {
      params.push(`maxPrice=${maxPrice}`);
    }

    if (supplierId) {
      params.push(`supplier=${encodeURIComponent(supplierId)}`);
    }

    if (lowStockOnly !== undefined) {
      params.push(`lowStockOnly=${lowStockOnly}`);
    }

    if (noStockOnly !== undefined) {
      params.push(`noStockOnly=${noStockOnly}`);
    }

    url += params.join('&');
    console.log('URL del filtro combinado:', url);
    return this.http.get<any[]>(url);
  }


//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
  requestStock(productsToRequest: { _id: string, quantityToBuy: number}[]): Observable<any> {
    return this.http.patch(this.URL + '/requestStock', {productsToRequest});
  }

  updateProduct(updatedProduct: any, productId: any) {
    const url = `${this.URL}/product/${productId}`;
    return this.http.patch(url, updatedProduct);
  }

  actualizarStock(orderData: any) {
    console.log(orderData);
    const url = `${this.URL}/orderStockProduct`;
    return this.http.patch(url, {orderData});
  }

  updateStock(stockData: any) {
    const url = `${this.URL}/updateStock`;
    return this.http.patch(url, stockData);
  }

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE
  deleteProduct(productId: any) {
    const url = `${this.URL}/product/${productId}`;
    return this.http.delete(url);
  }


  


}