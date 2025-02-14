import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../services/supplier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ModificarProveedorComponent } from './modificar-proveedor/modificar-proveedor.component';
@Component({
  selector: 'app-ud-proveedor',
  templateUrl: './ud-proveedor.component.html',
  styleUrls: ['./ud-proveedor.component.css']
})
export class UdProveedorComponent {
  cuit: string = '';
  foundCuil: boolean = false;
  foundSuppliers: any[] = [];
  newAddress: string = '';
  newPhoneNumber: string = '';
  showModal: boolean = false;
  supplier: any = null; 

  constructor(
      private supplierService: SupplierService,
      private modalService: NgbModal
  ){}
  
  ngOnInit(): void {
    this.obtenerProveedores();
  }

  async obtenerProveedores() {
    try {
      this.foundSuppliers = await this.supplierService.getSuppliers();
    } catch (error) {
      console.error('Error al obtener los proveedores', error);
    }
  }

  async onBuscarClick() {
    try {
      if (!isNaN(Number(this.cuit))) {
        this.supplier = await this.supplierService.searchSuppliers(this.cuit);
      } else {
        this.foundSuppliers = await this.supplierService.searchSuppliers(this.cuit);
      }
      this.foundCuil = this.supplier || this.foundSuppliers.length > 0;
    } catch (error) {
      Swal.fire('Error', 'No se encontró ningún proveedor. Busque por CUIT o Razón Social', 'warning');
    }
  }


  modifySupplier(supplier: any) {
    const modalRef = this.modalService.open(ModificarProveedorComponent, { centered: true });
    modalRef.componentInstance.editedSupplier = { ...supplier }; 
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerProveedores();
      }
    }, (reason) => {
      console.log('Modal dismissed', reason);
    });
  }
  

  deleteSupplier(supplierId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.supplierService.deleteSupplier(supplierId).subscribe({
          next: () => {
            Swal.fire('Confirmado', 'El proveedor ha sido eliminado', 'success');
            this.obtenerProveedores();
          },
          error: () => {
            Swal.fire('Denegado', 'No se pudo eliminar el proveedor', 'error');
          }
        });
      }
    });
  }
}
