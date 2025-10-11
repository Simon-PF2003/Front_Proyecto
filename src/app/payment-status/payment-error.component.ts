import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MercadopagoService } from '../services/mercadopago.service';

@Component({
  selector: 'app-payment-error',
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.css']
})
export class PaymentErrorComponent implements OnInit {
  orderId: string = '';
  paymentStatus: string = 'Error en el pago';
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
          
          // Si el pago fue aprobado, redirigir a éxito
          if (response.payment_status === 'Aprobado') {
            this.router.navigate(['/pago/exito'], { 
              queryParams: { order: this.orderId } 
            });
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

  volverAlCarrito() {
    this.router.navigate(['/cart']);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  reintentar() {
    // Volver al carrito para reintentar el pago
    this.volverAlCarrito();
  }
}