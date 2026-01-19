import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { 
  DashboardService, 
  DashboardFilters, 
  OverviewData,
  ProductSold,
  ProfitabilityProduct,
  ProfitabilityCategory,
  SalesHistoryItem,
  RegisteredClients,
  ActiveClients,
  ImportantClientsResponse,
  ClientRankingsResponse,
  QuarterlyComparison
} from '../services/dashboard.service';
import { CategorySelectionService, Category } from '../services/category.service';
import { BrandSelectionService, Brand } from '../services/brand.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-retrieve',
  templateUrl: './dashboard-retrieve.component.html',
  styleUrls: ['./dashboard-retrieve.component.css']
})
export class DashboardRetrieveComponent implements OnInit {
  // Filters
  filters: DashboardFilters = {
    groupBy: 'month',
    limit: 20,
    startDate: this.getLastYearDate(),
    endDate: this.getTomorrowDate(),
    category: '',
    brand: '',
    businessName: ''
  };

  // Dropdown lists
  categories: Category[] = [];
  brands: Brand[] = [];
  users: any[] = [];

  // Loading states
  loading = {
    overview: false,
    products: false,
    profitability: false,
    sales: false,
    customers: false,
    charts: false
  };

  // Overview data
  overview: OverviewData = {
    totalProducts: 0,
    totalLiters: 0,
    avgLitersPerSale: 0,
    totalSales: 0,
    totalRevenue: 0
  };

  // Products data
  productsMostSold: ProductSold[] = [];
  profitabilityProducts: ProfitabilityProduct[] = [];
  profitabilityCategories: ProfitabilityCategory[] = [];

  // Sales data
  salesHistory: SalesHistoryItem[] = [];
  quarterlyComparison: QuarterlyComparison[] = [];

  // Customers data
  registeredClients: RegisteredClients = { total: 0, clients: [] };
  activeClients: ActiveClients = { total: 0, clients: [] };
  importantClients: ImportantClientsResponse = { stats: { totalVIPClients: 0, avgPurchaseCount: 0, avgTotalSpent: 0, avgVIPScore: 0 }, clients: [] };
  clientRankings: ClientRankingsResponse = { byQuantity: [], byLiters: [] };

  // Chart configurations
  public salesChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  public salesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Historial de Ventas' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  public salesChartType: ChartType = 'line';

  // Quarterly Comparison Bar Chart
  public quarterlyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  public quarterlyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Análisis Comparativo Trimestral' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  
  public quarterlyChartType: ChartType = 'bar';

