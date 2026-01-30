import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../services/product.service';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { CategorySelectionService, Category } from '../services/category.service';
import { BrandSelectionService } from '../services/brand.service';
import { SupplierService } from '../services/supplier.service';
import { StockViewService } from '../services/stock-view.service';
import { StockCartService } from '../services/stock-cart.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-stock-ingreso',
  templateUrl: './stock-ingreso.component.html',
  styleUrls: ['./stock-ingreso.component.css']
})
export class StockIngresoComponent implements OnInit, OnDestroy {
  // Estado de la aplicación: 'suppliers' o 'products'
  currentView: 'suppliers' | 'products' = 'suppliers';
  
  // Datos de proveedores
  suppliers: any[] = [];
  displayedSuppliers: any[] = [];
  selectedSupplier: any = null;
  searchSupplierTerm: string = '';
  supplierLowStockCounts: { [key: string]: number } = {};
  apiUrl = environment.apiUrl;
  
  // Datos de productos
  products: any[] = [];
  displayedProducts: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedProducts: any[] = [];

  // Carrito
  cartItems: any[] = [];
  isCartVisible: boolean = false;

  // Filtros - replicados de product-list
  selectedCategory: string = 'all';
  selectedBrand: string = 'all';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  hasStockFilter: boolean = false;
  noStockFilter: boolean = false; 
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortOrder: string = 'none';

  // Datos para los filtros
  categories: any[] = [];
  brands: any[] = [];

  // Paginación para proveedores
  supplierCurrentPage: number = 1;
  supplierPageSize: number = 6;
  supplierTotalPages: number = 1;

