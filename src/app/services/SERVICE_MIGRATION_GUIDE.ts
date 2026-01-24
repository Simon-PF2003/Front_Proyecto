import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';

/**
 * INSTRUCCIONES PARA ACTUALIZAR SERVICIOS:
 * 
 * 1. Importar ApiConfigService:
 *    import { ApiConfigService } from './api-config.service';
 * 
 * 2. Inyectar en constructor:
 *    constructor(
 *      private http: HttpClient,
 *      private apiConfig: ApiConfigService
 *    ) { }
 * 
 * 3. Reemplazar URLs hardcodeadas:
 * 
 *    ANTES:
 *    private URL = 'http://localhost:3000/api';
 *    
 *    DESPUÉS:
 *    private URL: string;
 *    constructor(..., private apiConfig: ApiConfigService) {
 *      this.URL = this.apiConfig.getApiBaseUrl();
 *    }
 * 
 * 4. O usar directamente en las llamadas HTTP:
 *    this.http.get(`${this.apiConfig.getApiBaseUrl()}/products`)
 * 
 * EJEMPLO COMPLETO:
 * 
 * @Injectable({ providedIn: 'root' })
 * export class ProductService {
 *   private URL: string;
 * 
 *   constructor(
 *     private http: HttpClient,
 *     private apiConfig: ApiConfigService
 *   ) {
 *     this.URL = this.apiConfig.getApiBaseUrl(); // http://backend-url/api
 *   }
 * 
 *   getProducts(): Observable<any> {
 *     return this.http.get(`${this.URL}/products`);
 *   }
 * }
 */

@Injectable({
  providedIn: 'root'
})
export class ServiceMigrationGuide {
  constructor() { }
}
