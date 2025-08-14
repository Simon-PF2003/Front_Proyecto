import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductUpdateModalComponent } from '../product-update-modal/product-update-modal.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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

  selectedCategory: string = 'all';
  searchTerm: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

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
        try {
          data = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
        } catch (error) {
          if ((error as any).status === 400) {
            data = []; // Vaciar la lista si no hay coincidencias
            Swal.fire('Sin resultados', 'No hay productos que cumplan con la descripción ingresada', 'info');
          } else {
            console.error('Error al buscar productos:', error);
          }
        }
      }
  
      this.products = data || [];
  
      // **Solución: Asegurar que filteredProducts siempre tenga datos**
      this.filteredProducts = [...this.products];
  
      // **Actualizar paginación**
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      this.updateDisplayedProducts();
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category; // **Actualizar la categoría seleccionada**
  
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p => p.cat === category);
    }
  
    // **Actualizar paginación**
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }

  openEditModal(product: any): void {
    const modalRef = this.modalService.open(ProductUpdateModalComponent, { centered: true });
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
