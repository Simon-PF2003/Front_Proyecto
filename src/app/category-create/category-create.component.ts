import { Component } from '@angular/core';
import { CategorySelectionService } from '../services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent {
  category = {
    type: '',
  };
  isSubmitting = false;

  constructor(private categorySelectionService: CategorySelectionService) {}

  createCategory() {
    const type = (this.category.type || '').trim();
    if (!type) {
      Swal.fire('Atención', 'Ingresá la descripción de la categoría.', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.categorySelectionService.createNewCategory(type).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.category.type = '';
        // Mensaje de éxito
        Swal.fire('Creada', 'Categoría creada correctamente', 'success');
        // Opcional: si querés recargar lista de categorías en otro componente,
        // podés emitir un evento o reconsultar el endpoint allí.
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err?.status === 400) {
          Swal.fire('Error', 'La categoría ya existe.', 'error').then(() => {

          });
        } else {
          const msg = err?.error?.message || 'Ocurrió un error al crear la categoría.';
          Swal.fire('Error', msg, 'error');
        }
      }
    });
  }
}
