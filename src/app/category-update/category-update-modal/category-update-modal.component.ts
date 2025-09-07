import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategorySelectionService, CategoryAttribute } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-update-modal',
  templateUrl: './category-update-modal.component.html',
  styleUrls: ['./category-update-modal.component.css']
})
export class CategoryUpdateModalComponent {
  @Input() 
  editedCategory: any;

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

  constructor(
    public activeModal: NgbActiveModal,
    private categoryService: CategorySelectionService
  ) {}

  ngOnInit(): void {
    // Asegurar que attributes existe
    if (!this.editedCategory.attributes) {
      this.editedCategory.attributes = [];
    }
  }

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
    if (this.editedCategory.attributes.some((attr: any) => attr.key === this.newAttribute.key)) {
      Swal.fire('Error', 'Ya existe un atributo con esa clave.', 'error');
      return;
    }

    // Convertir la clave a formato slug
    const slugKey = this.newAttribute.key.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    this.editedCategory.attributes.push({
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
    const attribute = this.editedCategory.attributes[index];
    
    Swal.fire({
      title: '¿Estás seguro?',
      html: `¿Deseas eliminar el atributo "<strong>${attribute.label}</strong>"?<br><br>
             <small class="text-danger"><i class="fas fa-exclamation-triangle"></i> 
             Si hay productos con este atributo, la información se eliminará permanentemente.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.editedCategory.attributes.splice(index, 1);
        Swal.fire({
          title: 'Eliminado',
          text: 'El atributo ha sido eliminado de la categoría.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  saveChanges() {
    if (!this.editedCategory.type || !this.editedCategory.type.trim()) {
      Swal.fire('Atención', 'Ingresá la descripción de la categoría.', 'warning');
      return;
    }

    this.categoryService.updateCategory(this.editedCategory._id, {
      type: this.editedCategory.type,
      attributes: this.editedCategory.attributes
    }).subscribe({
      next: res => {
        Swal.fire({
          title: 'Categoría actualizada con éxito!',
          text: '',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.close();
        });
      },
      error: err => {
        if (err?.status === 400) {
          Swal.fire('Error', 'La categoría ya existe con ese nombre.', 'error');
        } else {
          const msg = err?.error?.message || 'Error al actualizar la categoría';
          Swal.fire('Error', msg, 'error');
        }
      }
    });
  }

  close() {
    this.activeModal.close(this.editedCategory);
    location.reload();
  }
}


