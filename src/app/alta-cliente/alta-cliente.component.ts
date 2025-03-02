import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EdicionClienteComponent } from './edicion-cliente/edicion-cliente.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AgregarClienteManualComponent } from './agregar-cliente-manual/agregar-cliente-manual.component';

@Component({
  selector: 'app-alta-cliente',
  templateUrl: './alta-cliente.component.html',
  styleUrls: ['./alta-cliente.component.css']
})
export class AltaClienteComponent implements OnInit {
  clientes: any[] = [];
  filteredClientes: any[] = [];
  displayedClientes: any[] = [];

  cuit: string = '';
  clienteSeleccionado: any = null;
  clienteEncontrado: boolean = false;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
    public authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  async obtenerClientes() {
    try {
      const authToken = this.authService.getToken();
      this.clientes = await this.authService.getUsers(authToken as string);
      this.filteredClientes = [...this.clientes];
      this.actualizarPaginacion();
    } catch (error) {
      console.error('Error al obtener los clientes', error);
    }
  }

  async onBuscarClick() {
    try {
      const authToken = this.authService.getToken();
      if (!this.cuit.trim()) {
        this.obtenerClientes();
        return;
      }
      if (!isNaN(Number(this.cuit))) {
        this.clienteSeleccionado = await this.authService.getClienteCuil(this.cuit, authToken as string);
        this.filteredClientes = this.clienteSeleccionado ? [this.clienteSeleccionado] : [];
      } else {
        this.filteredClientes = await this.authService.searchClientes(this.cuit, authToken as string);
      }
      
      this.clienteEncontrado = this.filteredClientes.length > 0;
      this.actualizarPaginacion();
    } catch (error) {
      Swal.fire('Error', 'No se encontró ningún cliente. Busque por CUIT o Razón Social', 'warning');
    }
  }

  actualizarPaginacion() {
    this.totalPages = Math.ceil(this.filteredClientes.length / this.pageSize);
    this.currentPage = 1;
    this.actualizarClientesMostrados();
  }

  actualizarClientesMostrados() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedClientes = this.filteredClientes.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.actualizarClientesMostrados();
    }
  }

  agregarCliente() {
    const modalRef = this.modalService.open(AgregarClienteManualComponent, { centered: true });
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerClientes();
      }
    }, () => {});
  }

  modificarCliente(cliente: any) {
    const modalRef = this.modalService.open(EdicionClienteComponent, { centered: true });
    modalRef.componentInstance.editedUser = { ...cliente }; 
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerClientes();
      }
    }, () => {});
  }

  deleteClient(clienteId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteCliente(clienteId).subscribe({
          next: () => {
            Swal.fire('Confirmado', 'El cliente ha sido eliminado', 'success');
            this.obtenerClientes();
          },
          error: () => {
            Swal.fire('Denegado', 'No se pudo eliminar el cliente', 'error');
          }
        });
      }
    });
  }
}
