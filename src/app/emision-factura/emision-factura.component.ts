import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { BillService } from '../services/bill.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-emision-factura',
  templateUrl: './emision-factura.component.html',
  styleUrls: ['./emision-factura.component.css']
})
export class EmisionFacturaComponent implements OnInit {
  orders: any[] = [];
  displayedOrders: any[] = [];
  selectedOrder: any = null;
  filters = {
    orderId: '',
    userBusiness: '',
    minTotal: '',
    maxTotal: '',
    minDate: '',
    maxDate: '',
  };

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
    private orderService: OrderService, 
    private billService: BillService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getFinishedOrders(this.filters).subscribe((orders) => {
      this.orders = orders;
      this.updatePagination();
    }, (err) => {
      console.error(err);
      Swal.fire('Error', 'Error al cargar los pedidos', 'error');
    });
  }

  applyFilters(): void {
    if (!this.validateFilters()) {
      return;
    }
    this.loadOrders();
  }

  validateFilters(): boolean {
    if (this.filters.minTotal && Number(this.filters.minTotal) < 0) {
      Swal.fire('Error', 'El total mínimo no puede ser menor a 0.', 'error');
      return false;
    }
    if (this.filters.maxTotal && Number(this.filters.maxTotal) < Number(this.filters.minTotal)) {
      Swal.fire('Error', 'El total máximo no puede ser menor al total mínimo.', 'error');
      return false;
    }
    if (this.filters.minDate && this.filters.maxDate && new Date(this.filters.maxDate) < new Date(this.filters.minDate)) {
      Swal.fire('Error', 'La fecha hasta no puede ser menor que la fecha desde.', 'error');
      return false;
    }
    return true;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.orders.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = this.orders.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedOrders();
    }
  }

  emitirFactura(order: any): void {
    this.selectedOrder = order;
    Swal.fire({
      title: '¿Se realizó el pago?',
      text: 'Seleccione una opción',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      this.confirmarFactura(result.isConfirmed);
    });
  }
  
  confirmarFactura(pagado: boolean): void {
    if (!this.selectedOrder) return;
  
    const facturaData = { orderId: this.selectedOrder._id };
  
    this.billService.createBill(facturaData, pagado).subscribe({
      next: (pdfBlob: Blob) => {
        Swal.fire('Éxito', 'Factura generada correctamente', 'success');
        this.selectedOrder = null;
  
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const filename = `factura_${facturaData.orderId}.pdf`;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pdfUrl);

        location.reload();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo generar la factura', 'error');
      },
    });
  }
}
