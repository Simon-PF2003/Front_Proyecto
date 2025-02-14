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
    createBill (billData: any, pagado: boolean): Observable<any> {
        return this.http.post<any>(this.URL + '/generateNewBill', { billData, pagado });
    };
    }