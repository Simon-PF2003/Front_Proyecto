import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category-selection-service.service';

@Component({
  selector: 'app-ingreso-stock',
  templateUrl: './ingreso-stock.component.html',
  styleUrls: ['./ingreso-stock.component.css']
})
export class IngresoStockComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categorySelectionService: CategorySelectionService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'];
      this.fetchProducts();
    });

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      await this.filterByCategory(category);
    });
  }

  async fetchProducts() {
    const noStockData = await firstValueFrom(this.productService.getNoStockProducts());
    if (this.searchTerm) {
      const filteredData = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
      this.products = filteredData.filter(product => product.stock < product.stockMin);
    } else {
      this.products = noStockData;
    }
    this.products.forEach(product => product.quantityToBuy = 0);
    this.updatePagination();
  }

  async filterByCategory(category: string) {
    try {
      const data = await firstValueFrom(this.productService.filterByCategory(category));
      this.products = data.filter(product => product.stock < product.stockMin);
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching products by category', error);
    }
  }

  solicitarStock() {
    const productsToRequest = this.products
      .filter(product => product.quantityToBuy > 0)
      .map(product => ({
        _id: product._id,
        quantityToBuy: product.quantityToBuy
      }));
  
    if (productsToRequest.length === 0) {
      Swal.fire('Error', 'No ha seleccionado ninguna cantidad para solicitar', 'error');
      return;
    }
  
    this.productService.requestStock(productsToRequest).subscribe(
      () => {
        Swal.fire('Solicitud enviada', 'Se ha solicitado stock de los productos seleccionados', 'success');
        this.fetchProducts(); // Recargar productos para actualizar el stock pendiente en la UI
      },
      (error) => {
        console.error('Error al solicitar stock:', error);
        Swal.fire('Error', 'Hubo un problema al solicitar stock', 'error');
      }
    );
  }

  ingresarStock() {
    this.router.navigate(['/cargar-stock']);
  }

  // Métodos de paginación
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
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }
}
