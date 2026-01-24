import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl: string;

  constructor() {
    // Asegurar que la URL no tenga barra al final
    this.baseUrl = environment.apiUrl.replace(/\/$/, '');
  }

  /**
   * Obtiene la URL base de la API
   * @returns URL base sin barra al final
   */
  getApiUrl(): string {
    return this.baseUrl;
  }

  /**
   * Construye una URL completa para un endpoint
   * @param endpoint - Ruta del endpoint (ej: '/products', 'api/users')
   * @returns URL completa
   */
  buildUrl(endpoint: string): string {
    // Remover barra inicial si existe
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Obtiene la URL base para endpoints de /api
   * @returns URL base + /api
   */
  getApiBaseUrl(): string {
    return `${this.baseUrl}/api`;
  }
}
