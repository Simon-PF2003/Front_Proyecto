import { Component } from '@angular/core';
import { BrandSelectionService } from '../services/brand.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brand-create',
  templateUrl: './brand-create.component.html',
  styleUrls: ['./brand-create.component.css']
})
export class BrandCreateComponent {
  brand = {
    brand: '',
  };
  isSubmitting = false;

    constructor(private brandSelectionService: BrandSelectionService) {}

  createBrand() {
    const brand = (this.brand.brand || '').trim();
    if (!brand) {
      Swal.fire('Atención', 'Ingresá la descripción de la marca.', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.brandSelectionService.createNewBrand(brand).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.brand.brand = '';
        // Mensaje de éxito
        Swal.fire('Creada', 'Marca creada correctamente', 'success');
        // Opcional: si querés recargar lista de categorías en otro componente,
        // podés emitir un evento o reconsultar el endpoint allí.
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err?.status === 400) {
          Swal.fire('Error', 'La marca ya existe.', 'error').then(() => {

          });
        } else {
          const msg = err?.error?.message || 'Ocurrió un error al crear la marca.';
          Swal.fire('Error', msg, 'error');
        }
      }
    });
  }
}
