import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category-selection-service.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products-retrieve',
  templateUrl: './products-retrieve.component.html',
  styleUrls: ['./products-retrieve.component.css']
})
export class ProductsRetrieveComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  sortOrder: string = 'none';
  discountPercentage: number = 0;
  // Paginación
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categorySelectionService: CategorySelectionService
  ) {}

  async ngOnInit() {
    // Verifica la autenticación al cargar la página
    this.authService.checkAuthAndRedirect();

    await this.fetchUserDiscount();
    await this.fetchProducts();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || ''; // Obtiene el término de búsqueda de la URL
      this.fetchProducts();
    });

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      await this.filterByCategory(category);
    });
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
  
      if (this.searchTerm === 'Todos' || !this.searchTerm) {
        data = await firstValueFrom(this.productService.getProducts());
      } else {
        try {
          data = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
        } catch (error) {
          if ((error as any).status === 400) {
            data = []; // Vaciar la lista de productos si no hay coincidencias
            Swal.fire('Sin resultados', 'No hay productos que cumplan con la descripción ingresada', 'info');
          } else {
            console.error('Error al buscar productos:', error);
          }
        }
      }
  
      this.products = data || [];

      await this.applyDiscountToProducts();

      this.totalPages = Math.ceil(this.products.length / this.pageSize);
      this.updateDisplayedProducts();
    } catch (error) {
      console.error('Error al obtener los productos:', error);
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
  
  async filterByCategory(category: string) {
    try {
      this.products = await firstValueFrom(this.productService.filterByCategory(category)) || [];
    } catch (error) {
      this.products = await firstValueFrom(this.productService.getProducts()) || [];
      console.error('Error fetching products by category', error);
    }

    this.totalPages = Math.ceil(this.products.length / this.pageSize);
    this.updateDisplayedProducts();
  }

  sortProducts() {
    if (this.sortOrder === 'asc') {
      this.products.sort((a, b) => a.price - b.price); // Ordena por precio ascendente
    } else if (this.sortOrder === 'desc') {
      this.products.sort((a, b) => b.price - a.price); // Ordena por precio descendente
    }
    this.updateDisplayedProducts();
  }

  // Actualiza los productos mostrados según la página actual
  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = this.products.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }
}
