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
import { NavVarComponent } from './nav-var/nav-var.component';
import { DownCompComponent } from './nav-var/down-comp/down-comp.component';
import { CarouselComponent } from './carousel/carousel.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';

//Institucional
import { InstitucionalQuienesSomosComponent } from './institucional-quienes-somos/institucional-quienes-somos.component';
import { InstitucionalContactoComponent } from './institucional-contacto/institucional-contacto.component';
import { BottomNavbarComponent } from './bottom-navbar/bottom-navbar.component';
import { ContactFormComponent } from './institucional-contacto/contact-form/contact-form.component';

//Products
import { ProductsRetrieveComponent } from './products-retrieve/products-retrieve.component';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductRetrieveComponent } from './products-retrieve/product-retrieve/product-retrieve.component';
import { ProductUpdateModalComponent } from './products-retrieve/product-update-modal/product-update-modal.component';
import { ProductUpdateComponent } from './products-retrieve/product-update/product-update.component';

//Category
import { CategorySelectionService } from './services/category-selection-service.service';

//Orders
import { OrdersRetrieveClientComponent } from './orders-retrieve-client/orders-retrieve-client.component';
import { OrdersUpdateAdminComponent } from './orders-update-admin/orders-update-admin.component';
import { CartComponent } from './cart/cart/cart.component';

//Bills
import { RecaudacionComponent } from './recaudacion/recaudacion.component';
import { EmisionFacturaComponent } from './emision-factura/emision-factura.component';

//Users
import { UserUpdateComponent } from './user-update/user-update.component';
import { UserCreateAcceptanceComponent } from './user-create-acceptance/user-create-acceptance.component';
import { UserCreateManuallyComponent } from './user-update/user-create-manually/user-create-manually.component';
import { UserRetrieveComponent } from './user-retrieve/user-retrieve.component';
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
import { OrdenarClientesComponent } from './ordenar-clientes/ordenar-clientes.component';
import { AgruparProductosComponent } from './agrupar-productos/agrupar-productos.component';

//Stock
import { IngresoStockComponent } from './ingreso-stock/ingreso-stock.component';
import { CargarStockComponent } from './ingreso-stock/cargar-stock/cargar-stock.component';

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
    BottomNavbarComponent,
    
    //Products
    ProductsRetrieveComponent,
    ProductCardComponent,
    ProductCreateComponent,
    ProductRetrieveComponent,
    ProductUpdateModalComponent,
    ProductUpdateComponent,
    
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
    UserRetrieveComponent,
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
    RecaudacionComponent,
    EmisionFacturaComponent,
    
    //Reportes
    OrdenarClientesComponent,
    AgruparProductosComponent,
    
    //Stock
    IngresoStockComponent,
    CargarStockComponent,
    
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
    CarouselComponent,
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
