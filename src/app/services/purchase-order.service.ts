import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  private URL: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiConfig: ApiConfigService
  ) {
    this.URL = this.apiConfig.getApiBaseUrl();
  }

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS
  createPurchaseOrder (purchaseOrderData: any): Observable<any> {
    return this.http.post<any>(this.URL + '/createPurchaseOrder', purchaseOrderData);
  };

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
  getPendingPurchaseOrders(filters: any): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/getPendingPurchaseOrders', { params: filters });
  }

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
  updatePurchaseOrder (purchaseOrderData: any): Observable<any> {
    return this.http.patch<any>(this.URL + '/updatePurchaseOrders', purchaseOrderData);
  }

  cancelPurchaseOrder (purchaseOrderData: any): Observable<any> {
    return this.http.patch<any>(this.URL + '/cancelPurchaseOrder', purchaseOrderData);
  }
}