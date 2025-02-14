import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditProductModalComponent } from '../edit-product-modal/edit-product-modal.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modificar-producto',
  templateUrl: './modificar-producto.component.html',
  styleUrls: ['./modificar-producto.component.css']
})
export class ModificarProductoComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';


  constructor(
    private modalService: NgbModal,
    private productService: ProductService, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || ''; // Obtiene el término de búsqueda de la URL
      this.fetchProducts();
    });
  }

  async fetchProducts() {
    try {
      let data;
      if (this.searchTerm === 'Todos' || !this.searchTerm) {
        data = await firstValueFrom(this.productService.getProducts());
      } else {
        data = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
      }
  
      this.products = data || []; 
      this.filterByCategory(this.selectedCategory); 
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  }
  

  filterByCategory(category: string): void {
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.cat === category);
    }
  }
  

  openEditModal(product: any): void {
    const modalRef = this.modalService.open(EditProductModalComponent, { centered: true });
    modalRef.componentInstance.editedProduct = { ...product };
    modalRef.result.then((result: any) => {
      if (result) {
        this.updateProductList(result);
      }
    }).catch(() => {});
  }

  updateProductList(updatedProduct: any): void {
    const index = this.products.findIndex(p => p._id === updatedProduct._id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
      this.filterByCategory(this.selectedCategory);
    }
  }
}
