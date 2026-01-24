import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  brand?: string;
  description?: string;
  businessName?: string;
  limit?: number;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  months?: number;
  sortBy?: 'totalSpent' | 'purchaseCount' | 'vipScore';
}

export interface OverviewData {
  totalProducts: number;
  totalLiters: number;
  avgLitersPerSale: number;
  totalSales: number;
  totalRevenue: number;
}

export interface ProductSold {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  totalQuantity: number;
  totalRevenue: number;
  salesCount: number;
}

export interface ProfitabilityProduct {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  quantitySold: number;
}

export interface ProfitabilityCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
}

export interface SalesHistoryItem {
  period: string;
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  avgTicket: number;
}

export interface RegisteredClients {
  total: number;
  clients: any[];
}

export interface ActiveClients {
  total: number;
  clients: any[];
}

export interface ImportantClient {
  userId: string;
  businessName: string;
  email: string;
  role: string;
  purchaseCount: number;
  totalSpent: number;
  avgTicket: number;
  totalProducts: number;
  vipScore: number;
}

export interface ImportantClientsResponse {
  stats: {
    totalVIPClients: number;
    avgPurchaseCount: number;
    avgTotalSpent: number;
    avgVIPScore: number;
  };
  clients: ImportantClient[];
}

export interface ClientRanking {
  userId: string;
  businessName: string;
  email: string;
  role: string;
  totalQuantity?: number;
  salesCount: number;
}

export interface ClientRankingsResponse {
  byQuantity: ClientRanking[];
  byLiters: ClientRanking[];
}

export interface QuarterlyComparison {
  quarter: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
}

export interface SalesDetailsByClient {
  period: string;
  clientCount: number;
  avgSalesPerClient: number;
  avgRevenuePerClient: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = `${this.apiConfig.getApiBaseUrl()}/dashboard`;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`
    };
  }

  private buildParams(filters: DashboardFilters): HttpParams {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof DashboardFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    return params;
  }

  getOverview(filters: DashboardFilters = {}): Observable<OverviewData> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<OverviewData>(`${this.apiUrl}/overview`, { params, headers });
  }

  getProductsMostSold(filters: DashboardFilters = {}): Observable<ProductSold[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ProductSold[]>(`${this.apiUrl}/products/most-sold`, { params, headers });
  }

  getProfitabilityByProduct(filters: DashboardFilters = {}): Observable<ProfitabilityProduct[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ProfitabilityProduct[]>(`${this.apiUrl}/products/profitability`, { params, headers });
  }

  getProfitabilityByCategory(filters: DashboardFilters = {}): Observable<ProfitabilityCategory[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ProfitabilityCategory[]>(`${this.apiUrl}/categories/profitability`, { params, headers });
  }

  getSalesHistory(filters: DashboardFilters = {}): Observable<SalesHistoryItem[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<SalesHistoryItem[]>(`${this.apiUrl}/sales/history`, { params, headers });
  }

  getQuarterlyComparison(filters: DashboardFilters = {}): Observable<QuarterlyComparison[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<QuarterlyComparison[]>(`${this.apiUrl}/sales/quarterly-comparison`, { params, headers });
  }

  getSalesDetailsByClient(filters: DashboardFilters = {}): Observable<SalesDetailsByClient[]> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<SalesDetailsByClient[]>(`${this.apiUrl}/sales/details-by-client`, { params, headers });
  }

  getRegisteredClients(filters: DashboardFilters = {}): Observable<RegisteredClients> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<RegisteredClients>(`${this.apiUrl}/customers/registered`, { params, headers });
  }

  getActiveClients(filters: DashboardFilters = {}): Observable<ActiveClients> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ActiveClients>(`${this.apiUrl}/customers/active`, { params, headers });
  }

  getImportantClients(filters: DashboardFilters = {}): Observable<ImportantClientsResponse> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ImportantClientsResponse>(`${this.apiUrl}/customers/important`, { params, headers });
  }

  getClientRankings(filters: DashboardFilters = {}): Observable<ClientRankingsResponse> {
    const params = this.buildParams(filters);
    const headers = this.getAuthHeaders();
    return this.http.get<ClientRankingsResponse>(`${this.apiUrl}/customers/rankings`, { params, headers });
  }
}
