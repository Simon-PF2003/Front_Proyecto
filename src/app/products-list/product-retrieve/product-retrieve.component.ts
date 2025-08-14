import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductUpdateModalComponent } from '../product-update-modal/product-update-modal.component';
import Swal from 'sweetalert2';
import { CartServiceService } from 'src/app/services/cart-service.service';
import { AuthService } from 'src/app/services/auth.service';
import jwt_decode from 'jwt-decode';
import { countService } from 'src/app/services/count-cart.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-retrieve',
  templateUrl: './product-retrieve.component.html',
  styleUrls: ['./product-retrieve.component.css']
})
export class ProductRetrieveComponent implements OnInit {
  
  productId: string | null = null; 
  productDetails: any;
  editedProduct: any = {}; 
  userRole: string | null = '';
  userId: string | null = '';
  userStatus: string | null = '';
  productQuantity: number = 1;
  productStock: any;
  productsInCart: number = 0;
  discountPercentage: number = 0;
  discountedPrice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private modalService: NgbModal,
    private router: Router,
    private cartService: CartServiceService,
    private authService: AuthService,
    private countService: countService,
  ) {}

  async ngOnInit() {
    const productsInCart = localStorage.getItem('productsInCart');
    if (productsInCart) {
      this.productsInCart = parseInt(productsInCart, 10);
    }

    const authToken = this.authService.getToken();
    if (authToken) {
      const decodedToken: any = jwt_decode(authToken);
      this.userRole = decodedToken.role;
    }    
    
    this.authService.getUserData().subscribe({
      next: async (data: any) => {
        this.userStatus = data.status;
        this.userId = data.id;
        console.log('Estado del usuario:', this.userStatus);
        console.log('Id del usuario:', this.userId);
        await this.fetchUserDiscount();
      },
      error: (err) => {
        console.error('Error al obtener el estado del usuario:', err);
      }
    });

    this.productId = this.route.snapshot.paramMap.get('id');

    if (this.productId !== null) {
      this.productService.getProductDetailsById(this.productId).subscribe(data => {
        this.productDetails = { data: data };
        this.productStock = this.productDetails.data.stock;
        this.applyDiscountToProducts();
      });
    }
  }

  async fetchUserDiscount() {
    try {
      console.log('userId:', this.userId);
      if (this.userId) {
        this.authService.getUserDiscount(this.userId).subscribe((discount: any) => {
          this.discountPercentage = discount.discountPercentage;
          console.log('Discount fetched:', this.discountPercentage);
        });
      }
    } catch (error) {
      console.error('Error fetching user discount:', error);
    }
  }

  applyDiscountToProducts() {
    if (this.discountPercentage > 0 && this.productDetails?.data?.price) {
      this.discountedPrice = this.productDetails.data.price * (1 - this.discountPercentage);
    } else {
      this.discountedPrice = this.productDetails?.data?.price;
    }
  }

  isUserRoleDefined(): boolean {
    return this.userRole !== null && this.userRole !== undefined;
  }

  openEditModal() {
    const modalRef = this.modalService.open(ProductUpdateModalComponent, { centered: true }); 
    modalRef.componentInstance.editedProduct = { ...this.productDetails.data, _id: this.productId }; 
    modalRef.result.then((result: any) => {
      if (result) {
        this.productDetails.data = { ...result };
        this.applyDiscountToProducts();
      }
    });
  }

  deleteProduct() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(this.productId).subscribe({
          next: () => {
            Swal.fire('Confirmado', 'La acción ha sido confirmada', 'success');
            this.router.navigate(['/products-list']);
          },
          error: (err) => {
            console.error(err);
          }
        });       
      }
    });
  }

  addToCart(quantity: number) {    
    if (quantity > this.productStock) {
      Swal.fire({ title: 'Stock insuficiente', text: 'El máximo a ingresar es: ' + this.productStock, icon: 'error' });
      return;
    } else if (this.userStatus === 'Moroso') {
      Swal.fire({ title: 'No puedes comprar', text: 'No puedes comprar productos siendo moroso', icon: 'error' });
      return;
    } 
  
    const priceWithDiscount = this.discountPercentage > 0 
      ? this.productDetails.data.price * (1 - this.discountPercentage)
      : this.productDetails.data.price;
  
    const productToAdd = {
      ...this.productDetails.data,
      _id: this.productId,
      quantity: quantity,
      price: priceWithDiscount, 
    };
  
    const respuesta = this.cartService.addToCart(productToAdd);
    if (respuesta) {
      this.productsInCart += quantity;
      localStorage.setItem('productsInCart', this.productsInCart.toString());
      this.countService.updateProductsInCartValue(this.productsInCart);
    }
  }
  

  notifyMe() {
    if (!this.userId) {
      Swal.fire({ title: 'Debes iniciar sesión', text: 'Debes iniciar sesión para recibir una notificación cuando tengamos este producto en stock', icon: 'error' });
      return;
    }
    this.productService.notifyMe(this.productId, this.userId).subscribe(() => {
      Swal.fire({ title: 'Notificación de stock', text: 'Te notificaremos por mail cuando tengamos este producto en stock', icon: 'info' });
    });
  }
}
