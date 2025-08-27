import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BrandSelectionService } from 'src/app/services/brand.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brand-update-modal',
  templateUrl: './brand-update-modal.component.html',
  styleUrls: ['./brand-update-modal.component.css']
})
export class BrandUpdateModalComponent {
  @Input() editedBrand: any;

  constructor(
    public activeModal: NgbActiveModal,
    private brandService: BrandSelectionService
  ) {}

  ngOnInit(): void {

  }

  saveChanges() {
    this.brandService.updateBrand(this.editedBrand._id, this.editedBrand).subscribe(
      {
        next: res => {
          Swal.fire('Marca actualizada con éxito!!', '', 'success');
        },
        error: err => {
          Swal.fire('Error', 'Error al actualizar la marca', 'error');

        }
      }
    );
  }

  close() {
    this.activeModal.close(this.editedBrand);
    location.reload();
  }
}


