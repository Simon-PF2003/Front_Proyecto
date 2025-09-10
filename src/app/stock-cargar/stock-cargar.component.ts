import { Component, OnInit } from '@angular/core';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { BillService } from '../services/bill.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock-cargar',
  templateUrl: './stock-cargar.component.html',
  styleUrls: ['./stock-cargar.component.css']
})
export class StockCargarComponent implements OnInit {
purchaseOrders: any[] = [];
  displayedOrders: any[] = [];
  selectedOrder: any = null;
  editingOrderId: string | null = null;
  editedQuantities: { [key: string]: number } = {};
  filters = {
    purchaseOrderID: '',
    supplierBusiness: '',
    minDate: '',
    maxDate: '',
  };

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private billService: BillService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.purchaseOrderService.getPendingPurchaseOrders(this.filters).subscribe((purchaseOrders) => {
      this.purchaseOrders = purchaseOrders;
      this.updatePagination();
    }, (err) => {
      console.error(err);
      Swal.fire('Error', 'El Nro de pedido debe ser un alfanumerico de 24 caracteres', 'error');
    });
  }

  applyFilters(): void {
    if (!this.validateFilters()) {
      return;
    }
    this.loadOrders();
  }

  validateFilters(): boolean {
    if (this.filters.minDate && this.filters.maxDate && new Date(this.filters.maxDate) < new Date(this.filters.minDate)) {
      Swal.fire('Error', 'La fecha hasta no puede ser menor que la fecha desde.', 'error');
      return false;
    }
    return true;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.purchaseOrders.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = this.purchaseOrders.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedOrders();
    }
  }

  enableEditing(purchaseOrderId: string): void {
    this.editingOrderId = purchaseOrderId;
    // Inicializar las cantidades editables con las cantidades originales
    const order = this.purchaseOrders.find(po => po._id === purchaseOrderId);
    if (order) {
      order.products.forEach((product: any) => {
        const key = `${purchaseOrderId}_${product.productId._id}`;
        this.editedQuantities[key] = product.quantity;
      });
    }
  }

  cancelEditing(): void {
    this.editingOrderId = null;
    this.editedQuantities = {};
  }

  updateQuantity(purchaseOrderId: string, productId: string, newQuantity: number): void {
    const key = `${purchaseOrderId}_${productId}`;
    this.editedQuantities[key] = newQuantity;
  }

  validateQuantity(quantity: number): boolean {
    return quantity >= 0 && Number.isInteger(quantity);
  }

  saveQuantityChanges(purchaseOrder: any): void {
    let hasInvalidQuantity = false;
    let hasChanges = false;

    // Validar todas las cantidades y verificar si hay cambios
    purchaseOrder.products.forEach((product: any) => {
      const key = `${purchaseOrder._id}_${product.productId._id}`;
      const newQuantity = this.editedQuantities[key];
      
      if (!this.validateQuantity(newQuantity)) {
        hasInvalidQuantity = true;
        return;
      }
      
      if (newQuantity !== product.quantity) {
        hasChanges = true;
      }
    });

    if (hasInvalidQuantity) {
      Swal.fire({
        title: 'Error',
        text: 'Las cantidades deben ser números enteros positivos o cero.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    // Actualizar las cantidades en el objeto
    purchaseOrder.products.forEach((product: any) => {
      const key = `${purchaseOrder._id}_${product.productId._id}`;
      product.quantity = this.editedQuantities[key];
    });

    this.editingOrderId = null;
    this.editedQuantities = {};

    if (hasChanges) {
      Swal.fire({
        title: 'Cantidades actualizadas',
        text: 'Las cantidades han sido modificadas. Ahora puede proceder a ingresar la orden de compra.',
        icon: 'success',
        confirmButtonColor: '#4CA7BF'
      });
    }
  }

  ingresarOrdenDeCompra(purchaseOrder: any): void {
    this.selectedOrder = purchaseOrder;
    Swal.fire({
      title: '¿Desea ingresar la orden de compra?',
      text: 'Esta acción marcará la orden de compra como recibida',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, ingresar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4CA7BF',
      cancelButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarIngreso();
      }
    });
  }

  cancelarOrdenDeCompra(purchaseOrder: any): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción cancelará la orden de compra.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar orden',
      cancelButtonText: 'No, mantener orden',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarCancelacion(purchaseOrder);
      }
    });
  }

  confirmarCancelacion(purchaseOrder: any): void {
    const purchaseOrderData = { purchaseOrderId: purchaseOrder._id };
    
    
    this.purchaseOrderService.cancelPurchaseOrder(purchaseOrderData).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Orden cancelada',
          text: 'La orden de compra ha sido cancelada exitosamente',
          icon: 'success',
          confirmButtonColor: '#4CA7BF'
        });
        this.loadOrders(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error al cancelar la orden de compra:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cancelar la orden de compra. Intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      },
    });
  }
  
  confirmarIngreso(): void {
    if (!this.selectedOrder) return;

    // Preparar los datos con las cantidades actualizadas
    const purchaseOrderData = { 
      purchaseOrderId: this.selectedOrder._id,
      products: this.selectedOrder.products.map((product: any) => ({
        productId: product.productId._id,
        quantity: product.quantity
      }))
    };

    console.log('Datos a enviar para actualizar la orden de compra:', purchaseOrderData);
    
    this.purchaseOrderService.updatePurchaseOrder(purchaseOrderData).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Éxito',
          text: 'El stock se ha actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#4CA7BF'
        });
        this.selectedOrder = null;
        this.loadOrders(); 
      },
      error: (error) => {
        console.error('Error al actualizar la orden de compra:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo marcar la orden de compra como recibida. Intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      },
    });
  }
}
