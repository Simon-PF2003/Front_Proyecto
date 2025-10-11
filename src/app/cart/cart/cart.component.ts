import { Component, OnInit } from '@angular/core';
import { CartServiceService } from 'src/app/services/cart-service.service';
import { CartItem } from '../art-item.model';
import { OrderService } from 'src/app/services/order.service';
import { AuthService } from 'src/app/services/auth.service';
import { countService } from 'src/app/services/count-cart.service';
import { OrderValidationService, StockValidationResult } from 'src/app/services/order-validation.service';
import { MercadopagoService } from 'src/app/services/mercadopago.service';
import Swal from 'sweetalert2';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  productsInCart: number = 0;
  selectedPaymentMethod: string = 'sin_pagar'; // Valor por defecto

  constructor(
    private cartService: CartServiceService,
    private orderService: OrderService,
    private authService: AuthService,
    private countService: countService,
    private productService: ProductService,
    private orderValidationService: OrderValidationService,
    private mercadopagoService: MercadopagoService,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.total = this.cartService.calculateTotal();
  }

updateQuantity(productId: string, newQuantity: number) {
  this.cartService.updateQuantity(productId, newQuantity).subscribe({
    next: (success) => {
      if (success) {
        // Solo actualizar la UI si la operación fue exitosa
        this.cartItems = this.cartService.getCartItems();
        this.total = this.cartService.calculateTotal();
        this.productsInCart = this.cartService.calculateProductsInCart();
        localStorage.setItem('productsInCart', this.productsInCart.toString());
        this.countService.updateProductsInCartValue(this.productsInCart);
      }
      // Si no fue exitosa, el CartService ya mostró el error
    },
    error: (error) => {
      console.error('Error al actualizar cantidad:', error);
    }
  });
}

removeFromCart(productId: string) {
  this.cartService.removeFromCart(productId);
  this.cartItems = this.cartService.getCartItems();
  this.total = this.cartService.calculateTotal();
  this.productsInCart = this.cartService.calculateProductsInCart();
  localStorage.setItem('productsInCart', this.productsInCart.toString());
  this.countService.updateProductsInCartValue(this.productsInCart);
}

