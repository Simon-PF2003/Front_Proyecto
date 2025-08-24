import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Category {
  _id: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategorySelectionService {
  private selectedCategoryId = new BehaviorSubject<string>('all');
  selectedCategoryId$: Observable<string> = this.selectedCategoryId.asObservable();
  categorySelected$ = this.selectedCategoryId$;

  private URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  selectCategory(id: string) {
    this.selectedCategoryId.next(id || 'all');
  }
  reset() { this.selectedCategoryId.next('all'); }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.URL}/categories`);
  }
}
