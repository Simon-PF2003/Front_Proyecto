import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import jwt_decode from 'jwt-decode';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { countService } from '../services/count-cart.service';
import { ActivatedRoute } from '@angular/router';
import { UsersCountService } from '../services/users-count.service';
import { StockViewService } from '../services/stock-view.service';


@Component({
  selector: 'app-nav-var',
  templateUrl: './nav-var.component.html',
  styleUrls: ['./nav-var.component.css']
})
export class NavVarComponent implements OnInit {
  isNavOpen = false;
  userRole: string | null = '';
  searchTerm: string = '';
  currentRoute: string = '';
  productsInCart: number = 0;
  productsInCartString: string = 'h';
  pendingUsersCount: number = 0;
  stockCurrentView: string = 'suppliers';

  constructor(
    private router: Router,
    public authService: AuthService,
    private countService: countService,
    private route: ActivatedRoute,
    private usersCountService: UsersCountService,
    private stockViewService: StockViewService
  )
  
  {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          const previousRoute = this.currentRoute;
          this.currentRoute = event.urlAfterRedirects || event.url;
          
          // Si salimos de stock-ingreso, resetear la vista a 'suppliers'
          if (previousRoute.includes('/stock-ingreso') && !this.currentRoute.includes('/stock-ingreso')) {
            this.stockViewService.setCurrentView('suppliers');
          }
        }
      });
  }
  
  ngOnInit(): void {
    this.countService.productsInCart$.subscribe(value => {
      this.productsInCart = value;
    });
    
    const productsInCartString = localStorage.getItem('productsInCart');
    if(productsInCartString != null) {
      this.productsInCart = parseInt(productsInCartString);
    }

    const authToken = this.authService.getToken();

    if (authToken) {
      const decodedToken: any = jwt_decode(authToken);
      this.userRole = decodedToken.role;
      console.log(this.userRole);
      
      // Si es administrador, obtener conteo de usuarios pendientes
      if (this.userRole === 'Administrador') {
        this.usersCountService.pendingUsersCount$.subscribe(count => {
          this.pendingUsersCount = count;
        });
        // Actualizar el conteo inicial
        this.usersCountService.updatePendingUsersCount();
      }
    }

    // Suscribirse a los cambios de vista del stock-ingreso
    this.stockViewService.currentView$.subscribe(view => {
      this.stockCurrentView = view;
    });
  }

  toggleNav() {
  this.isNavOpen = !this.isNavOpen;
  if (this.isNavOpen) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = ''; 
    }
}

  isProductosRoute(): boolean {
    return this.currentRoute.includes('/products-list');
  }

  isStockRoute(): boolean {
    return this.currentRoute.includes('/stock-ingreso');
  }

  // Nuevo método para verificar si mostrar búsqueda de productos
  shouldShowProductSearch(): boolean {
    // Mostrar en products-list, product-update, reporte-agrupar-productos, cargar-stock
    if (this.isProductosRoute() || this.isEditProductsRoute() || this.isProductCategoryRoute() || this.isChargeStockRoute()) {
      return true;
    }
    // En stock-ingreso solo mostrar si estamos en la vista de productos
    if (this.isStockRoute()) {
      return this.stockCurrentView === 'products';
    }
    return false;
  }

  isEditProductsRoute(): boolean {
    return this.currentRoute.includes('/product-update');
  }

  isProductCategoryRoute(): boolean {
    return this.currentRoute.includes('/reporte-agrupar-productos');
  }

  isOrdersRoute(): boolean {
    return this.currentRoute.includes('/orders-update-admin');
  }

  isChargeStockRoute(): boolean {
    return this.currentRoute.includes('/stock-cargar');
  }

  isUserRoleDefined(): boolean {
    return this.userRole !== null && this.userRole !== undefined;
  }


searchProducts() {
  console.log(this.searchTerm);

  if (this.searchTerm) {
    if (this.currentRoute.includes('/products-list')) {
      this.router.navigate(['/products-list'], { relativeTo: this.route, queryParams: { q: this.searchTerm } });
    } else if (this.currentRoute.includes('/stock-ingreso')) {
      this.router.navigate(['/stock-ingreso'], { relativeTo: this.route, queryParams: { q: this.searchTerm } }); 
    } else if (this.currentRoute.includes('/product-update')) {
      this.router.navigate(['/product-update'], { relativeTo: this.route, queryParams: { q: this.searchTerm } });
    } else if (this.currentRoute.includes('/reporte-agrupar-productos')) {
      this.router.navigate(['/reporte-agrupar-productos'], { relativeTo: this.route, queryParams: { q: this.searchTerm } });
    }
    else if (this.currentRoute.includes('/stock-cargar')) {
      this.router.navigate(['/stock-cargar'], { relativeTo: this.route, queryParams: { q: this.searchTerm } });
    }
  } else {
    if (this.currentRoute.includes('/products-list')) {
      this.router.navigate(['/products-list'], { relativeTo: this.route });
    } else if (this.currentRoute.includes('/stock-ingreso')) {
      this.router.navigate(['/stock-ingreso'], { relativeTo: this.route });
    } else if (this.currentRoute.includes('/product-update')) {
      this.router.navigate(['/product-update'], { relativeTo: this.route });
    } else if (this.currentRoute.includes('/reporte-agrupar-productos')) {
      this.router.navigate(['/reporte-agrupar-productos'], { relativeTo: this.route });
    } else if (this.currentRoute.includes('/stock-cargar')) {
      this.router.navigate(['/stock-cargar'], { relativeTo: this.route });
    } else {

      console.warn('No matching route found for search.');
    }
}
}

searchOrders() {
  if(this.searchTerm) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: this.searchTerm }});
  }
  else {
    this.router.navigate([], { relativeTo: this.route });
  }
}

}
