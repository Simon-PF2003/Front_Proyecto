import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category.service';

@Component({
  selector: 'app-stock-ingreso',
  templateUrl: './stock-ingreso.component.html',
  styleUrls: ['./stock-ingreso.component.css']
})
export class StockIngresoComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  selectedProducts: any[] = [];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Número de orden de compra
  orderNumber: number;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categorySelectionService: CategorySelectionService
  ) {
    // Cargar el número de orden desde localStorage o inicializarlo en 1243
    this.orderNumber = parseInt(localStorage.getItem('orderNumber') || '1243', 10);
  }

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
    try {
      const noStockData = await firstValueFrom(this.productService.getNoStockProducts());
  
      if (this.searchTerm) {
        try {
          const filteredData = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
          const stockFilteredData = filteredData.filter(product => product.stock < product.stockMin);
  
          if (stockFilteredData.length === 0) {
            Swal.fire('Sin resultados', 'No hay productos que cumplan con la descripción ingresada', 'info');
          }
  
          this.products = stockFilteredData;
        } catch (error) {
          if ((error as any).status === 400) {
            this.products = [];
            Swal.fire('Sin resultados', 'No hay productos que cumplan con la descripción ingresada', 'info');
          } else {
            console.error('Error al buscar productos:', error);
          }
        }
      } else {
        this.products = noStockData;
      }
  
      this.products.forEach(product => product.quantityToBuy = 0);
      this.updatePagination();
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
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

  generarOrdenDeCompra() {
    this.selectedProducts = this.products.filter(product => product.quantityToBuy > 0);
    if (this.selectedProducts.length === 0) {
      Swal.fire('Error', 'No ha seleccionado ninguna cantidad para comprar', 'error');
      return;
    }

    let orderSummary = '<ul>';
    this.selectedProducts.forEach(product => {
      orderSummary += `<li>${product.desc} - Cantidad: ${product.quantityToBuy} - Precio: ${product.price}</li>`;
    });
    orderSummary += '</ul>';
    
    const currentDate = new Date().toLocaleDateString();
    const orderNum = this.orderNumber;

    Swal.fire({
      title: 'Orden de Compra',
      html: `Proveedor: Star Computación <br> Número: ${orderNum} <br> Fecha: ${currentDate} <br> Estos son los productos que va a solicitar:<br>${orderSummary}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.solicitarStock();
        this.orderNumber++; // Incrementar el número de orden
        localStorage.setItem('orderNumber', this.orderNumber.toString()); // Guardar en localStorage
      }
    });
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
        Swal.fire('Orden de Compra Registrada', 'Se ha solicitado stock de los productos seleccionados', 'success');
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
