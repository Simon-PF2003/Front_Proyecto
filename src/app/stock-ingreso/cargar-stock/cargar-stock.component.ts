import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CategorySelectionService } from '../../services/category.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cargar-stock',
  templateUrl: './cargar-stock.component.html',
  styleUrls: ['./cargar-stock.component.css']
})
export class CargarStockComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private categorySelectionService: CategorySelectionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.fetchProducts();
    });

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      this.selectedCategory = category === 'all' ? 'all' : category;
      this.fetchProducts();
    });
  }

  async fetchProducts() {
    try {
      // Primero obtener todos los productos con filtros aplicados
      const filteredData = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.selectedCategory === 'all' ? '' : this.selectedCategory, 
          undefined // hasStock = undefined para incluir todos los productos
        )
      );

      // Luego filtrar solo los que tienen pending > 0
      this.products = filteredData.filter(product => 
        product.pending !== undefined && product.pending > 0
      );

      this.products.forEach(product => product.quantityToAdd = product.pending);
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching pending stock products', error);
      this.products = [];
      this.updatePagination();
    }
  }

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

  confirmarCambioCantidad(product: any) {
    if (product.quantityToAdd !== product.pending) {
      Swal.fire({
        title: 'Cantidad modificada',
        text: `Has cambiado la cantidad de ${product.pending} a ${product.quantityToAdd}.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  verificarCantidad(product: any) {
    if (product.quantityToAdd !== product.pending) {
      Swal.fire({
        title: 'Advertencia',
        text: 'La cantidad ingresada no coincide con la cantidad solicitada. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ingresarStock([product]);
        }
      });
    } else {
      this.ingresarStock([product]);
    }
  }

  ingresarStock(products: any[]) {
    const productsToUpdate = products.map(product => ({
      _id: product._id,
      quantityToBuy: product.quantityToAdd
    }));

    this.productService.updateStock({ productsToUpdate }).subscribe(
      () => {
        Swal.fire('Éxito', 'Stock ingresado correctamente', 'success');
        this.fetchProducts();
      },
      (error) => {
        console.error('Error al ingresar stock:', error);
        Swal.fire('Error', 'Hubo un problema al ingresar el stock', 'error');
      }
    );
  }

  ingresarTodoElStock() {
    if (this.products.length === 0) {
      Swal.fire('Información', 'No hay productos con stock pendiente.', 'info');
      return;
    }
  
    // Verificar si hay discrepancias en la cantidad a ingresar
    const productosConDiferencia = this.products.filter(
      product => product.quantityToAdd !== product.pending
    );
  
    if (productosConDiferencia.length > 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Algunos productos tienen una cantidad ingresada diferente a la cantidad pendiente. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ingresarStock(this.products);
        }
      });
    } else {
      this.ingresarStock(this.products);
    }
  }
  
}