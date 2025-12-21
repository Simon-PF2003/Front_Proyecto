import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService, Category } from '../services/category.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reporte-analisis-ventas',
  templateUrl: './reporte-analisis-ventas.component.html',
  styleUrls: ['./reporte-analisis-ventas.component.css']
})
export class ReporteAnalisisVentasComponent implements OnInit {
  // Filtros
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  selectedCategories: string[] = [];
  categories: Category[] = [];

  // Datos de análisis
  productosVentas: any[] = [];
  ventasTotales: number = 0;
  ingresoTotalGeneral: number = 0;

  // Estado de carga
  isLoading: boolean = false;

  // Control de colapso de filtros
  isFiltersCollapsed: boolean = true;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  displayedProductos: any[] = [];

  constructor(
    private productService: ProductService,
    private categorySelectionService: CategorySelectionService
  ) {}

  async ngOnInit() {
    this.setDefaultDateRange();
    await this.loadCategories();
    // Realizar búsqueda inicial inmediatamente al cargar el componente
    this.fetchAnalisisVentas();
  }

  async loadCategories() {
    try {
      this.categories = await firstValueFrom(this.categorySelectionService.getCategories()) || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  setDefaultDateRange() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    this.dateRangeStart = lastMonth.toISOString().split('T')[0];
    this.dateRangeEnd = today.toISOString().split('T')[0];
  }

  validateDates(): boolean {
    const startDate = new Date(this.dateRangeStart);
    const endDate = new Date(this.dateRangeEnd);

    if (startDate > endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas no válidas',
        text: 'La fecha de inicio no puede ser mayor a la fecha de fin.',
      });
      return false;
    }
    return true;
  }

  fetchAnalisisVentas() {
    if (!this.validateDates()) return;

    // Activar estado de carga
    this.isLoading = true;

    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";
    
    // Convertir array de IDs de categorías a array de nombres si es necesario
    // O pasar directamente los IDs si el backend los acepta
    const categoryIds = this.selectedCategories.length > 0 ? this.selectedCategories : undefined;

    this.productService.getAnalisisVentas(dateStart, dateEnd, categoryIds).subscribe({
      next: (response: any) => {
        console.log('Respuesta del análisis de ventas:', response);
        
        this.productosVentas = response.productos || [];
        this.ventasTotales = response.ventasTotales || 0;
        this.ingresoTotalGeneral = response.ingresoTotal || 0;

        // Calcular porcentajes
        if (this.ventasTotales > 0) {
          this.productosVentas = this.productosVentas.map(item => ({
            ...item,
            porcentaje: ((item.cantidadVendida / this.ventasTotales) * 100).toFixed(2)
          }));
        }

        this.totalPages = Math.ceil(this.productosVentas.length / this.pageSize);
        this.currentPage = 1;
        this.updateDisplayedProductos();

        // Desactivar estado de carga
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener análisis de ventas:', error);
        
        // Desactivar estado de carga
        this.isLoading = false;

        let errorMessage = 'Se ha producido un error.';
        if (error.status === 404) {
          errorMessage = 'No se encontraron ventas en el rango de fechas y categorías seleccionadas.';
        } else if (error.status === 400) {
          errorMessage = 'Parámetros de búsqueda inválidos.';
        } else if (error.status === 403) {
          errorMessage = 'No se encontraron ventas en el rango de fechas y categorías seleccionadas.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });

        this.productosVentas = [];
        this.ventasTotales = 0;
        this.ingresoTotalGeneral = 0;
        this.updateDisplayedProductos();
      }
    });
  }

  updateDisplayedProductos() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProductos = this.productosVentas.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProductos();
    }
  }

  // Métodos para manejar categorías (reutilizando lógica de products-list)
  toggleCategoryItem(catId: string): void {
    const index = this.selectedCategories.indexOf(catId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(catId);
    }
    this.fetchAnalisisVentas();
  }

  toggleCategory(catId: string, checked: boolean): void {
    const index = this.selectedCategories.indexOf(catId);
    if (checked && index === -1) {
      this.selectedCategories.push(catId);
    } else if (!checked && index > -1) {
      this.selectedCategories.splice(index, 1);
    }
    this.fetchAnalisisVentas();
  }

  getCategoryName(id: string): string {
    if (!id || !this.categories || !this.categories.length) return id;
    const cat = this.categories.find((x: any) => x && x._id === id);
    return cat?.type ?? id;
  }

  clearFilters() {
    this.selectedCategories = [];
    this.setDefaultDateRange();
    this.fetchAnalisisVentas();
  }

  exportarExcel() {
    if (this.productosVentas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar.',
      });
      return;
    }

    // Mostrar loading mientras se genera el Excel
    Swal.fire({
      title: 'Generando Excel...',
      text: 'Por favor espera mientras se prepara el archivo',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";
    const categoryIds = this.selectedCategories.length > 0 ? this.selectedCategories : undefined;

    this.productService.exportAnalisisVentasExcel(dateStart, dateEnd, categoryIds).subscribe({
      next: (blob: Blob) => {
        Swal.close();
        
        // Generar el nombre del archivo con las fechas
        const fechaInicio = new Date(this.dateRangeStart).toLocaleDateString('es-ES').replace(/\//g, '-');
        const fechaFin = new Date(this.dateRangeEnd).toLocaleDateString('es-ES').replace(/\//g, '-');
        const nombreArchivo = `Analisis_Ventas_${fechaInicio}_al_${fechaFin}.xlsx`;

        // Descargar el archivo
        saveAs(blob, nombreArchivo);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Exportación exitosa!',
          text: `El archivo ${nombreArchivo} se ha descargado correctamente.`,
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error al exportar Excel:', error);
        
        let errorMessage = 'Ocurrió un error al generar el archivo Excel.';
        if (error.status === 404) {
          errorMessage = 'No se encontraron datos para exportar en el rango de fechas seleccionado.';
        } else if (error.status === 400) {
          errorMessage = 'Parámetros de búsqueda inválidos.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error de exportación',
          text: errorMessage,
        });
      }
    });
  }

  toggleFiltersCollapse() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
  }
}
