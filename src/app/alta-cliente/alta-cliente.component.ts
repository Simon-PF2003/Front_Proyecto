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
  cuit: string = '';
  clienteSeleccionado: any = null;
  clienteEncontrado: boolean = false;
  clienteEliminado: boolean = false;
  clienteModificado: boolean = false;

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
    } catch (error) {
      console.error('Error al obtener los clientes', error);
    }
  }

  async onBuscarClick() {
    try {
      const authToken = this.authService.getToken();
      if (!isNaN(Number(this.cuit))) {
        this.clienteSeleccionado = await this.authService.getClienteCuil(this.cuit, authToken as string);
      } else {
        this.clientes = await this.authService.searchClientes(this.cuit, authToken as string);
      }
      this.clienteEncontrado = this.clienteSeleccionado || this.clientes.length > 0;
    } catch (error) {
      Swal.fire('Error', 'No se encontró ningún cliente. Busque por CUIT o Razón Social', 'warning');
    }
  }

  agregarCliente() {
    const modalRef = this.modalService.open(AgregarClienteManualComponent, { centered: true });
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerClientes();
      }
    }, (reason) => {
      console.log('Modal dismissed', reason);
    });
  }

  modificarCliente(cliente: any) {
    const modalRef = this.modalService.open(EdicionClienteComponent, { centered: true });
    modalRef.componentInstance.editedUser = { ...cliente }; 
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerClientes();
      }
    }, (reason) => {
      console.log('Modal dismissed', reason);
    });
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
