import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductUpdateModalComponent } from '../product-update-modal/product-update-modal.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CategorySelectionService, Category } from '../../services/category.service';
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

  // ahora guarda el _id de la categoría (o 'all')
  selectedCategory: string = 'all';
  searchTerm: string = '';
  hasStockFilter: boolean = false;

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
    private categoryService: CategorySelectionService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.fetchProducts();
    });

    // Escuchar selecciones de categoría desde la navbar
    this.categoryService.categorySelected$.subscribe(async (category) => {
      this.selectedCategory = category;
      await this.fetchProducts();
    });
  }

  async fetchProducts() {
    try {
      let data;

      // Usar el nuevo método de filtros combinados
      data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.selectedCategory, 
          this.hasStockFilter
        )
      );

      this.products = data || [];
      this.filteredProducts = [...this.products];

      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      this.updateDisplayedProducts();
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
      this.totalPages = 1;
      this.updateDisplayedProducts();
    }
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
