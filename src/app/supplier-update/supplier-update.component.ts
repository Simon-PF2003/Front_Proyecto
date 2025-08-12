import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../services/supplier.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { SupplierUpdateModalComponent } from './supplier-update-modal/supplier-update-modal.component';

@Component({
  selector: 'app-supplier-update',
  templateUrl: './supplier-update.component.html',
  styleUrls: ['./supplier-update.component.css']
})
export class SupplierUpdateComponent implements OnInit {
  cuit: string = '';
  foundSuppliers: any[] = [];
  displayedSuppliers: any[] = [];
  supplier: any = null;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

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
      this.actualizarPaginacion();
    } catch (error) {
      console.error('Error al obtener los proveedores', error);
    }
  }

  async onBuscarClick() {
    try {
      if (!this.cuit.trim()) {
        this.obtenerProveedores();
        return;
      }
      this.foundSuppliers = await this.supplierService.searchSuppliers(this.cuit);
      this.actualizarPaginacion();
    } catch (error) {
      Swal.fire('Error', 'No se encontró ningún proveedor. Busque por CUIT o Razón Social', 'warning');
    }
  }

  actualizarPaginacion() {
    this.totalPages = Math.ceil(this.foundSuppliers.length / this.pageSize);
    this.currentPage = 1;
    this.actualizarProveedoresMostrados();
  }

  actualizarProveedoresMostrados() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedSuppliers = this.foundSuppliers.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.actualizarProveedoresMostrados();
    }
  }

  modifySupplier(supplier: any) {
    const modalRef = this.modalService.open(SupplierUpdateModalComponent, { centered: true });
    modalRef.componentInstance.editedSupplier = { ...supplier }; 
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerProveedores();
      }
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
