//Modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Genericos
import { HomeComponent } from './home/home.component';

//Products
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductRetrieveComponent } from './products-list/product-retrieve/product-retrieve.component';
import { ProductUpdateComponent } from './products-list/product-update/product-update.component';

//Categories
import { CategoryCreateComponent } from './category-create/category-create.component';
import { CategoryUpdateComponent } from './category-update/category-update.component';

//Brands
import { BrandCreateComponent } from './brand-create/brand-create.component';
import { BrandUpdateComponent } from './brand-update/brand-update.component';

//Users
import { UserCreateAcceptanceComponent } from './user-create-acceptance/user-create-acceptance.component';
import { UserCreateManuallyComponent } from './user-create-acceptance/user-create-manually/user-create-manually.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserUpdateComponent } from './user-update/user-update.component';

//Suppliers
import { SupplierCreateComponent } from './supplier-create/supplier-create.component';
import { SupplierUpdateComponent } from './supplier-update/supplier-update.component';
import { SupplierUpdateModalComponent } from './supplier-update/supplier-update-modal/supplier-update-modal.component';

//Orders
import { OrdersRetrieveClientComponent } from './orders-retrieve-client/orders-retrieve-client.component';
import { OrdersUpdateAdminComponent } from './orders-update-admin/orders-update-admin.component';
import { CartComponent } from './cart/cart/cart.component';

//Stock
import { StockIngresoComponent } from './stock-ingreso/stock-ingreso.component';
import { StockCargarComponent } from './stock-cargar/stock-cargar.component';

//Institucional
import { InstitucionalQuienesSomosComponent } from './institucional-quienes-somos/institucional-quienes-somos.component';
import { InstitucionalContactoComponent } from './institucional-contacto/institucional-contacto.component';

//Login, SignUp, Authentication, Retrieve Password
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from "./auth.guard";
import { RetrievePassComponent } from './login/retrieve-pass/retrieve-pass.component';

//Admin Panel
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

//Bills
import { BillCreateComponent } from './bill-create/bill-create.component';

//Reportes
import { ReporteAgruparProductosComponent } from './reporte-agrupar-productos/reporte-agrupar-productos.component';
import { ReporteOrdenarClientesComponent } from './reporte-ordenar-clientes/reporte-ordenar-clientes.component';
import { ReporteRecaudacionComponent } from './reporte-recaudacion/reporte-recaudacion.component';
import { ReporteClientesFielesComponent } from './reporte-clientes-fieles/reporte-clientes-fieles.component';
import { ReporteRiesgoAbandonoComponent } from './reporte-riesgo-abandono/reporte-riesgo-abandono.component';
import { ReporteAnalisisVentasComponent } from './reporte-analisis-ventas/reporte-analisis-ventas.component';
import { ReportePronosticoDemandaComponent } from './reporte-pronostico-demanda/reporte-pronostico-demanda.component';

//Payment Status
import { PaymentSuccessComponent } from './payment-status/payment-success.component';
import { PaymentErrorComponent } from './payment-status/payment-error.component';
import { PaymentPendingComponent } from './payment-status/payment-pending.component';

//Dashboard
import { DashboardRetrieveComponent } from 'src/app/dashboard-retrieve/dashboard-retrieve.component';



const routes: Routes = [
//Products
  { path: 'product-create', component: ProductCreateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' } },
  { path: 'products-list', component: ProductsListComponent },
  { path: 'product-update', component: ProductUpdateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' } },
  { path: 'product-retrieve/:id', component: ProductRetrieveComponent },

//Categories
  { path: 'category-create', component: CategoryCreateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'category-update', component: CategoryUpdateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Brands
  { path: 'brand-create', component: BrandCreateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'brand-update', component: BrandUpdateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Ingreso Stock
  { path: 'stock-ingreso', component: StockIngresoComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},
  { path: 'stock-cargar', component: StockCargarComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Users
  { path: 'user-create-acceptance', component: UserCreateAcceptanceComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'user-create-manually', component: UserCreateManuallyComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'user-update-modal/:id', component: UserUpdateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'user-update', component: UserUpdateComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},
  { path: 'user-profile', component: UserProfileComponent},

//Suppliers
  {path: 'supplier-create', component:SupplierCreateComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'supplier-update', component:SupplierUpdateComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},  
  { path: 'supplier-update-modal', component: SupplierUpdateModalComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Orders
  {path: 'orders-retrieve-client', component:OrdersRetrieveClientComponent},
  {path: 'orders-update-admin', component:OrdersUpdateAdminComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  { path: 'cart', component: CartComponent },

//Bills
  {path: 'bill-create', component: BillCreateComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },

//Institucional
  { path: 'institucional-quienes-somos', component: InstitucionalQuienesSomosComponent },
  { path: 'institucional-contacto', component: InstitucionalContactoComponent},
  
//login, signup, retrieve password
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {path:'retrieve-pass',component:RetrievePassComponent},

//Payment Status
  { path: 'pago/exito', component: PaymentSuccessComponent },
  { path: 'pago/error', component: PaymentErrorComponent },
  { path: 'pago/pendiente', component: PaymentPendingComponent },  

//Reportes
  {path: 'reporte-agrupar-productos', component:ReporteAgruparProductosComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-ordenar-clientes', component:ReporteOrdenarClientesComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-recaudacion', component:ReporteRecaudacionComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-clientes-fieles', component:ReporteClientesFielesComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-riesgo-abandono', component:ReporteRiesgoAbandonoComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-analisis-ventas', component:ReporteAnalisisVentasComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'reporte-pronostico-demanda', component:ReportePronosticoDemandaComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  
//Dashboard
  { path: 'dashboard-retrieve', component: DashboardRetrieveComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  
//Extra
  { path: '', component: HomeComponent }, //ruta inicial, si quisiera que me lleve a otra --> redirecTo: '/nombre_pag',pathMatch: 'full'  
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

