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
  windowFocusTimeout: any;
  mercadoPagoWindowClosed: boolean = false;
  userReturnedTime: Date | null = null;

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
        this.configurarDeteccionVentana();
      } else {
        this.loading = false;
        this.paymentStatus = 'No se encontró información de la orden';
      }
    });
  }

  configurarDeteccionVentana() {
    // Detectar cuando el usuario vuelve a esta pestaña
    window.addEventListener('focus', () => {
      console.log('👁️ Usuario volvió a la pestaña');
      this.userReturnedTime = new Date();
      
      // Verificar inmediatamente cuando vuelve
      this.verificarEstadoPago();
      
      // Si han pasado más de 30 segundos sin verificar, asumir posible abandono
      if (this.windowFocusTimeout) {
        clearTimeout(this.windowFocusTimeout);
      }
      
      this.windowFocusTimeout = setTimeout(() => {
        if (this.paymentStatus === 'Procesando') {
          console.log('⚠️ Posible abandono de pago detectado');
          this.manejarPosibleAbandono();
        }
      }, 30000); // 30 segundos después de volver
    });

    // Detectar cuando el usuario sale de la pestaña  
    window.addEventListener('blur', () => {
      console.log('👀 Usuario salió de la pestaña');
    });
  }

  ngOnDestroy(): void {
    this.detenerVerificaciones();
    
    // Limpiar event listeners
    window.removeEventListener('focus', () => {});
    window.removeEventListener('blur', () => {});
  }

  iniciarVerificacionPeriodica() {
    // Verificar inmediatamente
    this.verificarEstadoPago();

    // Configurar verificación cada 6 segundos
    this.pollingSubscription = interval(6000).subscribe(() => {
      if (this.checkCount < this.maxChecks) {
        this.verificarEstadoPago();
        this.checkCount++;
        
        // Después de 1 minuto (10 checks), verificar menos frecuentemente
        if (this.checkCount >= 10) {
          this.pollingSubscription?.unsubscribe();
          this.iniciarVerificacionLenta();
        }
      } else {
        this.detenerVerificaciones();
        this.paymentStatus = 'Tiempo de espera agotado';
        this.loading = false;
      }
    });
  }

  iniciarVerificacionLenta() {
    console.log('📱 Cambiando a verificación cada 15 segundos');
    // Verificación más lenta para no saturar el servidor
    this.pollingSubscription = interval(15000).subscribe(() => {
      if (this.checkCount < this.maxChecks) {
        this.verificarEstadoPago();
        this.checkCount++;
      } else {
        this.detenerVerificaciones();
        this.mostrarOpcionesAbandono();
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
          console.log(this.orderDetails)
          
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
    if (this.windowFocusTimeout) {
      clearTimeout(this.windowFocusTimeout);
    }
  }

  manejarPosibleAbandono() {
    console.log('🚨 Manejando posible abandono de pago');
    
    // Hacer una última verificación
    this.mercadopagoService.syncPaymentStatus(this.orderId).subscribe({
      next: (response) => {
        if (response.success && response.payment_status === 'Procesando') {
          // El pago sigue pendiente, probablemente abandonado
          this.paymentStatus = 'Pago posiblemente abandonado';
          this.mostrarOpcionesAbandono();
        } else if (response.payment_status === 'Aprobado') {
          // El pago se completó mientras tanto
          this.router.navigate(['/pago/exito'], { 
            queryParams: { order: this.orderId } 
          });
        } else if (response.payment_status === 'Rechazado' || response.payment_status === 'Cancelado') {
          this.router.navigate(['/pago/error'], { 
            queryParams: { order: this.orderId } 
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar abandono:', error);
      }
    });
  }

  mostrarOpcionesAbandono() {
    this.paymentStatus = 'Tiempo de espera del pago';
    this.loading = false;
    
    // Actualizar el maxChecks para que ya no siga verificando automáticamente
    this.checkCount = this.maxChecks;
    this.detenerVerificaciones();
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

  reintentarPago() {
    // Redirigir de vuelta al carrito para reintentar el pago
    this.detenerVerificaciones();
    this.router.navigate(['/cart'], { 
      queryParams: { 
        retry: true, 
        order: this.orderId,
        message: 'Puedes intentar el pago nuevamente' 
      } 
    });
  }
}