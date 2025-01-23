import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-agrupar-productos',
  templateUrl: './agrupar-productos.component.html',
  styleUrls: ['./agrupar-productos.component.css']
})
export class AgruparProductosComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'all';
  editingProduct: any = null;
  newCategory: string = '';
  showModal: boolean = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.authService.checkAuthAndRedirect();

    try {
      // Fetch all products and categories
      const data = await firstValueFrom(this.productService.getProducts());
      this.products = data || [];
      this.filteredProducts = [...this.products];
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
