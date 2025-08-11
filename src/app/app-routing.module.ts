//Modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Genericos
import { HomeComponent } from './home/home.component';

//Products
import { ProductsRetrieveComponent } from './products-retrieve/products-retrieve.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductRetrieveComponent } from './products-retrieve/product-retrieve/product-retrieve.component';
import { ProductUpdateComponent } from './products-retrieve/product-update/product-update.component';

//Users
import { PerfilUsuarioComponent } from './perfil-usuario/perfil-usuario.component';
import { AltaClienteComponent } from './alta-cliente/alta-cliente.component';
import { AltaDeClienteComponent } from './alta-de-cliente/alta-de-cliente.component';
import { AgregarClienteManualComponent } from './alta-cliente/agregar-cliente-manual/agregar-cliente-manual.component';

//Suppliers
import { AltaProveedorComponent } from './alta-proveedor/alta-proveedor.component';
import { UdProveedorComponent } from './ud-proveedor/ud-proveedor.component';
import { ModificarProveedorComponent } from './ud-proveedor/modificar-proveedor/modificar-proveedor.component';

//Orders
import { OrdersComponent } from './orders/orders.component';
import { PedidosAdminComponent } from './pedidos-admin/pedidos-admin.component';
import { CartComponent } from './cart/cart/cart.component';

//Stock
import { IngresoStockComponent } from './ingreso-stock/ingreso-stock.component';
import { CargarStockComponent } from './ingreso-stock/cargar-stock/cargar-stock.component';

//Institucional
import { QuienesSomosComponent } from './quienes-somos/quienes-somos.component';
import { ContactoComponent } from './contacto/contacto.component';

//Login, SignUp, Authentication, Retrieve Password
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from "./auth.guard";
import { RetrievePassComponent } from './login/retrieve-pass/retrieve-pass.component';

//Admin Panel
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

//Bills
import { EmisionFacturaComponent } from './emision-factura/emision-factura.component';

//Reportes
import { AgruparProductosComponent } from './agrupar-productos/agrupar-productos.component';
import { OrdenarClientesComponent } from './ordenar-clientes/ordenar-clientes.component';
import { RecaudacionComponent } from './recaudacion/recaudacion.component';


const routes: Routes = [
//Products
  { path: 'product-create', component: ProductCreateComponent },
  { path: 'products-retrieve', component: ProductsRetrieveComponent },
  { path: 'product-update', component: ProductUpdateComponent },
  { path: 'product-retrieve/:id', component: ProductRetrieveComponent },

//Ingreso Stock
  { path: 'ingreso-stock', component: IngresoStockComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},
  { path: 'cargar-stock', component: CargarStockComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Users
  { path: 'alta-de-cliente', component: AltaDeClienteComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'agregar-cliente-manual', component: AgregarClienteManualComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'edicion-cliente/:id', component: AltaClienteComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},
  { path: 'alta-usuario', component: AltaClienteComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},
  { path: 'perfilUsuario', component: PerfilUsuarioComponent},

//Suppliers
  {path: 'alta-proveedor', component:AltaProveedorComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'ud-proveedor', component:UdProveedorComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'}},  
  { path: 'modificar-proveedor', component: ModificarProveedorComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador' }},

//Orders
  {path: 'myorders', component:OrdersComponent},
  {path: 'pedidos', component:PedidosAdminComponent,canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  { path: 'cart', component: CartComponent },

//Bills
  {path: 'emision-factura', component: EmisionFacturaComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'recaudacion', component:RecaudacionComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },

//Institucional
  { path: 'quienes-somos', component: QuienesSomosComponent },
  { path: 'contacto', component: ContactoComponent},
  
//login, signup, retrieve password
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {path:'retrieve-pass',component:RetrievePassComponent},  

//Reportes
  {path: 'agrupar-productos', component:AgruparProductosComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  {path: 'ordenar-clientes', component:OrdenarClientesComponent, canActivate: [AuthGuard], data: { expectedRole: 'Administrador'} },
  
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

