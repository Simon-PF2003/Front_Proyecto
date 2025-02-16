import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BillService { 
    
    private URL = 'http://localhost:3000/api';
    
    constructor(
        private http: HttpClient,
        private router: Router
    ) {}
    
    createBill(billData: any, pagado: boolean): Observable<Blob> {
        return this.http.post(`${this.URL}/generateNewBill`, { billData, pagado }, { responseType: 'blob' });
      }
      
    getBills(dateStart: string, dateEnd: string): Observable<any> {
        return this.http.get<any>(this.URL + '/getBills', { params: { dateStart, dateEnd }});
    }

    getBillPDF(billId: string): Observable<any> {
        return this.http.get<any>(this.URL + '/getBillPDF', { params: { billId }});
    }
}