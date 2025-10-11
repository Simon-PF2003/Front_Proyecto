import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MercadopagoService } from '../services/mercadopago.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-payment-pending',
  templateUrl: './payment-pending.component.html',
  styleUrls: ['./payment-pending.component.css']
})
export class PaymentPendingComponent implements OnInit, OnDestroy {
  orderId: string = '';
  paymentStatus: string = 'Procesando';
  loading: boolean = true;
  orderDetails: any = null;
  private pollingSubscription?: Subscription;
  private timeoutSubscription?: Subscription;
  checkCount: number = 0;
  maxChecks: number = 20; // 20 checks = 2 minutos aproximadamente

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mercadopagoService: MercadopagoService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['order'] || '';
      if (this.orderId) {
        this.iniciarVerificacionPeriodica();
      } else {
        this.loading = false;
        this.paymentStatus = 'No se encontró información de la orden';
      }
    });
  }

  ngOnDestroy(): void {
    this.detenerVerificaciones();
  }

  iniciarVerificacionPeriodica() {
    // Verificar inmediatamente
    this.verificarEstadoPago();

    // Configurar verificación cada 6 segundos
    this.pollingSubscription = interval(6000).subscribe(() => {
      if (this.checkCount < this.maxChecks) {
        this.verificarEstadoPago();
        this.checkCount++;
      } else {
        this.detenerVerificaciones();
        this.paymentStatus = 'Tiempo de espera agotado';
        this.loading = false;
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
          
          // Si el estado cambió de "Procesando", redirigir
          if (response.payment_status === 'Aprobado') {
            this.detenerVerificaciones();
            this.router.navigate(['/pago/exito'], { 
              queryParams: { order: this.orderId } 
            });
          } else if (response.payment_status === 'Rechazado' || response.payment_status === 'Cancelado') {
            this.detenerVerificaciones();
            this.router.navigate(['/pago/error'], { 
              queryParams: { order: this.orderId } 
            });
          }
        } else {
          this.paymentStatus = 'Error al verificar el pago';
        }
      },
      error: (error) => {
        console.error('Error al verificar estado de pago:', error);
        // Continuar verificando en caso de error de red
      }
    });
  }

  detenerVerificaciones() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.timeoutSubscription) {
      this.timeoutSubscription.unsubscribe();
    }
  }

  volverAlInicio() {
    this.detenerVerificaciones();
    this.router.navigate(['/']);
  }

  verMisPedidos() {
    this.detenerVerificaciones();
    this.router.navigate(['/orders-retrieve-client']);
  }

  verificarManualmente() {
    this.loading = true;
    this.verificarEstadoPago();
  }
}