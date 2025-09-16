import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductUpdateModalComponent } from '../product-update-modal/product-update-modal.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CategorySelectionService, Category } from '../../services/category.service';
import { BrandSelectionService } from '../../services/brand.service';
import { FiltersStateService } from '../../shared/filters/filters-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.component.html',
  styleUrls: ['./product-update.component.css']
})
export class ProductUpdateComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  sortOrder: string = 'none';
  categories: Category[] = [];
  brands: any[] = [];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    private modalService: NgbModal,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private categoryService: CategorySelectionService,
    private brandService: BrandSelectionService,
    public filters: FiltersStateService
  ) {
    this.filteredProducts = [];
  }

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();

    await this.loadBrands();
    await this.loadCategories();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.filters.set('searchTerm', this.searchTerm);
    });

    // Suscribirse a cambios en los filtros
    this.filters.filters$.subscribe(() => {
      this.fetchProducts();
    });

    // Escuchar selecciones de categoría desde la navbar
    this.categoryService.categorySelected$.subscribe(async (category) => {
      this.filters.set('selectedCategory', category);
    });

    // Cargar productos inicial
    this.fetchProducts();
  }

  async loadBrands() {
    try {
      this.brands = await firstValueFrom(this.brandService.getBrands());
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = [];
    }
  }

  async loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (e) => console.error('Error al cargar categorías:', e)
    });
  }

  async fetchProducts() {
    try {
      console.log('Aplicando filtros en el backend:', {
        searchTerm: this.filters.value.searchTerm,
        selectedCategory: this.filters.getSelectedCategoryForBackend(),
        selectedBrand: this.filters.getSelectedBrandForBackend(),
        hasStockFilter: this.filters.value.hasStockFilter,
        minPrice: this.filters.value.minPrice,
        maxPrice: this.filters.value.maxPrice
      });

      const data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.filters.value.searchTerm,
          this.filters.getSelectedCategoryForBackend(),
          this.filters.getSelectedBrandForBackend(),
          this.filters.value.hasStockFilter,
          this.filters.value.minPrice || undefined,
          this.filters.value.maxPrice || undefined
        )
      );

      this.products = data || [];
      this.filteredProducts = [...this.products];
      
      // Solo aplicar ordenamiento local
      this.sortProducts();
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      this.updateDisplayedProducts();

    } catch (error) {
      if ((error as any).status === 400) {
        this.products = [];
        this.filteredProducts = [];
        this.showFilteredResultsMessage();
      } else {
        console.error('Error al obtener los productos:', error);
        this.products = [];
        this.filteredProducts = [];
      }
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      this.updateDisplayedProducts();
    }
  }

  // Mensaje mejorado para cuando no hay resultados con filtros aplicados
  showFilteredResultsMessage() {
    const activeFilters: string[] = [];
    const filterValues = this.filters.value;

    if (filterValues.searchTerm) {
      activeFilters.push(`Búsqueda: "${filterValues.searchTerm}"`);
    }

    if (filterValues.selectedCategories.length > 0) {
      const categoryNames = filterValues.selectedCategories.map(catId => {
        const cat = this.categories.find(c => c._id === catId);
        return cat ? cat.type : 'Desconocida';
      }).join(', ');
      activeFilters.push(`Categorías: ${categoryNames}`);
    }

    if (filterValues.selectedBrands.length > 0) {
      activeFilters.push(`Marcas: ${filterValues.selectedBrands.join(', ')}`);
    }

    if (filterValues.minPrice !== null || filterValues.maxPrice !== null) {
      const priceRange = `${filterValues.minPrice || 0} - ${filterValues.maxPrice || '∞'}`;
      activeFilters.push(`Precio: $${priceRange}`);
    }

    if (filterValues.hasStockFilter) {
      activeFilters.push('Solo productos con stock');
    }

    const filtersText = activeFilters.length > 0 
      ? activeFilters.join(' • ') 
      : 'filtros aplicados';

    Swal.fire({
      title: 'Sin productos encontrados',
      html: `
        <p>No hay productos que cumplan con los filtros aplicados:</p>
        <div class="text-start mt-3">
          <small class="text-muted">${filtersText}</small>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      showCancelButton: true,
      cancelButtonText: 'Limpiar filtros',
      customClass: {
        popup: 'text-center'
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.clearAllFilters();
      }
    });
  }

  clearAllFilters() {
    this.filters.resetAll();
    this.currentPage = 1;
  }

  applyPriceFilter() {
    this.currentPage = 1;
    // El fetchProducts se ejecuta automáticamente por la suscripción a filters$
  }

  sortProducts() {
    let productsToSort = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
    
    if (this.sortOrder === 'asc') {
      productsToSort.sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'desc') {
      productsToSort.sort((a, b) => b.price - a.price);
    } else if (this.sortOrder === 'name-asc') {
      productsToSort.sort((a, b) => a.desc.localeCompare(b.desc));
    } else if (this.sortOrder === 'name-desc') {
      productsToSort.sort((a, b) => b.desc.localeCompare(a.desc));
    } else if (this.sortOrder === 'code-asc') {
      productsToSort.sort((a, b) => {
        const codeA = Number(a.code);
        const codeB = Number(b.code);
        return codeA - codeB;
      });
    } else if (this.sortOrder === 'code-desc') {
      productsToSort.sort((a, b) => {
        const codeA = Number(a.code);
        const codeB = Number(b.code);
        return codeB - codeA;
      });
    }

    if (this.filteredProducts.length > 0) {
      this.filteredProducts = productsToSort;
    } else {
      this.products = productsToSort;
    }
    
    this.updateDisplayedProducts();
  }

  // Métodos auxiliares para compatibilidad con el componente de filtros
  getCategoryName(id: string): string {
    if (!id || !this.categories || !this.categories.length) return id;
    const cat = this.categories.find((x: any) => x && x._id === id);
    return cat?.type ?? id;
  }

  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = this.filteredProducts.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }

  modifyProduct(product: any): void {
    const modalRef = this.modalService.open(ProductUpdateModalComponent, { centered: true });
    modalRef.componentInstance.editedProduct = { ...product };
    modalRef.result
      .then((result: any) => {
        if (result) {
          this.updateProductList(result);
        }
      })
      .catch(() => {});
  }

    deleteProduct(productId: string) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.productService.deleteProduct(productId).subscribe({
            next: () => {
              Swal.fire('Confirmado', 'La acción ha sido confirmada', 'success');
              this.router.navigate(['/product-update']);
            },
            error: (err) => {
              console.error(err);
            }
          });       
        }
      });
    }

  updateProductList(updatedProduct: any): void {
    const index = this.products.findIndex((p) => p._id === updatedProduct._id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
      this.fetchProducts(); // Refrescar con todos los filtros aplicados
    }
  }
}
