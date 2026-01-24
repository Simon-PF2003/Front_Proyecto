import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class BillService { 
    
    private URL: string;
    
    constructor(
        private http: HttpClient,
        private router: Router,
        private apiConfig: ApiConfigService
    ) {
        this.URL = this.apiConfig.getApiBaseUrl();
    }

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS
    createBill(billData: any, pagado: boolean): Observable<Blob> {
        return this.http.post(`${this.URL}/generateNewBill`, { billData, pagado }, { responseType: 'blob' });
      }

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
    getBills(dateStart: string, dateEnd: string): Observable<any> {
        return this.http.get<any>(this.URL + '/getBills', { params: { dateStart, dateEnd }});
    }

    getBillPDF(billId: string): Observable<Blob> {
        return this.http.get(this.URL + '/getBillPDF', { 
            params: { billId },
            responseType: 'blob'
        });
    }

    getBillByOrderId(orderId: string): Observable<any> {
        return this.http.get<any>(this.URL + '/getBillByOrderId', { 
            params: { orderId }
        });
    }

    exportBillsExcel(dateStart: string, dateEnd: string): Observable<Blob> {
        return this.http.get(`${this.URL}/exportBillsExcel`, {
            params: { dateStart, dateEnd },
            responseType: 'blob'
        });
    }
}