confirmarPedido() {
  console.log('=== INICIO CONFIRMAR PEDIDO ===');
  console.log('Items en carrito:', this.cartItems);
  
  if (this.cartItems.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No es posible realizar esta acción',
      text: `Debe agregar items al carrito`,
    });
    return;
  }

  // Verificar si el usuario está autenticado antes de proceder
  console.log('Verificando autenticación...');
  console.log('Token en localStorage:', localStorage.getItem('token'));
  console.log('Está autenticado?', this.authService.isAuthenticated());
  
  if (!this.authService.isAuthenticated()) {
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: 'No estás autenticado. Por favor, inicia sesión.',
      confirmButtonText: 'Ir a Login'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logOut(); // Esto redirige al login
      }
    });
    return;
  }

  console.log('Usuario autenticado, obteniendo datos de usuario...');
  this.authService.getUserData().subscribe({
    next: (userData) => {
      console.log('UserData obtenida:', userData);
      
      const orderData = { 
        items: this.cartItems, 
        total: this.total, 
        userId: userData.id, 
        date: new Date().toLocaleString(),
        orderId: this.generateOrderId()
      };

      console.log('OrderData preparada:', orderData);

      // Mostrar loading
      Swal.fire({
        title: 'Validando stock...',
        text: 'Por favor espera mientras verificamos la disponibilidad',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // PASO 1: Validar stock antes de mostrar la nota
      console.log('Iniciando validación de stock...');
      this.orderValidationService.validateStockBeforeOrder(this.cartItems).subscribe({
        next: (validation: StockValidationResult) => {
          Swal.close(); // Cerrar loading
          console.log('Resultado de validación:', validation);

          if (validation.valid) {
            // Stock válido -> Mostrar nota de pedido
            this.mostrarNotaPedido(orderData).then((result) => {
              if (result.isConfirmed) {
                this.procesarPedidoConPago(orderData);
              }
            });
          } else {
            // Stock insuficiente -> Mostrar productos problemáticos
            this.mostrarErroresStock(validation);
          }
        },
        error: (error) => {
          Swal.close();
          console.error('Error al validar stock:', error);
          console.error('Error completo:', {
            status: error.status,
            message: error.message,
            error: error.error,
            url: error.url
          });
          
          // Fallback: usar el método original si el nuevo no funciona
          if (error.status === 404 || error.status === 0) {
            console.log('Endpoint no encontrado o error de conexión, usando método original...');
            this.mostrarNotaPedido(orderData).then((result) => {
              if (result.isConfirmed) {
                this.procesarPedidoConPago(orderData);
              }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de conexión',
              html: `
                <p>No se pudo verificar el stock.</p>
                <small>Error: ${error.status} - ${error.message}</small>
                <br><small>¿Usar método tradicional?</small>
              `,
              showCancelButton: true,
              confirmButtonText: 'Usar método tradicional',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                this.mostrarNotaPedido(orderData).then((result) => {
                  if (result.isConfirmed) {
                    this.procesarPedidoConPago(orderData);
                  }
                });
              }
            });
          }
        }
      });
    },
    error: (error) => {
      console.error('=== ERROR AL OBTENER USERDATA ===');
      console.error('Error completo:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Error object:', error.error);
      console.error('URL:', error.url);
      
      let errorMessage = 'No se pudo obtener la información del usuario.';
      
      if (error.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        html: `
          <p>${errorMessage}</p>
          <small>Código de error: ${error.status}</small>
          <br><small>¿Ir a la página de login?</small>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ir a Login',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.logOut(); // Esto redirige al login
        }
      });
    }
  });
}

/**
 * Procesa el pedido de forma atómica (todo en el backend)
 */
private procesarPedidoAtomic(orderData: any) {
  Swal.fire({
    title: 'Procesando pedido...',
    text: 'Creando tu pedido',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.orderValidationService.createOrderAtomic(orderData).subscribe({
    next: (response) => {
      Swal.close();
      console.log('Pedido creado exitosamente:', response);
      
      Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        html: `
          <p>Tu pedido se registro exitosamente.</p>
        `,
      });

      // Limpiar carrito
      this.limpiarCarritoCompleto();
    },
    error: (error) => {
      Swal.close();
      console.error('Error al crear el pedido:', error);
      
      if (error.status === 409) {
        // Conflicto de stock (alguien más compró mientras tanto)
        Swal.fire({
          icon: 'warning',
          title: 'Stock insuficiente',
          text: 'El stock de algunos productos cambió mientras procesábamos tu pedido. Revisa tu carrito.',
        });
        this.actualizarStockEnCarrito();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear el pedido',
          text: 'Hubo un problema procesando tu pedido. Intenta nuevamente.',
        });
      }
    }
  });
}

/**
 * Muestra errores de stock de forma clara
 */
private mostrarErroresStock(validation: StockValidationResult) {
  const problemasHtml = validation.invalidItems.map(item => `
    <li>
      <strong>${item.productName}</strong>: 
      Solicitaste ${item.requestedQuantity}, disponible: ${item.availableStock}
    </li>
  `).join('');

  Swal.fire({
    icon: 'warning',
    title: 'Stock insuficiente',
    html: `
      <p>Los siguientes productos no tienen stock suficiente:</p>
      <ul style="text-align: left;">${problemasHtml}</ul>
      <p>¿Deseas actualizar las cantidades automáticamente?</p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Ajustar cantidades',
    cancelButtonText: 'Revisar manualmente',
  }).then((result) => {
    if (result.isConfirmed) {
      this.ajustarCantidadesAutomaticamente(validation.invalidItems);
    }
  });
}

/**
 * Ajusta automáticamente las cantidades al stock disponible
 */
private ajustarCantidadesAutomaticamente(invalidItems: any[]) {
  invalidItems.forEach(item => {
    if (item.availableStock > 0) {
      this.updateQuantity(item.productId, item.availableStock);
    } else {
      this.removeFromCart(item.productId);
    }
  });

  Swal.fire({
    icon: 'info',
    title: 'Cantidades ajustadas',
    text: 'Las cantidades se han ajustado al stock disponible.',
  });
}

/**
 * Actualiza el stock en el carrito consultando el backend
 */
private actualizarStockEnCarrito() {
  // Implementar si necesitas actualizar el stock mostrado en el carrito
  this.ngOnInit(); // Recargar el carrito
}

/**
 * Limpia completamente el carrito
 */
private limpiarCarritoCompleto() {
  this.cartItems = [];
  this.total = 0;
  this.productsInCart = 0;
  
  localStorage.setItem('cartItems', JSON.stringify([]));
  localStorage.setItem('productsInCart', '0');
  this.countService.updateProductsInCartValue(0);
}

/**
 * Método fallback usando la lógica original
 */
private usarMetodoOriginal(orderData: any) {
  Swal.fire({
    title: 'Procesando pedido...',
    text: 'Usando método tradicional',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.orderService.createNewOrder(orderData).subscribe({
    next: (response) => {
      Swal.close();
      console.log('Pedido guardado con éxito:', response);
      
      Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        text: `El pedido ha sido guardado con éxito.`,
      });

      // Actualizar stock y resetear carrito
      this.limpiarCarritoCompleto();
      this.productService.actualizarStock(orderData).subscribe({
        next: (res) => console.log('Stock Actualizado'),
        error: (err) => console.log('Error al actualizar el stock')
      });
    },
    error: (error) => {
      Swal.close();
      console.error('Error al guardar el pedido:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear el pedido',
        text: 'Hubo un problema procesando tu pedido. Intenta nuevamente.',
      });
    }
  });
}

// Método para mostrar la nota de pedido
mostrarNotaPedido(orderData: any): Promise<any> {
  // Formatear los productos
  const productos = orderData.items.map((item: any) => {
    return `
      <li>
        Producto: ${item.desc} <br>
        Cantidad: ${item.quantity} <br>
        Precio unitario: ${item.price} <br>
        Subtotal: ${(item.price * item.quantity).toFixed(2)}
      </li>
    `;
  }).join('');

  // Obtener el texto del método de pago
  const metodoPago = this.getPaymentMethodText();

  // Contenido del resumen del pedido
  const contenidoNota = `
    <p><strong>Número de Pedido:</strong> ${orderData.orderId}</p>
    <p><strong>Fecha:</strong> ${orderData.date}</p>
    <p><strong>ID Cliente:</strong> ${orderData.userId}</p>
    <p><strong>Método de Pago:</strong> ${metodoPago}</p>
    <p><strong>Productos:</strong></p>
    <ul>${productos}</ul>
    <p><strong>Total:</strong> ${orderData.total.toFixed(2)}</p>
  `;

  // Mostrar la nota de pedido usando SweetAlert
  return Swal.fire({
    title: 'Nota de Pedido',
    html: contenidoNota,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: this.getButtonText(),
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal-wide', // Clase personalizada para ajustar el diseño si es necesario
    }
  });
}