  // Paginación para productos
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private purchaseOrderService: PurchaseOrderService,
    private categorySelectionService: CategorySelectionService,
    private brandService: BrandSelectionService,
    private supplierService: SupplierService,
    private stockViewService: StockViewService,
    private stockCartService: StockCartService
  ) {}

  ngOnInit(): void {
    // Cargar proveedores inicialmente
    this.fetchSuppliers();
    
    // Cargar categorías y marcas para filtros
    this.loadCategories();
    this.loadBrands();

    // Establecer vista inicial en el servicio
    this.stockViewService.setCurrentView(this.currentView);

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'];
      if (this.currentView === 'products' && this.selectedSupplier) {
        this.fetchProductsBySupplier();
      }
    });
  }

  // Cargar categorías para filtros
  async loadCategories() {
    try {
      this.categorySelectionService.getCategories().subscribe({
        next: (cats) => this.categories = cats || [],
        error: (e) => console.error('Error al cargar categorías:', e)
      });
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  // Cargar marcas para filtros
  async loadBrands() {
    try {
      this.brands = await firstValueFrom(this.brandService.getBrands());
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = [];
    }
  }

  // Métodos para manejar proveedores
  async fetchSuppliers() {
    try {
      if (!this.searchSupplierTerm.trim()) {
        this.suppliers = await this.supplierService.getSuppliers();
      } else {
        const result = await this.supplierService.searchSuppliers(this.searchSupplierTerm);
        this.suppliers = Array.isArray(result) ? result : [result];
      }
      
      // Cargar conteos de productos con bajo stock para cada proveedor
      await this.loadLowStockCountsForSuppliers();
      
      this.updateSupplierPagination();
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
      this.suppliers = [];
      if (this.searchSupplierTerm.trim()) {
        Swal.fire('Error', 'No se encontró ningún proveedor con ese criterio de búsqueda', 'warning');
      }
      this.updateSupplierPagination();
    }
  }

  private async loadLowStockCountsForSuppliers() {
    for (const supplier of this.suppliers) {
      const supplierId = supplier._id || supplier.id;
      try {
        const lowStockProducts = await firstValueFrom(
          this.productService.getLowStockProductsBySupplier(supplierId)
        );
        this.supplierLowStockCounts[supplierId] = lowStockProducts.length;
      } catch (error) {
        console.error(`Error al obtener productos con bajo stock para proveedor ${supplierId}:`, error);
        this.supplierLowStockCounts[supplierId] = 0;
      }
    }
  }

  getLowStockCount(supplier: any): number {
    const supplierId = supplier._id || supplier.id;
    return this.supplierLowStockCounts[supplierId] || 0;
  }

  onSearchSupplier() {
    this.fetchSuppliers();
  }

  selectSupplier(supplier: any) {
    this.selectedSupplier = supplier;
    this.currentView = 'products';
    // Notificar al servicio del cambio de vista
    this.stockViewService.setCurrentView(this.currentView);

    const supplierId = supplier._id || supplier.id;
    this.stockCartService.setCurrentSupplier(supplierId);
    this.subscribeCartForSupplier(supplierId);

    this.fetchProductsBySupplier();
  }

  private subscribeCartForSupplier(supplierId: string) {
     this.stockCartService.cartForSupplier$(supplierId).subscribe(items => {
      this.cartItems = items;
      // Actualizar badges "inCart" y cantidades de los productos cargados
      this.products.forEach(p => {
        p.inCart = this.isProductInCart(p._id);
        p.quantityToBuy = this.getProductCartQuantity(p._id);
      });
      this.updateDisplayedProducts();
    });
  }

  backToSuppliers() {
    this.currentView = 'suppliers';
    // Notificar al servicio del cambio de vista
    this.stockViewService.setCurrentView(this.currentView);
    this.selectedSupplier = null;
    this.products = [];
    this.displayedProducts = [];
    this.clearCart(); // Limpiar carrito al volver a proveedores
    this.isCartVisible = false; // Ocultar carrito
  }

  // Métodos para manejar productos del proveedor seleccionado
  async fetchProductsBySupplier() {
    if (!this.selectedSupplier) return;
    
    try {
      console.log('Aplicando filtros en el backend:', {
        supplier: this.selectedSupplier.businessName,
        searchTerm: this.searchTerm,
        selectedCategory: this.getSelectedCategoryForBackend(),
        selectedBrand: this.getSelectedBrandForBackend(),
        hasStockFilter: this.hasStockFilter,
        noStockFilter: this.noStockFilter,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice
      });
      
      // Enviar TODOS los filtros al backend para optimizar la consulta en BD
      const data = await firstValueFrom(
        this.productService.getProductsWithFilters(
          this.searchTerm, 
          this.getSelectedCategoryForBackend(), // Categoría seleccionada o 'all'
          this.getSelectedBrandForBackend(), // Marca seleccionada o 'all'
          undefined, // hasStock - no se usa en este contexto
          this.minPrice || undefined, // Filtro de precio mínimo
          this.maxPrice || undefined, // Filtro de precio máximo
          this.selectedSupplier._id || this.selectedSupplier.id, // ID del proveedor
          this.hasStockFilter, // lowStockOnly - productos con stock bajo
          this.noStockFilter // noStockOnly - productos sin stock
        )
      );
      
      // Convertir a array y procesar
      this.products = (data as any[]) || [];
      this.filteredProducts = [...this.products]; // Ya vienen filtrados desde BD
      
      const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
      // Inicializar propiedades para el carrito y marcar productos con stock bajo/sin stock
      this.products.forEach(product => {
        product.quantityToBuy = this.getProductCartQuantity(product._id);
        product.inCart = this.isProductInCart(product._id);
        product.tempQuantity = 0; // Para el input temporal
        product.isLowStock = product.stock < product.stockMin;
        product.isNoStock = product.stock === 0;
      });
      
      // Solo aplicar ordenamiento local
      this.sortProducts();
      this.updatePagination();
      
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      this.products = [];
      this.filteredProducts = [];
      
      if ((error as any).status === 400) {
        this.showFilteredResultsMessage();
      } else if ((error as any).status === 404) {
        Swal.fire('Proveedor no encontrado', 'El proveedor seleccionado no fue encontrado', 'error');
      } else {
        Swal.fire('Error', 'No se pudieron cargar los productos del proveedor', 'error');
      }
      this.updatePagination();
    }
  }

  // Métodos auxiliares para enviar filtros al backend
  getSelectedCategoryForBackend(): string | string[] {
    if (this.selectedCategories.length > 0) {
      // Enviar múltiples categorías como array
      return this.selectedCategories;
    } else if (this.selectedCategory && this.selectedCategory !== 'all') {
      // Enviar categoría única
      return this.selectedCategory;
    }
    return 'all';
  }

  getSelectedBrandForBackend(): string | string[] {
    if (this.selectedBrands.length > 0) {
      // Enviar múltiples marcas como array
      return this.selectedBrands;
    } else if (this.selectedBrand && this.selectedBrand !== 'all') {
      // Enviar marca única
      return this.selectedBrand;
    }
    return 'all';
  }

  // Mensaje mejorado para cuando no hay resultados con filtros aplicados
  showFilteredResultsMessage() {
    const activeFilters: string[] = [];

    if (this.searchTerm) {
      activeFilters.push(`Búsqueda: "${this.searchTerm}"`);
    }

    if (this.selectedCategories.length > 0) {
      const categoryNames = this.selectedCategories.map(catId => {
        const cat = this.categories.find(c => c._id === catId);
        return cat ? cat.type : 'Desconocida';
      }).join(', ');
      activeFilters.push(`Categorías: ${categoryNames}`);
    } else if (this.selectedCategory && this.selectedCategory !== 'all') {
      const cat = this.categories.find(c => c._id === this.selectedCategory);
      if (cat) activeFilters.push(`Categoría: ${cat.type}`);
    }

    if (this.selectedBrands.length > 0) {
      activeFilters.push(`Marcas: ${this.selectedBrands.join(', ')}`);
    } else if (this.selectedBrand && this.selectedBrand !== 'all') {
      activeFilters.push(`Marca: ${this.selectedBrand}`);
    }

    if (this.minPrice !== null || this.maxPrice !== null) {
      const priceRange = `${this.minPrice || 0} - ${this.maxPrice || '∞'}`;
      activeFilters.push(`Precio: $${priceRange}`);
    }

    if (this.hasStockFilter) {
      activeFilters.push('Solo productos con stock bajo');
    }

    if (this.noStockFilter) {
      activeFilters.push('Solo productos sin stock');
    }

    const filtersText = activeFilters.length > 0 
      ? activeFilters.join(' • ') 
      : 'filtros aplicados';

    Swal.fire({
      title: 'Sin productos encontrados',
      html: `
        <p>El proveedor <strong>"${this.selectedSupplier.businessName}"</strong> no tiene productos que cumplan con los filtros aplicados:</p>
        <div class="text-start mt-3">
          <small class="text-muted">${filtersText}</small>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      showCancelButton: true,
      cancelButtonText: 'Limpiar filtros',
      customClass: {
        popup: 'text-center'
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.clearAllFilters();
      }
    });
  }

  // Métodos de filtrado optimizados para usar el backend - COMPLETAMENTE BACKEND
  applyPriceFilter() {
    this.currentPage = 1;
    this.fetchProductsBySupplier(); // Recargar desde backend con nuevos filtros
  }

  clearAllFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.hasStockFilter = false;
    this.noStockFilter = false;
    this.selectedBrand = 'all';
    this.selectedCategory = 'all';
    this.sortOrder = 'none';
    this.selectedBrands = [];
    this.selectedCategories = [];
    this.searchTerm = '';
    this.currentPage = 1;
    this.fetchProductsBySupplier(); // Recargar desde backend sin filtros
  }

  applyAllFilters() {
    this.currentPage = 1;
    this.fetchProductsBySupplier(); // Recargar desde backend con todos los filtros
  }

  // Métodos para manejar los filtros de stock de forma mutuamente excluyente - OPTIMIZADOS
  onLowStockFilterChange() {
    if (this.hasStockFilter) {
      this.noStockFilter = false; // Desactivar el filtro de sin stock
    }
    this.currentPage = 1;
    this.fetchProductsBySupplier(); // Recargar desde backend con filtro de stock
  }

  onNoStockFilterChange() {
    if (this.noStockFilter) {
      this.hasStockFilter = false; // Desactivar el filtro de stock bajo
    }
    this.currentPage = 1;
    this.fetchProductsBySupplier(); // Recargar desde backend con filtro de stock
  }

  // Métodos para toggle de filtros múltiples - OPTIMIZADOS PARA BACKEND
  toggleCategoryItem(categoryId: string) {
    const nextChecked = !this.selectedCategories.includes(categoryId);
    this.toggleCategory(categoryId, nextChecked);
  }

  toggleBrandItem(brandName: string) {
    const nextChecked = !this.selectedBrands.includes(brandName);
    this.toggleBrand(brandName, nextChecked);
  }

  // Marcar / desmarcar CATEGORÍA - COMPLETAMENTE OPTIMIZADO PARA BACKEND
  toggleCategory(catId: string, checked: boolean): void {
    const i = this.selectedCategories.indexOf(catId);
    if (checked && i === -1) this.selectedCategories.push(catId);
    if (!checked && i !== -1) this.selectedCategories.splice(i, 1);

    this.selectedCategory = 'all'; // Reset para usar array de categorías
    this.currentPage = 1;
    
    // Ahora SIEMPRE usamos el backend, sin importar cuántas categorías
    this.fetchProductsBySupplier();
  }

  // Marcar / desmarcar MARCA - COMPLETAMENTE OPTIMIZADO PARA BACKEND
  toggleBrand(brandName: string, checked: boolean): void {
    const i = this.selectedBrands.indexOf(brandName);
    if (checked && i === -1) this.selectedBrands.push(brandName);
    if (!checked && i !== -1) this.selectedBrands.splice(i, 1);

    this.selectedBrand = 'all'; // Reset para usar array de marcas
    this.currentPage = 1;
    
    // Ahora SIEMPRE usamos el backend, sin importar cuántas marcas
    this.fetchProductsBySupplier();
  }

  // Métodos para manejar el carrito
  addToCart(product: any, quantity: number = 1) {
     if (!this.selectedSupplier) return;
    if (quantity <= 0) return;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;

    this.stockCartService.addItem(supplierId, {
      ...product,
      // Aseguramos los campos mínimos
      _id: product._id,
      code: product.code,
      desc: product.desc,
    }, quantity);

    // El subscribe de cartForSupplier$ actualizará product.inCart / quantityToBuy
    product.tempQuantity = 0;
  }

  removeFromCart(productId: string) {
    if (!this.selectedSupplier) return;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    this.stockCartService.removeItem(supplierId, productId);

    const originalProduct = this.products.find(p => p._id === productId);
    if (originalProduct) {
      originalProduct.quantityToBuy = 0;
      originalProduct.inCart = false;
      originalProduct.tempQuantity = 0;
    }
  }

  updateCartQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const cartItem = this.cartItems.find(item => item._id === productId);
    if (cartItem) {
      cartItem.quantityToBuy = newQuantity;
      
      // Sincronizar con la lista principal
      const originalProduct = this.products.find(p => p._id === productId);
      if (originalProduct) {
        originalProduct.quantityToBuy = newQuantity;
      }
    }
  }

  getProductCartQuantity(productId: string): number {
    if (!this.selectedSupplier) return 0;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    return this.stockCartService.getQuantity(supplierId, productId);
  }

  isProductInCart(productId: string): boolean {
    return this.getProductCartQuantity(productId) > 0;
  }

  getCartItemsCount(): number {
    if (!this.selectedSupplier) return 0;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    return this.stockCartService.getTotalUnits(supplierId);
  }

  clearCart() {
    if (!this.selectedSupplier) return;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    this.stockCartService.clearCart(supplierId);

    this.products.forEach(product => {
      product.quantityToBuy = 0;
      product.inCart = false;
      product.tempQuantity = 0;
    });
  }


  toggleCartVisibility() {
    this.isCartVisible = !this.isCartVisible;
  }

  generarOrdenDeCompra() {
    if (!this.selectedSupplier) return;

    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    const currentCart = this.stockCartService.getCartItems(supplierId);
    if (currentCart.length === 0) {
      Swal.fire('Error', 'No ha agregado productos al carrito para generar la orden', 'error');
      return;
    }

    // Usamos currentCart en lugar de this.cartItems (ambos están en sync)
    let orderSummary = '<ul class="text-start">';
    currentCart.forEach(item => {
      orderSummary += `<li><strong>${item.desc}</strong> (Código: ${item.code})<br>
                       Cantidad solicitada: <strong>${item.quantityToBuy}</strong></li>`;
    });
    orderSummary += '</ul>';

    const currentDate = new Date().toLocaleDateString();

    Swal.fire({
      title: 'Confirmar Orden de Compra',
      html: `
        <div class="text-start">
          <p><strong>Proveedor:</strong> ${this.selectedSupplier.businessName}</p>
          <p><strong>CUIT:</strong> ${this.selectedSupplier.cuit}</p>
          <p><strong>Fecha:</strong> ${currentDate}</p>
          <hr>
          <p><strong>Productos solicitados:</strong></p>
          ${orderSummary}
          <hr>
          <p class="text-muted">Total de productos: <strong>${currentCart.length}</strong></p>
          <p class="text-muted">Total de unidades: <strong>${this.getCartItemsCount()}</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Orden',
      cancelButtonText: 'Cancelar',
      width: 600,
      customClass: { popup: 'text-center' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.crearOrdenDeCompra();
      }
    });
  }

  crearOrdenDeCompra() {
    if (!this.selectedSupplier) return;
    const supplierId = this.selectedSupplier._id || this.selectedSupplier.id;
    const currentCart = this.stockCartService.getCartItems(supplierId);

    if (currentCart.length === 0) {
      Swal.fire('Error', 'No hay productos en el carrito para crear la orden', 'error');
      return;
    }

    const purchaseOrderData = {
      supplierId,
      products: currentCart.map(item => ({
        productId: item._id,
        quantity: item.quantityToBuy
      })),
    };

    this.purchaseOrderService.createPurchaseOrder(purchaseOrderData).subscribe({
      next: (response) => {
        console.log('Orden de compra creada exitosamente:', response);
        Swal.fire(
          'Orden de Compra Creada',
          `Se ha creado la orden de compra con ${currentCart.length} productos distintos y ${this.getCartItemsCount()} unidades totales`,
          'success'
        );

        // Limpiar SOLO el carrito de ese proveedor (los demás proveedores siguen intactos)
        this.stockCartService.clearCart(supplierId);

        // Refrescar flags visuales
        this.products.forEach(p => {
          p.quantityToBuy = 0;
          p.inCart = false;
          p.tempQuantity = 0;
        });

        this.fetchProductsBySupplier();
      },
      error: (error) => {
        console.error('Error al crear la orden de compra:', error);
        let errorMessage = 'Hubo un problema al crear la orden de compra';
        if (error.status === 404) errorMessage = 'No se encontró el proveedor seleccionado';
        else if (error.status === 403) errorMessage = 'Esta es una demostración. Las operaciones de escritura están deshabilitadas para proteger los datos.';
        else if (error.status === 400) errorMessage = 'Los datos de la orden no son válidos';
        else if (error.status === 500) errorMessage = 'Error interno del servidor. Intente nuevamente';

        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  // Métodos de paginación para proveedores
  updateSupplierPagination() {
    this.supplierTotalPages = Math.ceil(this.suppliers.length / this.supplierPageSize);
    this.supplierCurrentPage = 1;
    this.updateDisplayedSuppliers();
  }

  updateDisplayedSuppliers() {
    const start = (this.supplierCurrentPage - 1) * this.supplierPageSize;
    const end = start + this.supplierPageSize;
    this.displayedSuppliers = this.suppliers.slice(start, end);
  }

  changeSupplierPage(page: number) {
    if (page >= 1 && page <= this.supplierTotalPages) {
      this.supplierCurrentPage = page;
      this.updateDisplayedSuppliers();
    }
  }

  // Métodos de paginación para productos
  updatePagination() {
    const productsToPage = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
    this.totalPages = Math.ceil(productsToPage.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts() {
    const productsToPage = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = productsToPage.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }

  // Métodos de filtros simplificados - ELIMINADO (usamos clearAllFilters)
  sortProducts() {
    let productsToSort = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
    
    if (this.sortOrder === 'asc') {
      productsToSort.sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'desc') {
      productsToSort.sort((a, b) => b.price - a.price);
    } else if (this.sortOrder === 'name-asc') {
      productsToSort.sort((a, b) => a.desc.localeCompare(b.desc));
    } else if (this.sortOrder === 'name-desc') {
      productsToSort.sort((a, b) => b.desc.localeCompare(a.desc));
    } else if (this.sortOrder === 'stock-asc') {
      productsToSort.sort((a, b) => a.stock - b.stock);
    } else if (this.sortOrder === 'stock-desc') {
      productsToSort.sort((a, b) => b.stock - a.stock);
    }

    if (this.filteredProducts.length > 0) {
      this.filteredProducts = productsToSort;
    } else {
      this.products = productsToSort;
    }
    
    this.updateDisplayedProducts();
  }

  hasLowStockProducts(): boolean {
    return this.products.some(product => product.isLowStock);
  }

  // Métodos auxiliares para el template
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.type : 'Categoría desconocida';
  }

  ngOnDestroy(): void {
    // Resetear la vista a 'suppliers' al destruir el componente
    this.stockViewService.setCurrentView('suppliers');
    this.stockCartService.setCurrentSupplier(null);
  }
}
