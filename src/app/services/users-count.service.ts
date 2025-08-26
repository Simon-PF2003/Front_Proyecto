import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersCountService {
  private pendingUsersCountSubject = new BehaviorSubject<number>(0);
  public pendingUsersCount$ = this.pendingUsersCountSubject.asObservable();

  constructor(private authService: AuthService) {}

  // Método para obtener y actualizar el conteo de usuarios pendientes
  updatePendingUsersCount(): void {
    this.authService.getPendingUsers().subscribe({
      next: (users) => {
        const count = users ? users.length : 0;
        this.pendingUsersCountSubject.next(count);
      },
      error: (error) => {
        console.error('Error al obtener usuarios pendientes:', error);
        this.pendingUsersCountSubject.next(0);
      }
    });
  }

  // Método para obtener el conteo actual
  getCurrentPendingUsersCount(): number {
    return this.pendingUsersCountSubject.value;
  }

  // Método para decrementar el contador (cuando se acepta/rechaza un usuario)
  decrementPendingUsersCount(): void {
    const currentCount = this.pendingUsersCountSubject.value;
    if (currentCount > 0) {
      this.pendingUsersCountSubject.next(currentCount - 1);
    }
  }

  // Método para incrementar el contador (cuando se registra un nuevo usuario)
  incrementPendingUsersCount(): void {
    const currentCount = this.pendingUsersCountSubject.value;
    this.pendingUsersCountSubject.next(currentCount + 1);
  }
}