/**
 * Obtiene el texto descriptivo del método de pago seleccionado
 */
private getPaymentMethodText(): string {
  switch (this.selectedPaymentMethod) {
    case 'sin_pagar':
      return 'Pago contra entrega';
    case 'mercadopago_tarjeta':
      return 'MercadoPago - Tarjeta de Crédito/Débito';
    case 'mercadopago_qr':
      return 'MercadoPago - Código QR';
    default:
      return 'Sin especificar';
  }
}

/**
 * Procesa el pedido según el método de pago seleccionado
 */
private procesarPedidoConPago(orderData: any) {
  if (this.selectedPaymentMethod === 'sin_pagar') {
    // Crear pedido sin pago
    this.procesarPedidoSinPago(orderData);
  } else if (this.selectedPaymentMethod === 'mercadopago_tarjeta') {
    // Crear pedido y procesar pago con tarjeta
    this.procesarPedidoConMercadoPago(orderData, 'MercadoPago_Tarjeta');
  } else if (this.selectedPaymentMethod === 'mercadopago_qr') {
    // Crear pedido y procesar pago con QR
    this.procesarPedidoConMercadoPago(orderData, 'MercadoPago_QR');
  }
}

/**
 * Procesa el pedido sin pago (método original)
 */
private procesarPedidoSinPago(orderData: any) {
  Swal.fire({
    title: 'Procesando pedido...',
    text: 'Creando tu pedido sin pago',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // Usar el método atómico si está disponible, sino el original
  this.orderValidationService.createOrderAtomic(orderData).subscribe({
    next: (response) => {
      Swal.close();
      console.log('Pedido creado exitosamente:', response);
      
      Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        html: `
          <p>Tu pedido se registró exitosamente.</p>
          <p><strong>Método de pago:</strong> Pago contra entrega</p>
        `,
      });

      // Limpiar carrito
      this.limpiarCarritoCompleto();
    },
    error: (error) => {
      Swal.close();
      console.error('Error al crear el pedido:', error);
      
      // Fallback al método original si el atómico falla
      if (error.status === 404) {
        this.usarMetodoOriginal(orderData);
      } else {
        this.mostrarErrorPedido(error);
      }
    }
  });
}

