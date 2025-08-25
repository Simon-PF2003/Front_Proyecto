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

  //POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
  createNewCategory(type: string): Observable<Category> {
    return this.http.post<Category>(`${this.URL}/categories`, { type });
  }

  selectCategory(id: string) {
    this.selectedCategoryId.next(id || 'all');
  }
  reset() { this.selectedCategoryId.next('all'); }

  // GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.URL}/categories`);
  }

  searchCategories(term: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.URL}/search-categories/${term}`);
  }

  //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH //PATCH PATCH PATCH
  updateCategory(id: string, changes: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.URL}/update-categories/${id}`, changes);
  }

  // DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE
  deleteCategory(id: string, newCategoryId?: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/delete-categories/${id}`, {
      params: newCategoryId ? {reassignTo: newCategoryId} : {}
    });
  }
}
