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
    try {
      let data;
  
      // Usar el nuevo método de filtros combinados con filtros de precio y marca
      data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.selectedCategory,
          this.selectedBrand,
          this.hasStockFilter,
          this.minPrice || undefined,
          this.maxPrice || undefined
        )
      );
  
      this.products = data || [];
      await this.applyDiscountToProducts();
      
      this.applyLocalFilters();
      
    } catch (error) {
      if ((error as any).status === 400) {
        this.products = [];
        this.filteredProducts = [];
        Swal.fire('Sin resultados', 'No hay productos que cumplan con los filtros aplicados', 'info');
      } else {
        console.error('Error al obtener los productos:', error);
        this.products = [];
        this.filteredProducts = [];
      }
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      this.updateDisplayedProducts();
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

  applyLocalFilters() {
    let filtered = [...this.products];

    // 🔹 Filtrado local por CATEGORÍAS (multi)
    if (this.selectedCategories.length) {
      filtered = filtered.filter(p => {
        const pid = p?.cat?._id ?? p?.cat;
        return pid ? this.selectedCategories.includes(pid) : false;
      });
    } else if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => {
        const pid = p?.cat?._id ?? p?.cat;
        return pid === this.selectedCategory;
      });
    }

    // 🔹 Filtrado local por MARCAS (multi)
    if (this.selectedBrands.length) {
      filtered = filtered.filter(p => {
        const name = p?.brand?.brand ?? p?.brand;
        return name ? this.selectedBrands.includes(name) : false;
      });
    } else if (this.selectedBrand && this.selectedBrand !== 'all') {
      filtered = filtered.filter(p => {
        const name = p?.brand?.brand ?? p?.brand;
        return name === this.selectedBrand;
      });
    }

    this.filteredProducts = filtered;
    this.sortProducts();
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.updateDisplayedProducts();
  }

  applyPriceFilter() {
    this.fetchProducts();
  }

  clearAllFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.hasStockFilter = false;
    this.selectedBrand = 'all';
    this.sortOrder = 'none';
    this.fetchProducts();
    this.selectedBrands = [];
    this.selectedCategories = [];
  }

  applyAllFilters() {
    this.fetchProducts();
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
  // Este quilombo es para que el filtro puedas agregar y sacar y tener multiples marcas / categorias
  // Marcar / desmarcar MARCA (desktop + mobile)
  toggleBrand(brandName: string, checked: boolean): void {
    const i = this.selectedBrands.indexOf(brandName);
    if (checked && i === -1) this.selectedBrands.push(brandName);
    if (!checked && i !== -1) this.selectedBrands.splice(i, 1);

    // Al usar multi, dejamos el filtro simple en 'all' para que el backend no restrinja
    this.selectedBrand = 'all';
    this.currentPage = 1;
    this.fetchProducts(); // reutilizamos tu flujo
  }

  // Marcar / desmarcar CATEGORÍA (desktop + mobile)
  toggleCategory(catId: string, checked: boolean): void {
    const i = this.selectedCategories.indexOf(catId);
    if (checked && i === -1) this.selectedCategories.push(catId);
    if (!checked && i !== -1) this.selectedCategories.splice(i, 1);

    this.selectedCategory = 'all';
    this.currentPage = 1;
    this.fetchProducts(); // reutilizamos tu flujo
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

  // --- NUEVO: toggles estilo checkbox pero sin inputs, para listas interactivas ---
  toggleCategoryItem(catId: string): void {
    const nextChecked = !this.selectedCategories.includes(catId);
    this.toggleCategory(catId, nextChecked); // reutiliza tu método actual
  }

  toggleBrandItem(brandName: string): void {
    const nextChecked = !this.selectedBrands.includes(brandName);
    this.toggleBrand(brandName, nextChecked); // reutiliza tu método actual
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
    } else if (currentUrl.includes('/cargar-stock')) {
      this.router.navigate(['/cargar-stock']);
    } else if (currentUrl.includes('/reporte-agrupar-productos')) {
      this.router.navigate(['/reporte-agrupar-productos']);
    } else {
      this.router.navigate(['/products-list']);
    }
  }
}
