import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { BillService } from '../services/bill.service';
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
    private authService: AuthService,
    private billService: BillService
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

  verFactura(orderId: string): void {
    if (!orderId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de orden no válido',
      });
      return;
    }

    // Mostrar loading mientras se obtiene el PDF
    Swal.fire({
      title: 'Cargando factura...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Primero obtener la factura por orderId
    this.billService.getBillByOrderId(orderId).subscribe({
      next: (bill: any) => {
        if (!bill || !bill._id) {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Factura no encontrada',
            text: 'Esta orden no tiene una factura asociada.',
          });
          return;
        }

        // Ahora obtener el PDF con el billId
        this.billService.getBillPDF(bill._id).subscribe({
          next: (pdfBlob: Blob) => {
            Swal.close();
            
            // Crear URL del blob y abrirlo en nueva pestaña
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            // Liberar el objeto URL después de un tiempo
            setTimeout(() => {
              URL.revokeObjectURL(pdfUrl);
            }, 100);
          },
          error: (error) => {
            Swal.close();
            console.error('Error al obtener PDF de factura:', error);
            
            let errorMessage = 'Ocurrió un error al obtener la factura.';
            if (error.status === 404) {
              errorMessage = 'Factura no encontrada.';
            } else if (error.status === 400) {
              errorMessage = 'ID de factura inválido.';
            } else if (error.status === 500) {
              errorMessage = 'Error interno del servidor al generar el PDF.';
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error al visualizar factura',
              text: errorMessage,
            });
          }
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error al buscar factura por orden:', error);
        
        let errorMessage = 'No se pudo encontrar la factura para esta orden.';
        if (error.status === 404) {
          errorMessage = 'Esta orden no tiene una factura generada.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Factura no encontrada',
          text: errorMessage,
        });
      }
    });
  }
}