  // Products Chart
  public productsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  public productsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Productos Más Vendidos' }
    },
    scales: {
      x: { beginAtZero: true }
    }
  };
  
  public productsChartType: ChartType = 'bar';

  constructor(
    private dashboardService: DashboardService,
    private categoryService: CategorySelectionService,
    private brandService: BrandSelectionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadAllData();
  }

  loadDropdownData(): void {
    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load brands
    this.brandService.getBrands().subscribe({
      next: (data) => {
        this.brands = data;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });

    // Load users
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.getUsers(token).then(
        (data) => {
          this.users = data.filter((u: any) => u.role !== 'Administrador');
        },
        (error) => {
          console.error('Error loading users:', error);
        }
      );
    }
  }

  loadAllData(): void {
    this.loadOverview();
    this.loadProducts();
    this.loadProfitability();
    this.loadSalesData();
    this.loadCustomersData();
  }

  loadOverview(): void {
    this.loading.overview = true;
    this.dashboardService.getOverview(this.filters).subscribe({
      next: (data) => {
        this.overview = data;
        this.loading.overview = false;
      },
      error: (error) => {
        console.error('Error loading overview:', error);
        this.loading.overview = false;
      }
    });
  }

  loadProducts(): void {
    this.loading.products = true;
    this.dashboardService.getProductsMostSold(this.filters).subscribe({
      next: (data) => {
        this.productsMostSold = data;
        this.updateProductsChart();
        this.loading.products = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.products = false;
      }
    });
  }

  loadProfitability(): void {
    this.loading.profitability = true;
    
    this.dashboardService.getProfitabilityByProduct(this.filters).subscribe({
      next: (data) => {
        this.profitabilityProducts = data;
      },
      error: (error) => {
        console.error('Error loading product profitability:', error);
      }
    });

    this.dashboardService.getProfitabilityByCategory(this.filters).subscribe({
      next: (data) => {
        this.profitabilityCategories = data;
        this.loading.profitability = false;
      },
      error: (error) => {
        console.error('Error loading category profitability:', error);
        this.loading.profitability = false;
      }
    });
  }

  loadSalesData(): void {
    this.loading.sales = true;
    
    this.dashboardService.getSalesHistory(this.filters).subscribe({
      next: (data) => {
        this.salesHistory = data;
        this.updateSalesChart();
      },
      error: (error) => {
        console.error('Error loading sales history:', error);
      }
    });

    this.dashboardService.getQuarterlyComparison(this.filters).subscribe({
      next: (data) => {
        this.quarterlyComparison = data;
        this.updateQuarterlyChart();
        this.loading.sales = false;
      },
      error: (error) => {
        console.error('Error loading quarterly comparison:', error);
        this.loading.sales = false;
      }
    });
  }

  loadCustomersData(): void {
    this.loading.customers = true;
    
    this.dashboardService.getRegisteredClients(this.filters).subscribe({
      next: (data) => {
        this.registeredClients = data;
      },
      error: (error) => {
        console.error('Error loading registered clients:', error);
      }
    });

    this.dashboardService.getActiveClients({ ...this.filters, months: 1 }).subscribe({
      next: (data) => {
        this.activeClients = data;
      },
      error: (error) => {
        console.error('Error loading active clients:', error);
      }
    });

    this.dashboardService.getImportantClients({ ...this.filters, limit: 50 }).subscribe({
      next: (data) => {
        this.importantClients = data;
      },
      error: (error) => {
        console.error('Error loading important clients:', error);
      }
    });

    this.dashboardService.getClientRankings(this.filters).subscribe({
      next: (data) => {
        this.clientRankings = data;
        this.loading.customers = false;
      },
      error: (error) => {
        console.error('Error loading client rankings:', error);
        this.loading.customers = false;
      }
    });
  }

  loadCharts(): void {
    // Eliminado: no hay datos de tipo de cliente mayorista/minorista
    this.loading.charts = false;
  }

  updateSalesChart(): void {
    const labels = this.salesHistory.map(item => item.period);
    const revenues = this.salesHistory.map(item => item.totalRevenue);
    const sales = this.salesHistory.map(item => item.totalSales);

    this.salesChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos Totales',
          data: revenues,
          borderColor: '#4299e1',
          backgroundColor: 'rgba(66, 153, 225, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Cantidad de Ventas',
          data: sales,
          borderColor: '#48bb78',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    this.salesChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Historial de Ventas' }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Ingresos' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Ventas' }
        }
      }
    };
  }

  updateQuarterlyChart(): void {
    const labels = this.quarterlyComparison.map(item => `Q${item.quarter} ${item.year}`);
    const revenues = this.quarterlyComparison.map(item => item.totalRevenue);
    const sales = this.quarterlyComparison.map(item => item.totalSales);

    this.quarterlyChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos',
          data: revenues,
          backgroundColor: '#4299e1',
          yAxisID: 'y'
        },
        {
          label: 'Cantidad de Ventas',
          data: sales,
          backgroundColor: '#48bb78',
          yAxisID: 'y1'
        }
      ]
    };

    // Update options to use dual axis
    this.quarterlyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Análisis Comparativo Trimestral' }
      },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Ingresos ($)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Cantidad de Ventas' }
        }
      }
    };
  }

  updateProductsChart(): void {
    const topProducts = this.productsMostSold.slice(0, 10);
    const labels = topProducts.map(p => p.productName || 'N/A');
    const quantities = topProducts.map(p => p.totalQuantity);

    this.productsChartData = {
      labels: labels,
      datasets: [{
        label: 'Cantidad Vendida',
        data: quantities,
        backgroundColor: '#4299e1'
      }]
    };
  }

  applyFilters(): void {
    this.loadAllData();
  }

  resetFilters(): void {
    this.filters = {
      groupBy: 'month',
      limit: 20,
      startDate: this.getLastYearDate(),
      endDate: this.getTomorrowDate(),
      category: '',
      brand: '',
      businessName: ''
    };
    this.loadAllData();
  }

  getLastYearDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }
}
