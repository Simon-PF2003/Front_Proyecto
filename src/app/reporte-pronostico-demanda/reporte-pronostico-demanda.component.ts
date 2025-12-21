import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-pronostico-demanda',
  templateUrl: './reporte-pronostico-demanda.component.html',
  styleUrls: ['./reporte-pronostico-demanda.component.css']
})
export class ReportePronosticoDemandaComponent implements OnInit {
  // Filtros
  dateRangeEnd: string = '';
  predictionType: string = 'weekly'; // 'weekly' o 'monthly'
  predictionTypeLabel: string = 'por semana'; // Label para mostrar en la tabla
  stockStatusFilter: string = 'all'; // 'all', 'sufficient', 'insufficient'

  // Datos de pronóstico
  productosPronostico: any[] = [];
  mayorDemanda: any = null;
  menorDemanda: any = null;

  // Estado de carga
  isLoading: boolean = false;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  displayedProductos: any[] = [];

  // Ordenamiento mejorado
  sortBy: string = 'quantity'; // 'quantity' o 'stockDiff'
  sortOrder: string = 'desc'; // 'asc' o 'desc'

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.loadSampleData();
  }

  setDefaultDateRange() {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    this.dateRangeEnd = nextMonth.toISOString().split('T')[0];
  }

  loadSampleData() {
    // No cargar datos de ejemplo - esperar respuesta del backend
    this.productosPronostico = [];
    this.mayorDemanda = null;
    this.menorDemanda = null;
    this.totalPages = 1;
    this.currentPage = 1;
    this.displayedProductos = [];
  }

  validateDates(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(this.dateRangeEnd);

    // Validar que la fecha sea futura
    if (endDate <= today) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha no válida',
        text: 'La fecha debe ser futura (posterior a hoy).',
      });
      return false;
    }

    // Validar horizonte máximo de 3 meses
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const maxDays = 90; // 3 meses aproximadamente

    if (diffDays > maxDays) {
      Swal.fire({
        icon: 'error',
        title: 'Horizonte excedido',
        text: 'El horizonte máximo de predicción es de 3 meses (90 días desde hoy).',
      });
      return false;
    }

    return true;
  }

  fetchPronostico() {
    if (!this.validateDates()) return;

    // Activar estado de carga
    this.isLoading = true;

    // Establecer el label del tipo de pronóstico según la selección actual
    this.predictionTypeLabel = this.predictionType === 'weekly' ? 'por semana' : 'por mes';

    const dateEnd = this.dateRangeEnd + "T23:59:59Z";

    this.productService.getPronosticoDemanda(
      dateEnd, 
      this.predictionType, 
      this.sortBy, 
      this.sortOrder,
      this.stockStatusFilter
    ).subscribe({
      next: (response: any) => {
        console.log('Respuesta del pronóstico de demanda:', response);
        
        // El backend devuelve { productos: [...], metadata: {...} }
        this.productosPronostico = response.productos || [];
        
        // Mapear los campos del backend al formato esperado por el frontend
        this.productosPronostico = this.productosPronostico.map((p: any) => ({
          _id: p.productId || p._id,
          desc: p.productDesc || p.desc,
          categoryName: p.categoryName,
          stock: p.stock,
          price: p.price,
          cantidadPredicha: Math.ceil(p.cantidadPredicha || p.predictedQuantity || 0), // Promedio por período
          totalEsperado: Math.ceil(p.totalEsperado || 0), // Total para todo el rango
          numeroPeriodos: p.numeroPeriodos || 1 // Cantidad de períodos
        }));
        
        this.calculateDemandStats();

        this.totalPages = Math.ceil(this.productosPronostico.length / this.pageSize);
        this.currentPage = 1;
        this.updateDisplayedProductos();

        // Desactivar estado de carga
        this.isLoading = false;

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Pronóstico generado',
          text: `Se encontraron ${this.productosPronostico.length} productos con pronóstico de demanda.`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error al obtener pronóstico de demanda:', error);
        
        // Desactivar estado de carga
        this.isLoading = false;

        let errorMessage = 'Se ha producido un error al generar el pronóstico.';
        
        if (error.status === 404) {
          errorMessage = 'No se encontraron facturas en el rango de fechas seleccionado.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Parámetros de búsqueda inválidos.';
        } else if (error.status === 403) {
          errorMessage = 'No existen datos históricos suficientes para hacer la predicción.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });

        this.productosPronostico = [];
        this.mayorDemanda = null;
        this.menorDemanda = null;
        this.updateDisplayedProductos();
      }
    });
  }

  calculateDemandStats() {
    if (this.productosPronostico.length === 0) {
      this.mayorDemanda = null;
      this.menorDemanda = null;
      return;
    }

    // Encontrar mayor y menor demanda basado en totalEsperado
    this.mayorDemanda = this.productosPronostico.reduce((max, p) => 
      (p.totalEsperado || p.cantidadPredicha) > (max.totalEsperado || max.cantidadPredicha) ? p : max
    );
    
    this.menorDemanda = this.productosPronostico.reduce((min, p) => 
      (p.totalEsperado || p.cantidadPredicha) < (min.totalEsperado || min.cantidadPredicha) ? p : min
    );
  }

  updateDisplayedProductos() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProductos = this.productosPronostico.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProductos();
    }
  }
}
