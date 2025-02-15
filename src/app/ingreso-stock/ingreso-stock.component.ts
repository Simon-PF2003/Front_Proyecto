import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category-selection-service.service';

@Component({
  selector: 'app-ingreso-stock',
  templateUrl: './ingreso-stock.component.html',
  styleUrls: ['./ingreso-stock.component.css']
})
export class IngresoStockComponent implements OnInit {
  products: any[] = [];
  searchTerm: string = '';

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
    /*if (this.products.length === 0) {
      Swal.fire({
        title: 'Información',
        text: 'No hay productos sin stock.',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
    } else {
      this.products.forEach(product => product.quantityToBuy = 0);
    }*/
    this.products.forEach(product => product.quantityToBuy = 0);
  }

  async filterByCategory(category: string) {
    try {
      const data = await firstValueFrom(this.productService.filterByCategory(category));
      this.products = data.filter(product => product.stock < product.stockMin);
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
}
