import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-update-admin',
  templateUrl: './orders-update-admin.component.html',
  styleUrls: ['./orders-update-admin.component.css']
})
export class OrdersUpdateAdminComponent {
  searchTerm: string = '';
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  displayedPedidos: any[] = [];
  
  // Control de pedidos colapsables
  expandedPedidos: Set<string> = new Set();
  
  // Modal de edición
  showModal: boolean = false;
  selectedPedido: any | null = null;
  
  // Campos editables del pedido seleccionado
  editingStatus: string = '';
  editingPaymentStatus: string = '';
  editingPaymentMethod: string = '';

  // Filtros (se envían al backend)
  filterBusinessName: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  filterStatus: string[] = ['Pendiente', 'En curso']; // Por defecto filtrar por Pendiente
  filterBilled: string = 'all'; // 'all', 'true', 'false'
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;
  
  // Ordenamiento (se envía al backend)
  sortBy: string = 'createdAt'; // Por defecto ordenar por fecha de creación
  sortOrder: string = 'desc';   // Por defecto descendente (más recientes primero)

  // Opciones de estado
  statusOptions: string[] = ['Pendiente', 'En curso', 'Terminado', 'Entregado', 'Cancelado'];
  paymentStatusOptions: string[] = ['Pendiente', 'Aprobado'];
  paymentMethodOptions: string[] = ['Efectivo', 'MercadoPago_Tarjeta'];

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Establecer rango de fechas por defecto: último mes
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    this.filterDateFrom = this.formatDateForInput(lastMonth);
    this.filterDateTo = this.formatDateForInput(today);
    
    this.fetchOrders();
    
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'];
      if (this.searchTerm) {
        this.fetchOrders();
      }
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async fetchOrders() {
    try {
      // Construir filtros y ordenamiento para enviar al backend
      const filters: any = {};
      
      if (this.filterBusinessName) filters.businessName = this.filterBusinessName;
      if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
      if (this.filterDateTo) filters.dateTo = this.filterDateTo;
      if (this.filterStatus.length > 0) filters.status = this.filterStatus;
      if (this.filterBilled !== 'all') filters.billed = this.filterBilled === 'true';
      if (this.filterMinPrice !== null) filters.minPrice = this.filterMinPrice;
      if (this.filterMaxPrice !== null) filters.maxPrice = this.filterMaxPrice;
      
      // Agregar ordenamiento
      if (this.sortBy) filters.sortBy = this.sortBy;
      if (this.sortOrder) filters.sortOrder = this.sortOrder;
      
      console.log('Enviando filtros y ordenamiento al backend:', filters);
      const data = await firstValueFrom(this.orderService.getPedidosWithFilters(filters));
      console.log('Datos recibidos del backend:', data);
      
      // Procesar datos de usuario
      for (const pedido of data) {
        if (pedido.userId && pedido.userId.businessName) {
          pedido.businessName = pedido.userId.businessName;
          pedido.userCode = pedido.userId.code;
        } else {
          console.warn('Pedido sin datos de usuario populados:', pedido);
          pedido.businessName = 'Usuario no encontrado';
          pedido.userCode = 'N/A';
        }
      }
      
      this.pedidosFiltrados = data;
      this.currentPage = 1;
      this.updatePagination();
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      this.pedidosFiltrados = [];
      this.updatePagination();
    }
  }

  // Los filtros se aplican enviando petición al backend
  applyFilters() {
    this.fetchOrders();
  }

  clearAllFilters() {
    this.filterBusinessName = '';
    
    // Restablecer rango de fechas al último mes
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    this.filterDateFrom = this.formatDateForInput(lastMonth);
    this.filterDateTo = this.formatDateForInput(today);
    
    this.filterStatus = ['Pendiente']; // Por defecto Pendiente
    this.filterBilled = 'all';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.currentPage = 1;
    
    this.applyFilters();
  }

