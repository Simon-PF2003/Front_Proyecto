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
import { CategorySelectionService } from 'src/app/services/category.service';

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
  categories: any[] = [];
  selectedCategoryAttributes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private modalService: NgbModal,
    private router: Router,
    private cartService: CartServiceService,
    private authService: AuthService,
    private countService: countService,
    private categoryService: CategorySelectionService
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
        // Cargar atributos de categoría si el producto tiene categoría
        this.loadCategoryAttributes();
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

    const originalPrice = this.productDetails.data.price;
    const priceWithDiscount = this.discountPercentage > 0 
      ? originalPrice * (1 - this.discountPercentage)
      : originalPrice;

    const productToAdd = {
      ...this.productDetails.data,
      _id: this.productId,
      quantity: quantity,
      price: priceWithDiscount, // PRECIO CON DESCUENTO
      originalPrice: originalPrice, // PRECIO ORIGINAL SIN DESCUENTO
      discount: this.discountPercentage,
      brand: this.productDetails.data.brand?.name || 'Sin marca'
    };
  
    this.cartService.addToCart(productToAdd).subscribe({
      next: (success) => {
        if (success) {
          this.productsInCart += quantity;
          localStorage.setItem('productsInCart', this.productsInCart.toString());
          this.countService.updateProductsInCartValue(this.productsInCart);
          
          Swal.fire({
            icon: 'success',
            title: 'Producto agregado',
            text: `${productToAdd.desc} agregado al carrito con descuento aplicado`,
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar el producto al carrito',
        });
      }
    });
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

  loadCategoryAttributes() {
    if (this.productDetails?.data?.cat?._id) {
      this.categoryService.getCategories().subscribe((categories: any[]) => {
        const category = categories.find(cat => cat._id === this.productDetails.data.cat._id);
        if (category && category.attributes) {
          this.selectedCategoryAttributes = category.attributes;
        }
      });
    }
  }

  getValidAttributes(): any[] {
    if (!this.selectedCategoryAttributes || !this.productDetails?.data?.categoryAttributes) {
      return [];
    }
    
    return this.selectedCategoryAttributes.filter(attr => {
      const value = this.productDetails.data.categoryAttributes[attr.key];
      return value !== null && value !== undefined && value !== '' && 
             (attr.type !== 'boolean' || value === true || value === false);
    });
  }

  formatAttributeValue(attr: any): string {
    const value = this.productDetails.data.categoryAttributes[attr.key];
    
    if (value === null || value === undefined || value === '') {
      return 'No especificado';
    }
    
    switch (attr.type) {
      case 'string':
        return value;
      case 'number':
        return attr.unit ? `${value} ${attr.unit}` : value.toString();
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return value.toString();
    }
  }
}
