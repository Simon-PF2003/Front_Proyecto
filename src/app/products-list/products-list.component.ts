import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService, Category } from '../services/category.service';
import { Router } from '@angular/router';
import { BrandSelectionService } from '../services/brand.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedBrand: string = 'all';
  hasStockFilter: boolean = false;
  sortOrder: string = 'none';
  discountPercentage: number = 0;
  categories: Category[] = [];
  brands: any[] = [];
  isLoading: boolean = true; // Indicador de carga

  selectedBrands: string[] = [];
  selectedCategories: string[] = [];

  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categorySelectionService: CategorySelectionService,
    private brandService: BrandSelectionService,
    private router: Router
  ) {
    this.filteredProducts = [];
  }

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();

    await this.fetchUserDiscount();
    await this.loadBrands();
    await this.fetchProducts();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || ''; 
      this.fetchProducts();
    });

    this.categorySelectionService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (e) => console.error('Error al cargar categorías en navbar:', e)
    });
  }


  async loadBrands() {
    try {
      this.brands = await firstValueFrom(this.brandService.getBrands());
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = [];
    }
  }

  async fetchUserDiscount() {
    try {
      const response = await firstValueFrom(this.authService.getUserData());
      if (response) {
        this.authService.getUserDiscount(response.id).subscribe((discount: any) => {
          this.discountPercentage = discount.discountPercentage;
          console.log('User discount:', this.discountPercentage);
        });
        console.log('User discount fetching is asynchronous, may not reflect updated value immediately.'); 
      }

        } catch (error) {
      console.error('Error fetching user discount:', error);
    }
  }
  
  async fetchProducts() {
    this.isLoading = true; // Iniciar carga
    try {
      console.log('Aplicando filtros en el backend:', {
        searchTerm: this.searchTerm,
        selectedCategory: this.getSelectedCategoryForBackend(),
        selectedBrand: this.getSelectedBrandForBackend(),
        hasStockFilter: this.hasStockFilter,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice
      });

      // Enviar TODOS los filtros al backend para optimizar la consulta en BD
      const data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.getSelectedCategoryForBackend(), // Categoría seleccionada o 'all'
          this.getSelectedBrandForBackend(), // Marca seleccionada o 'all'
          this.hasStockFilter,
          this.minPrice || undefined,
          this.maxPrice || undefined
        )
      );
  
      this.products = data || [];
      await this.applyDiscountToProducts();
      
      // Los productos ya vienen filtrados desde el backend, no necesitamos filtros locales
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
    } finally {
      this.isLoading = false; // Terminar carga siempre
    }
  }
  
  async applyDiscountToProducts() {
    if (this.discountPercentage > 0) {
      this.products.forEach((product) => {
        product.discountedPrice = product.price * (1 - this.discountPercentage); 
      });
    } else {
      this.products.forEach((product) => {
        product.discountedPrice = product.price; 
      });
    }
  }

  // Métodos auxiliares para enviar filtros al backend
  getSelectedCategoryForBackend(): string | string[] {
    if (this.selectedCategories.length > 0) {
      // Enviar múltiples categorías como array
      return this.selectedCategories;
    } else if (this.selectedCategory && this.selectedCategory !== 'all') {
      // Enviar categoría única
      return this.selectedCategory;
    }
    return 'all';
  }

  getSelectedBrandForBackend(): string | string[] {
    if (this.selectedBrands.length > 0) {
      // Enviar múltiples marcas como array
      return this.selectedBrands;
    } else if (this.selectedBrand && this.selectedBrand !== 'all') {
      // Enviar marca única
      return this.selectedBrand;
    }
    return 'all';
  }

  // Mensaje mejorado para cuando no hay resultados con filtros aplicados
  showFilteredResultsMessage() {
    const activeFilters: string[] = [];

    if (this.searchTerm) {
      activeFilters.push(`Búsqueda: "${this.searchTerm}"`);
    }

    if (this.selectedCategories.length > 0) {
      const categoryNames = this.selectedCategories.map(catId => {
        const cat = this.categories.find(c => c._id === catId);
        return cat ? cat.type : 'Desconocida';
      }).join(', ');
      activeFilters.push(`Categorías: ${categoryNames}`);
    } else if (this.selectedCategory && this.selectedCategory !== 'all') {
      const cat = this.categories.find(c => c._id === this.selectedCategory);
      if (cat) activeFilters.push(`Categoría: ${cat.type}`);
    }

    if (this.selectedBrands.length > 0) {
      activeFilters.push(`Marcas: ${this.selectedBrands.join(', ')}`);
    } else if (this.selectedBrand && this.selectedBrand !== 'all') {
      activeFilters.push(`Marca: ${this.selectedBrand}`);
    }

    if (this.minPrice !== null || this.maxPrice !== null) {
      const priceRange = `${this.minPrice || 0} - ${this.maxPrice || '∞'}`;
      activeFilters.push(`Precio: $${priceRange}`);
    }

    if (this.hasStockFilter) {
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

  applyLocalFilters() {
    // REMOVIDO: Ya no aplicamos filtros locales, todos los filtros se envían al backend
    // Los productos ya vienen filtrados desde el backend
    this.filteredProducts = [...this.products];
    this.sortProducts();
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.updateDisplayedProducts();
  }

  applyPriceFilter() {
    this.currentPage = 1;
    this.fetchProducts(); // Recargar desde backend con nuevos filtros
  }

  clearAllFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.hasStockFilter = false;
    this.selectedBrand = 'all';
    this.selectedCategory = 'all';
    this.sortOrder = 'none';
    this.selectedBrands = [];
    this.selectedCategories = [];
    this.currentPage = 1;
    this.fetchProducts(); // Recargar desde backend sin filtros
  }

  applyAllFilters() {
    this.currentPage = 1;
    this.fetchProducts(); // Recargar desde backend con todos los filtros
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

  // Actualiza los productos mostrados según la página actual
  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const productsToDisplay = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
    this.displayedProducts = productsToDisplay.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }
  // Marcar / desmarcar MARCA (desktop + mobile) - COMPLETAMENTE OPTIMIZADO PARA BACKEND
  toggleBrand(brandName: string, checked: boolean): void {
    const i = this.selectedBrands.indexOf(brandName);
    if (checked && i === -1) this.selectedBrands.push(brandName);
    if (!checked && i !== -1) this.selectedBrands.splice(i, 1);

    // Al usar multi, dejamos el filtro simple en 'all' para que el backend no restrinja
    this.selectedBrand = 'all';
    this.currentPage = 1;
    this.fetchProducts(); // Ahora SIEMPRE usamos el backend
  }

  // Marcar / desmarcar CATEGORÍA (desktop + mobile) - COMPLETAMENTE OPTIMIZADO PARA BACKEND
  toggleCategory(catId: string, checked: boolean): void {
    const i = this.selectedCategories.indexOf(catId);
    if (checked && i === -1) this.selectedCategories.push(catId);
    if (!checked && i !== -1) this.selectedCategories.splice(i, 1);

    this.selectedCategory = 'all';
    this.currentPage = 1;
    this.fetchProducts(); // Ahora SIEMPRE usamos el backend
  }

  // Quitar desde chip
  removeBrand(brandName: string): void {
    this.selectedBrands = this.selectedBrands.filter(b => b !== brandName);
    this.currentPage = 1;
    this.fetchProducts();
  }

  removeCategory(catId: string): void {
    this.selectedCategories = this.selectedCategories.filter(c => c !== catId);
    this.currentPage = 1;
    this.fetchProducts();
  }

  // --- toggles estilo checkbox pero sin inputs, para listas interactivas ---
  toggleCategoryItem(catId: string): void {
    const nextChecked = !this.selectedCategories.includes(catId);
    this.toggleCategory(catId, nextChecked); // reutiliza el método optimizado
  }

  toggleBrandItem(brandName: string): void {
    const nextChecked = !this.selectedBrands.includes(brandName);
    this.toggleBrand(brandName, nextChecked); // reutiliza el método optimizado
  }

  // Este es del filtro de arriba (en los chips)
  getCategoryName(id: string): string {
    if (!id || !this.categories || !this.categories.length) return id;
    const cat = this.categories.find((x: any) => x && x._id === id);
    return cat?.type ?? id;
  }

  selectCategory(id: string) {
    this.categorySelectionService.selectCategory(id);
    
    // Navegar a la ruta actual manteniendo la funcionalidad en cada sección
    const currentUrl = this.router.url;
    if (currentUrl.includes('/product-update')) {
      this.router.navigate(['/product-update']);
    } else if (currentUrl.includes('/stock-ingreso')) {
      this.router.navigate(['/stock-ingreso']);
    } else if (currentUrl.includes('/stock-cargar')) {
      this.router.navigate(['/stock-cargar']);
    } else if (currentUrl.includes('/reporte-agrupar-productos')) {
      this.router.navigate(['/reporte-agrupar-productos']);
    } else {
      this.router.navigate(['/products-list']);
    }
  }
}
