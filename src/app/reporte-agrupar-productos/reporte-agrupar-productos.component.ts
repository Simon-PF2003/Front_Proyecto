import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reporte-agrupar-productos',
  templateUrl: './reporte-agrupar-productos.component.html',
  styleUrls: ['./reporte-agrupar-productos.component.css']
})
export class ReporteAgruparProductosComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  selectedCategory: string = 'all';
  editingProduct: any = null;
  newCategory: string = '';
  showModal: boolean = false;
  searchTerm: string = '';

  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private categorySelectionService: CategorySelectionService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.fetchProducts();
    });

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      this.selectedCategory = category === 'all' ? 'all' : category;
      this.fetchProducts();
    });
  }

  async fetchProducts() {
    try {
      // Usar el método unificado de filtrado
      const data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.selectedCategory === 'all' ? '' : this.selectedCategory, 
          undefined, 
          undefined  
        )
      );
      this.products = data || [];
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching products:', error);
      this.products = [];
      this.updatePagination();
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.products.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = this.products.slice(start, end);
  }

  changePage(page: number) {
    if(page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }

  onCategoryChange(category: string) {
    this.categorySelectionService.selectCategory(category);
  }

  editCategory(product: any) {
    this.editingProduct = product;
    this.newCategory = product.cat || '';
  }
  
  openModal(product:any) {
    this.showModal = true;
    this.editingProduct = product;
  }

  closeModal() {
    console.log('Closing modal'); // Debug
    this.editingProduct = null;
    this.showModal=false;
  }
  
  async saveCategory() {
    if (this.editingProduct) {
      try {
        // Actualiza el campo 'cat' del producto
        this.editingProduct.cat = this.newCategory;
        await firstValueFrom(this.productService.updateProduct(this.editingProduct, this.editingProduct._id));
  
        // Refresca los productos usando el método unificado
        this.fetchProducts();
  
        this.closeModal();
      } catch (error) {
        console.error('Error updating product category:', error);
      }
    }
  }

}
