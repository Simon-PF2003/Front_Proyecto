//Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

//Genericos
import { HomeCarouselComponent } from './home-carousel/home-carousel.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';

//navbar
import { NavVarComponent } from './nav-var/nav-var.component';
import { NavbarBottomComponent } from './navbar-bottom/navbar-bottom.component';
import { DownCompComponent } from './nav-var/down-comp/down-comp.component';

//Institucional
import { InstitucionalQuienesSomosComponent } from './institucional-quienes-somos/institucional-quienes-somos.component';
import { InstitucionalContactoComponent } from './institucional-contacto/institucional-contacto.component';
import { ContactFormComponent } from './institucional-contacto/contact-form/contact-form.component';

//Products
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductRetrieveComponent } from './products-list/product-retrieve/product-retrieve.component';
import { ProductUpdateModalComponent } from './products-list/product-update-modal/product-update-modal.component';
import { ProductUpdateComponent } from './products-list/product-update/product-update.component';

//Categories
import { CategoryCreateComponent } from './category-create/category-create.component';
import { CategoryUpdateComponent } from './category-update/category-update.component';
import { CategorySelectionService } from './services/category.service';
import { CategoryUpdateModalComponent } from './category-update/category-update-modal/category-update-modal.component';

//Brands 
import { BrandSelectionService } from './services/brand.service';
import { BrandUpdateComponent } from './brand-update/brand-update.component';
import { BrandUpdateModalComponent } from './brand-update/brand-update-modal/brand-update-modal.component';
import { BrandCreateComponent } from './brand-create/brand-create.component';

//Orders
import { OrdersRetrieveClientComponent } from './orders-retrieve-client/orders-retrieve-client.component';
import { OrdersUpdateAdminComponent } from './orders-update-admin/orders-update-admin.component';
import { CartComponent } from './cart/cart/cart.component';

//Bills
import { BillCreateComponent } from './bill-create/bill-create.component';

//Users
import { UserUpdateComponent } from './user-update/user-update.component';
import { UserCreateAcceptanceComponent } from './user-create-acceptance/user-create-acceptance.component';
import { UserCreateManuallyComponent } from './user-create-acceptance/user-create-manually/user-create-manually.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserUpdateModalComponent } from './user-update/user-update-modal/user-update-modal.component';
//import { AuthService } from './services/auth.service';

//Login Signup Retrieve Password
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { RetrievePassComponent } from './login/retrieve-pass/retrieve-pass.component';

//Authentication
import { AuthGuard } from "./auth.guard";
import { TokenInterceptorService } from "./services/token-interceptor.service";
import { AuthService } from './services/auth.service';

//Suppliers
import { SupplierCreateComponent } from './supplier-create/supplier-create.component';
import { SupplierUpdateComponent } from './supplier-update/supplier-update.component';
import { SupplierUpdateModalComponent } from './supplier-update/supplier-update-modal/supplier-update-modal.component';

//Reportes
import { ReporteOrdenarClientesComponent } from './reporte-ordenar-clientes/reporte-ordenar-clientes.component';
import { ReporteAgruparProductosComponent } from './reporte-agrupar-productos/reporte-agrupar-productos.component';
import { ReporteRecaudacionComponent } from './reporte-recaudacion/reporte-recaudacion.component';

//Stock
import { StockIngresoComponent } from './stock-ingreso/stock-ingreso.component';
import { StockCargarComponent } from './stock-cargar/stock-cargar.component';

//Admin
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

//Tasks
import { TasksComponent } from './tasks/tasks.component';
import { PrivateTasksComponent } from './private-tasks/private-tasks.component';


@NgModule({
  declarations: [
//Genericos
    AppComponent,
    NavVarComponent,
    DownCompComponent,
    FooterComponent,
    HomeComponent,
    NavbarBottomComponent,
    
    //Products
    ProductsListComponent,
    ProductCardComponent,
    ProductCreateComponent,
    ProductRetrieveComponent,
    ProductUpdateModalComponent,
    ProductUpdateComponent,
    
    //Categories 
    CategoryCreateComponent,
    CategoryUpdateComponent,
    CategoryUpdateModalComponent,

    //Brands
    BrandCreateComponent,
    BrandUpdateComponent,
    BrandUpdateModalComponent,

    //Institucional
    InstitucionalQuienesSomosComponent,
    InstitucionalContactoComponent,
    ContactFormComponent,
    
    //Login Signup Retrieve Password
    LoginComponent,
    SignupComponent,
    RetrievePassComponent,
    
    //Users
    UserUpdateComponent,
    UserCreateAcceptanceComponent,
    UserCreateManuallyComponent,
    UserProfileComponent,
    UserUpdateModalComponent,
    
    //Suppliers
    SupplierCreateComponent,
    SupplierUpdateComponent,
    SupplierUpdateModalComponent,
    
    //Orders
    OrdersRetrieveClientComponent,
    OrdersUpdateAdminComponent,
    CartComponent,
    
    //Bills
    BillCreateComponent,
    
    //Reportes
    ReporteRecaudacionComponent,
    ReporteOrdenarClientesComponent,
    ReporteAgruparProductosComponent,
    
    //Stock
    StockIngresoComponent,
    StockCargarComponent,

    //Admin
    AdminPanelComponent,
    
    //Tasks
    TasksComponent,
    PrivateTasksComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HomeCarouselComponent,
    FormsModule,
    RouterModule,
    HttpClientModule,
      JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('token'),
        allowedDomains: ['http://localhost:3000'], 
        disallowedRoutes: [], 
      },
    }),
      BrowserAnimationsModule,
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    AuthService,
    CategorySelectionService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
