import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockViewService {
  private currentViewSubject = new BehaviorSubject<string>('suppliers');
  public currentView$ = this.currentViewSubject.asObservable();

  constructor() { }

  setCurrentView(view: string) {
    this.currentViewSubject.next(view);
  }

  getCurrentView(): string {
    return this.currentViewSubject.value;
  }
}