  // Métodos para manejar filtros de estado múltiple
  toggleStatusFilter(status: string) {
    const index = this.filterStatus.indexOf(status);
    if (index > -1) {
      this.filterStatus.splice(index, 1);
    } else {
      this.filterStatus.push(status);
    }
    this.applyFilters();
  }

  removeStatusFilter(status: string) {
    const index = this.filterStatus.indexOf(status);
    if (index > -1) {
      this.filterStatus.splice(index, 1);
      this.applyFilters();
    }
  }

  applyPriceFilter() {
    this.applyFilters();
  }

  // Control de pedidos expandidos/colapsados
  togglePedidoExpansion(pedidoId: string) {
    if (this.expandedPedidos.has(pedidoId)) {
      this.expandedPedidos.delete(pedidoId);
    } else {
      this.expandedPedidos.add(pedidoId);
    }
  }

  isPedidoExpanded(pedidoId: string): boolean {
    return this.expandedPedidos.has(pedidoId);
  }

  // Formatear método de pago
  getPaymentMethodLabel(method: string): string {
    if (method === 'MercadoPago_Tarjeta') {
      return 'Transferencia';
    }
    return method || 'Efectivo';
  }

  async updatePedido() {
    if (!this.selectedPedido) return;

    try {
      const updateData: any = {};
      
      // Detectar cambios en cada campo
      if (this.editingStatus && this.editingStatus !== this.selectedPedido.status) {
        updateData.status = this.editingStatus;
      }
      
      if (this.editingPaymentStatus && this.editingPaymentStatus !== this.selectedPedido.payment_status) {
        updateData.payment_status = this.editingPaymentStatus;
      }
      
      if (this.editingPaymentMethod && this.editingPaymentMethod !== this.selectedPedido.payment_method) {
        updateData.payment_method = this.editingPaymentMethod;
      }

      // Validar que hay cambios
      if (Object.keys(updateData).length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin cambios',
          text: 'No se detectaron cambios para actualizar',
        });
        return;
      }

      // Actualizar pedido (el backend maneja automáticamente el envío del email)
      const response = await firstValueFrom(
        this.orderService.updatePedidoMultipleFields(this.selectedPedido._id, updateData)
      );

      // Recargar pedidos desde el backend
      await this.fetchOrders();
      this.closeModal();

      // Mensaje de éxito
      const changedFields = Object.keys(updateData).map(key => {
        if (key === 'status') return 'Estado';
        if (key === 'payment_status') return 'Estado de Pago';
        if (key === 'payment_method') return 'Método de Pago';
        return key;
      }).join(', ');

      Swal.fire({
        icon: 'success',
        title: '¡Pedido actualizado!',
        html: 'El pedido se actualizó correctamente.',
        timer: 3000,
        showConfirmButton: true
      });
    } catch (error: any) {
      console.error('Error al actualizar pedido:', error);
      
      const errorMessage = error?.error?.message || error?.message || 'No se pudo actualizar el pedido';
      
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar el pedido',
        text: errorMessage,
      });
    }
  }

  openModal(pedido: any) {
    console.log('Abriendo modal para pedido:', pedido);
    this.showModal = true;
    this.selectedPedido = pedido;
    
    // Inicializar campos de edición con valores actuales
    this.editingStatus = pedido.status || 'Pendiente';
    this.editingPaymentStatus = pedido.payment_status || 'Pendiente';
    this.editingPaymentMethod = pedido.payment_method || 'Efectivo';
  }

  closeModal() {
    this.showModal = false;
    this.selectedPedido = null;
    this.editingStatus = '';
    this.editingPaymentStatus = '';
    this.editingPaymentMethod = '';
  }

  // Métodos de paginación
  updatePagination() {
    this.totalPages = Math.ceil(this.pedidosFiltrados.length / this.itemsPerPage);
    this.updateDisplayedPedidos();
  }

  updateDisplayedPedidos() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedPedidos = this.pedidosFiltrados.slice(start, end);
  }

  get paginatedPedidos() {
    return this.displayedPedidos;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPedidos();
    }
  }
}
