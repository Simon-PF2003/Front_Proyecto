import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { BillService } from '../services/bill.service';
import { AuthService } from '../services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-emision-factura',
  templateUrl: './emision-factura.component.html',
  styleUrls: ['./emision-factura.component.css']
})
export class EmisionFacturaComponent implements OnInit {
  orders: any[] = [];
  userId: string = '';
  selectedOrder: any = null;
  filters = {
    orderId: '',
    userBusiness: '',
    minTotal: '',
    maxTotal: '',
    minDate: '',
    maxDate: '',
  };

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
      /*if (orders.length === 0) {
        Swal.fire('Sin resultados', 'No hay pedidos que cumplan con los criterios seleccionados.', 'info');
        this.resetFilters();
      } else {
        this.orders = orders;
      }*/
     this.orders = orders;
    },
    (err) => {
      console.log(err);
      if (err.status === 404) {
        Swal.fire('Error', 'Usuario no encontrado. Verifique la razón social ingresada', 'error');
      } else {
        Swal.fire('Error', 'Error al cargar los pedidos', 'error');
      }      
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
    const today = new Date();
    if (this.filters.minDate && new Date(this.filters.minDate) > today) {
      Swal.fire('Error', 'La fecha desde no puede ser mayor que hoy.', 'error');
      return false;
    }
    if (this.filters.minDate && this.filters.maxDate && new Date(this.filters.maxDate) < new Date(this.filters.minDate)) {
      Swal.fire('Error', 'La fecha hasta no puede ser menor que la fecha desde.', 'error');
      return false;
    }
    if (this.filters.orderId && !/^[a-zA-Z0-9]{24}$/.test(this.filters.orderId)) {
      Swal.fire('Error', 'El ID del pedido debe tener 24 caracteres alfanuméricos.', 'error');
      return false;
    }
    return true;
  }

  resetFilters(): void {
    this.filters = {
      orderId: '',
      userBusiness: '',
      minTotal: '',
      maxTotal: '',
      minDate: '',
      maxDate: '',
    };
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
  
        const fechaFactura = new Intl.DateTimeFormat('es-AR', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        }).format(new Date());

        const filename = `${fechaFactura}_${facturaData.orderId}.pdf`;
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