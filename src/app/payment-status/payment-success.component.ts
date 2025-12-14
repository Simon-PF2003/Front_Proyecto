import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MercadopagoService } from '../services/mercadopago.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string = '';
  orderCode: string = '';
  paymentStatus: string = 'Verificando...';
  loading: boolean = true;
  orderDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mercadopagoService: MercadopagoService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order'] || '';
      if (this.orderId) {
        this.verificarEstadoPago();
      } else {
        this.loading = false;
        this.paymentStatus = 'No se encontró información de la orden';
      }
    });
  }

  verificarEstadoPago() {
    this.mercadopagoService.syncPaymentStatus(this.orderId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.paymentStatus = response.payment_status;
          this.orderDetails = response;
          this.orderCode = response.code || this.orderId;
          
          if (response.payment_status === 'Aprobado') {
            // Mostrar mensaje de éxito
            this.mostrarExito();
          } else if (response.payment_status === 'Procesando') {
            // Redirigir a pendiente si aún está procesando
            setTimeout(() => {
              this.router.navigate(['/pago/pendiente'], { 
                queryParams: { order: this.orderId } 
              });
            }, 3000);
          }
        } else {
          this.paymentStatus = 'Error al verificar el pago';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al verificar estado de pago:', error);
        this.paymentStatus = 'Error al verificar el pago';
      }
    });
  }

  mostrarExito() {
    Swal.fire({
      icon: 'success',
      title: '¡Pago Exitoso!',
      html: `
        <p>Tu pago se procesó correctamente.</p>
        <p><strong>Orden:</strong> ${this.orderCode}</p>
        <p><strong>Estado:</strong> ${this.paymentStatus}</p>
      `,
      confirmButtonText: 'Continuar'
    });
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  verMisPedidos() {
    this.router.navigate(['/orders-retrieve-client']);
  }
}