/**
 * Procesa el pedido con MercadoPago
 */
private procesarPedidoConMercadoPago(orderData: any, paymentMethod: string) {
  Swal.fire({
    title: 'Procesando pedido...',
    text: 'Creando tu pedido y preparando el pago',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // Primero crear la orden
  this.orderValidationService.createOrderAtomic(orderData).subscribe({
    next: (response) => {
      console.log('Pedido creado exitosamente:', response);
      const orderId = response.order?._id || response._id;
      
      if (!orderId) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener el ID de la orden creada.',
        });
        return;
      }

      // Crear la preferencia de pago
      this.crearPreferenciaPago(orderId, paymentMethod);
    },
    error: (error) => {
      Swal.close();
      console.error('Error al crear el pedido:', error);
      
      // Fallback al método original si el atómico falla
      if (error.status === 404) {
        this.crearPedidoOriginalYPagar(orderData, paymentMethod);
      } else {
        this.mostrarErrorPedido(error);
      }
    }
  });
}

/**
 * Crea la preferencia de pago en MercadoPago
 */
private crearPreferenciaPago(orderId: string, paymentMethod: string) {
  let serviceCall;
  
  if (paymentMethod === 'MercadoPago_QR') {
    serviceCall = this.mercadopagoService.createQRPreference(orderId);
  } else {
    serviceCall = this.mercadopagoService.createPreference(orderId, paymentMethod);
  }

  serviceCall.subscribe({
    next: (response) => {
      Swal.close();
      console.log('Preferencia creada:', response);
      
      if (response.success && response.init_point) {
        // Limpiar carrito antes de redireccionar
        this.limpiarCarritoCompleto();
        
        // Redireccionar a MercadoPago
        window.location.href = response.init_point;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de pago',
          text: 'No se pudo inicializar el pago. Intenta nuevamente.',
        });
      }
    },
    error: (error) => {
      Swal.close();
      console.error('Error al crear preferencia de pago:', error);
      
      Swal.fire({
        icon: 'error',
        title: 'Error de pago',
        text: 'No se pudo conectar con MercadoPago. Intenta nuevamente.',
        showCancelButton: true,
        confirmButtonText: 'Reintentar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.crearPreferenciaPago(orderId, paymentMethod);
        }
      });
    }
  });
}

/**
 * Fallback: crea pedido con método original y luego procesa pago
 */
private crearPedidoOriginalYPagar(orderData: any, paymentMethod: string) {
  this.orderService.createNewOrder(orderData).subscribe({
    next: (response) => {
      console.log('Pedido guardado con método original:', response);
      const orderId = response.order?._id || response._id;
      
      if (orderId) {
        // Actualizar stock
        this.productService.actualizarStock(orderData).subscribe({
          next: (res) => console.log('Stock Actualizado'),
          error: (err) => console.log('Error al actualizar el stock')
        });
        
        // Crear preferencia de pago
        this.crearPreferenciaPago(orderId, paymentMethod);
      } else {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener el ID de la orden creada.',
        });
      }
    },
    error: (error) => {
      Swal.close();
      this.mostrarErrorPedido(error);
    }
  });
}

/**
 * Muestra error de pedido
 */
private mostrarErrorPedido(error: any) {
  if (error.status === 409) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock insuficiente',
      text: 'El stock de algunos productos cambió mientras procesábamos tu pedido. Revisa tu carrito.',
    });
    this.actualizarStockEnCarrito();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error al crear el pedido',
      text: 'Hubo un problema procesando tu pedido. Intenta nuevamente.',
    });
  }
}

// Método para generar un número único de pedido
generateOrderId(): string {
  const timestamp = new Date().getTime();
  return `ORD-${timestamp}`;
}

/**
 * Obtiene el texto del botón según el método de pago seleccionado
 */
getButtonText(): string {
  switch (this.selectedPaymentMethod) {
    case 'sin_pagar':
      return 'Confirmar Pedido (Sin Pago)';
    case 'mercadopago_tarjeta':
      return 'Pagar con Tarjeta';
    case 'mercadopago_qr':
      return 'Pagar con QR';
    default:
      return 'Selecciona método de pago';
  }
}


 setProductsInCartToZero() {
    localStorage.setItem('productsInCart', '0');
  }

  setPedToZero(){
    this.cartItems= [];
    localStorage.setItem('cartItems','0');
    this.total=0;
  }

}