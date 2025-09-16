import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export type SortOrder =
  | 'none' | 'asc' | 'desc'
  | 'name-asc' | 'name-desc'
  | 'code-asc' | 'code-desc';

export interface FiltersState {
  searchTerm: string;
  selectedCategory: string;        // 'all' o id simple
  selectedBrand: string;           // 'all' o marca simple
  selectedCategories: string[];    // multi
  selectedBrands: string[];        // multi
  hasStockFilter: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  sortOrder: SortOrder;
}

@Injectable({ providedIn: 'root' })
export class FiltersStateService {

  private readonly initial: FiltersState = {
    searchTerm: '',
    selectedCategory: 'all',
    selectedBrand: 'all',
    selectedCategories: [],
    selectedBrands: [],
    hasStockFilter: false,
    minPrice: null,
    maxPrice: null,
    sortOrder: 'none'
  };

  private state$ = new BehaviorSubject<FiltersState>({ ...this.initial });
  readonly filters$ = this.state$.asObservable();

  get value(): FiltersState { return this.state$.value; }

  set<K extends keyof FiltersState>(key: K, val: FiltersState[K]) {
    this.state$.next({ ...this.value, [key]: val });
  }

  resetAll() {
    this.state$.next({ ...this.initial });
  }

  toggleCategory(id: string) {
    const set = new Set(this.value.selectedCategories);
    set.has(id) ? set.delete(id) : set.add(id);
    this.state$.next({
      ...this.value,
      selectedCategories: [...set],
      selectedCategory: 'all'
    });
  }

  toggleBrand(name: string) {
    const set = new Set(this.value.selectedBrands);
    set.has(name) ? set.delete(name) : set.add(name);
    this.state$.next({
      ...this.value,
      selectedBrands: [...set],
      selectedBrand: 'all'
    });
  }

  removeCategory(id: string) {
    this.state$.next({
      ...this.value,
      selectedCategories: this.value.selectedCategories.filter(x => x !== id)
    });
  }

  removeBrand(name: string) {
    this.state$.next({
      ...this.value,
      selectedBrands: this.value.selectedBrands.filter(x => x !== name)
    });
  }

  // Helpers para el backend (idénticos a los tuyos)
  getSelectedCategoryForBackend(): string | string[] {
    const v = this.value;
    if (v.selectedCategories.length) return v.selectedCategories;
    if (v.selectedCategory !== 'all') return v.selectedCategory;
    return 'all';
  }

  getSelectedBrandForBackend(): string | string[] {
    const v = this.value;
    if (v.selectedBrands.length) return v.selectedBrands;
    if (v.selectedBrand !== 'all') return v.selectedBrand;
    return 'all';
  }

  // Observable por si querés saber "cambió algo"
  readonly dirty$ = combineLatest([this.filters$]).pipe(map(() => true));
}
