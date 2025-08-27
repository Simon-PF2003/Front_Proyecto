import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category.service';
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
  
  brands: any[] = [];

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
    private brandService: BrandSelectionService
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

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      this.selectedCategory = category;
      await this.fetchProducts();
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
}
