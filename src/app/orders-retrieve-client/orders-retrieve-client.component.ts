import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-retrieve-client',
  templateUrl: './orders-retrieve-client.component.html',
  styleUrls: ['./orders-retrieve-client.component.css']
})
export class OrdersRetrieveClientComponent implements OnInit {
  orders: any[] = [];
  displayedOrders: any[] = [];
  userId: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserData().subscribe((data) => {
      this.userId = data.id;
      this.fetchOrders();
    });
  }

  fetchOrders(): void {
    this.orderService.getPedidosUsuario(this.userId).subscribe((data: any) => {
      this.orders = data.pedidos;
      this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.updatePagination();
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.orders.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = this.orders.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedOrders();
    }
  }

  hourFormat(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  getPaymentStatusText(paymentStatus: string): string {
    if (!paymentStatus) {
      return 'No procesado';
    }

    switch (paymentStatus.toLowerCase()) {
      case 'aprobado':
      case 'approved':
        return 'Pagado';
      case 'pendiente':
      case 'pending':
        return 'Pago Pendiente';
      case 'procesando':
        return 'Procesando';
      case 'rechazado':
      case 'rejected':
        return 'Pago Rechazado';
      case 'cancelado':
      case 'cancelled':
        return 'Pago Cancelado';
      default:
        return paymentStatus;
    }
  }

  cancelOrder(orderId: string): void {
    Swal.fire({
      title: '¿Estás seguro de cancelar el pedido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(orderId).subscribe({
          next: () => {
            Swal.fire('Confirmado', 'Pedido Cancelado', 'success').then(() => {
              this.fetchOrders();
            });
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }
}
