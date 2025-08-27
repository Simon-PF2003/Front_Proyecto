import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Brand {
  _id: string;
  brand: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BrandSelectionService {
  private selectedBrandId = new BehaviorSubject<string>('all');
  selectedBrandId$: Observable<string> = this.selectedBrandId.asObservable();
  categoryBrand$ = this.selectedBrandId$;

  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  //POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
  createNewBrand(brand: string): Observable<Brand> {
    return this.http.post<Brand>(`${this.URL}/newBrand`, { brand });
  }

  selectBrand(id: string) {
    this.selectedBrandId.next(id || 'all');
  }
  reset() { this.selectedBrandId.next('all'); }

  // GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.URL}/brands`);
  }

  searchBrands(term: string): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.URL}/search-brands/${term}`);
  }

  //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH
  updateBrand(id: string, changes: Partial<Brand>): Observable<Brand> {
    return this.http.patch<Brand>(`${this.URL}/update-brands/${id}`, changes);
  }

  // DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE
  deleteBrand(id: string, newBrandId?: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/delete-brands/${id}`, {
      params: newBrandId ? {reassignTo: newBrandId} : {}
    });
  }
}
