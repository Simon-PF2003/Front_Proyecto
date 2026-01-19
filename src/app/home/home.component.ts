import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  featuredProducts: any[] = [];  // Lista para almacenar los productos destacados
  recommendedProducts: any[] = []; // Lista para almacenar los productos recomendados
  currentUserId: string | null = null;
  isLoading: boolean = true; // Indicador de carga

  // Control de carruseles
  featuredCurrentIndex: number = 0;
  recommendedCurrentIndex: number = 0;
  itemsPerPage: number = 4;

  constructor(
    public authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthAndRedirect();

    // Compartir el observable de userData para no llamarlo dos veces
    const userData$ = this.authService.getUserData().pipe(
      catchError(() => of(null)),
      shareReplay(1)
    );

    // Ejecutar las 3 peticiones en paralelo
    forkJoin({
      userData: userData$,
      featuredProducts: this.productService.getFeaturedProducts().pipe(
        catchError(() => of([]))
      ),
      recommendedProducts: userData$.pipe(
        switchMap(userData => 
          this.productService.getRecommendedProducts(userData?.id).pipe(
            catchError(() => of([]))
          )
        )
      )
    }).subscribe({
      next: (results) => {
        // Asignar todo simultáneamente
        this.featuredProducts = results.featuredProducts;
        this.recommendedProducts = results.recommendedProducts;
        this.currentUserId = results.userData?.id || null;
        this.isLoading = false; // Terminar carga
        console.log('Todos los productos cargados:', {
          featured: this.featuredProducts.length,
          recommended: this.recommendedProducts.length
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del home', err);
        this.isLoading = false; // Terminar carga incluso con error
      }
    });
  }

  loadRecommendedProducts(): void {
    this.productService.getRecommendedProducts(this.currentUserId || undefined).subscribe({
      next: (products: any[]) => {
        this.recommendedProducts = products;
        console.log('Productos recomendados cargados:', products.length);
      },
      error: err => {
        console.error('Error al obtener los productos recomendados', err);
      }
    });
  }

  // Navegación para productos destacados (circular)
  nextFeatured(): void {
    if (this.featuredCurrentIndex + this.itemsPerPage < this.featuredProducts.length) {
      this.featuredCurrentIndex += this.itemsPerPage;
    } else {
      this.featuredCurrentIndex = 0;
    }
  }

  prevFeatured(): void {
    if (this.featuredCurrentIndex > 0) {
      this.featuredCurrentIndex -= this.itemsPerPage;
    } else {
      const remainder = this.featuredProducts.length % this.itemsPerPage;
      this.featuredCurrentIndex = remainder === 0 
        ? this.featuredProducts.length - this.itemsPerPage
        : this.featuredProducts.length - remainder;
    }
  }

  get visibleFeaturedProducts(): any[] {
    return this.featuredProducts.slice(this.featuredCurrentIndex, this.featuredCurrentIndex + this.itemsPerPage);
  }

  // Navegación para productos recomendados (circular)
  nextRecommended(): void {
    if (this.recommendedCurrentIndex + this.itemsPerPage < this.recommendedProducts.length) {
      this.recommendedCurrentIndex += this.itemsPerPage;
    } else {
      this.recommendedCurrentIndex = 0;
    }
  }

  prevRecommended(): void {
    if (this.recommendedCurrentIndex > 0) {
      this.recommendedCurrentIndex -= this.itemsPerPage;
    } else {
      const remainder = this.recommendedProducts.length % this.itemsPerPage;
      this.recommendedCurrentIndex = remainder === 0 
        ? this.recommendedProducts.length - this.itemsPerPage
        : this.recommendedProducts.length - remainder;
    }
  }

  get visibleRecommendedProducts(): any[] {
    return this.recommendedProducts.slice(this.recommendedCurrentIndex, this.recommendedCurrentIndex + this.itemsPerPage);
  }

  get canGoNextFeatured(): boolean {
    return this.featuredProducts.length > this.itemsPerPage;
  }

  get canGoPrevFeatured(): boolean {
    return this.featuredProducts.length > this.itemsPerPage;
  }

  get canGoNextRecommended(): boolean {
    return this.recommendedProducts.length > this.itemsPerPage;
  }

  get canGoPrevRecommended(): boolean {
    return this.recommendedProducts.length > this.itemsPerPage;
  }
}
