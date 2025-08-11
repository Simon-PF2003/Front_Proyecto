import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product: any;
  discountPercentage: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private productService: ProductService) {}

  async ngOnInit() {
    await this.fetchUserDiscount();
    
  }

  async fetchUserDiscount() {
    try {
      const response = await firstValueFrom(this.authService.getUserData());
      if (response) {
        this.authService.getUserDiscount(response.id).subscribe((discount: any) => {
          this.discountPercentage = discount.discountPercentage;
          console.log('User discount:', this.discountPercentage);
        });
        console.log('User discount fetching is asynchronous, may not reflect updated value immediately.');
      }
    } catch (error) {
      console.error('Error fetching user discount:', error);
    }
  }

  comprar() {
     this.productService.getProductDetailsById(this.product._id).subscribe(
      {
      next: (product: any) => {
        console.log('Detalles del producto:', product);
        this.router.navigate(['/product-retrieve', this.product._id]); 
      },
      error: err => {
        console.error('Error al obtener detalles del producto', err);
      }
   });
  }
}

