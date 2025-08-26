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
  selectedCategory: string = 'all'; // Nueva propiedad
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
          this.selectedCategory
        )
      );
      
      // Filtrar solo productos con stock bajo (stock < stockMin)
      this.products = data.filter(product => product.stock < product.stockMin);
      
      if (this.products.length === 0 && this.searchTerm) {
        Swal.fire('Sin resultados', 'No hay productos con stock bajo que cumplan con los filtros', 'info');
      }
      
      // Inicializar quantityToBuy
      this.products.forEach(product => product.quantityToBuy = 0);
      this.updatePagination();
    } catch (error) {
      if ((error as any).status === 400) {
        this.products = [];
        Swal.fire('Sin resultados', 'No hay productos que cumplan con los filtros aplicados', 'info');
      } else {
        console.error('Error al obtener los productos:', error);
        this.products = [];
      }
      this.updatePagination();
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
