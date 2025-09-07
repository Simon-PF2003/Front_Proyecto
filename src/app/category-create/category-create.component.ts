import { Component } from '@angular/core';
import { CategorySelectionService, CategoryAttribute } from '../services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent {
  category = {
    type: '',
    attributes: [] as CategoryAttribute[]
  };
  isSubmitting = false;

  // Atributo temporal para agregar nuevos atributos
  newAttribute: CategoryAttribute = {
    key: '',
    label: '',
    type: 'string',
    required: false
  };

  attributeTypes = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Verdadero/Falso' },
    { value: 'date', label: 'Fecha' }
  ];

  constructor(private categorySelectionService: CategorySelectionService) {}

  getAttributeTypeLabel(type: string): string {
    const found = this.attributeTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  addAttribute() {
    if (!this.newAttribute.key.trim() || !this.newAttribute.label.trim()) {
      Swal.fire('Atención', 'Ingresá la clave y etiqueta del atributo.', 'warning');
      return;
    }

    // Verificar que la clave no esté duplicada
    if (this.category.attributes.some(attr => attr.key === this.newAttribute.key)) {
      Swal.fire('Error', 'Ya existe un atributo con esa clave.', 'error');
      return;
    }

    // Convertir la clave a formato slug (sin espacios, caracteres especiales)
    const slugKey = this.newAttribute.key.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    this.category.attributes.push({
      ...this.newAttribute,
      key: slugKey
    });

    // Limpiar el formulario de atributo
    this.newAttribute = {
      key: '',
      label: '',
      type: 'string',
      required: false
    };
  }

  removeAttribute(index: number) {
    const attribute = this.category.attributes[index];
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar el atributo "<strong>${attribute.label}</strong>"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.category.attributes.splice(index, 1);
        Swal.fire({
          title: 'Eliminado',
          text: 'El atributo ha sido eliminado.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  createCategory() {
    const type = (this.category.type || '').trim();
    if (!type) {
      Swal.fire('Atención', 'Ingresá la descripción de la categoría.', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.categorySelectionService.createNewCategory({
      type,
      attributes: this.category.attributes
    }).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.category = {
          type: '',
          attributes: []
        };
        // Mensaje de éxito
        Swal.fire('Creada', 'Categoría creada correctamente', 'success');
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
