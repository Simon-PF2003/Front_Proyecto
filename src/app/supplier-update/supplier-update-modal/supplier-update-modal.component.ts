import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupplierService } from 'src/app/services/supplier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-supplier-update-modal',
  templateUrl: './supplier-update-modal.component.html',
  styleUrls: ['./supplier-update-modal.component.css']
})
export class SupplierUpdateModalComponent {
  @Input() 
  editedSupplier: any;


  constructor(
    public activeModal: NgbActiveModal,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {

  }

  saveChanges() {
    this.supplierService.updateDetails(this.editedSupplier._id, this.editedSupplier).subscribe(
      {
        next: res => {
          Swal.fire('Proveedor actualizado con éxito!!', '', 'success');
        },
        error: err => {
          if (err.status === 403) {
                      Swal.fire({
                        title: 'Actualización fallida',
                        html: `<p class="text-muted mt-2">${err.error.message || ''}</p>`,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                      });
          } else {
            Swal.fire('Error', 'Error al actualizar el proveedor', 'error');
          }
        }
      }
    );
  }

  close() {
    this.activeModal.close();
    location.reload();
  }
}


