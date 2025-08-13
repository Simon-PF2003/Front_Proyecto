import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
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
  filteredProducts: any[] = [];
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
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.fetchProducts();
    }
    );
  }

  async fetchProducts() {
    try {
      // Fetch all products and categories
      if (this.searchTerm === 'all' || !this.searchTerm) {
        const data = await firstValueFrom(this.productService.getProducts());
        this.products = data || [];
      } else {
        // Filter products by search term
        const data = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
        this.products = data || [];
      }
      this.filterByCategory(this.selectedCategory);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => product.cat === category);
    }

    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = this.filteredProducts.slice(start, end);
  }

  changePage(page: number) {
    if(page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
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
  
        // Refresca los productos y aplica el filtro nuevamente
        const data = await firstValueFrom(this.productService.getProducts());
        this.products = data || [];
        this.filterByCategory(this.selectedCategory);
  
        this.closeModal();
      } catch (error) {
        console.error('Error updating product category:', error);
      }
    }
  }

}
