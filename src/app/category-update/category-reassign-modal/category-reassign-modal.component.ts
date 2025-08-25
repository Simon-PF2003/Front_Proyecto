import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategorySelectionService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-reassign-modal',
  templateUrl: './category-reassign-modal.component.html',
  styleUrls: ['./category-reassign-modal.component.css']
})

export class CategoryReassignModalComponent {
  @Input() 
  categoryToDelete: any; // La categoría que se va a eliminar
  @Input()
  availableCategories: any[] = []; // Las categorías disponibles para reasignar
  
  reassignOption: string = 'empty'; // 'reassign' o 'empty'
  selectedCategoryId: string = '';

  constructor(
    public activeModal: NgbActiveModal,
    private categoryService: CategorySelectionService
  ) {}

  ngOnInit(): void {
    // No necesitamos cargar categorías aquí ya que las recibimos como input
    console.log("Categoría a eliminar:", this.categoryToDelete);
    console.log("Categorías disponibles:", this.availableCategories);
  }

  confirmDelete() {
    const categoryIdToDelete = this.categoryToDelete._id;
    let reassignToCategoryId: string | undefined;

    if (this.reassignOption === 'reassign') {
      if (!this.selectedCategoryId) {
        Swal.fire('Error', 'Debe seleccionar una categoría para reasignar', 'error');
        return;
      }
      reassignToCategoryId = this.selectedCategoryId;
    }
    // Si reassignOption === 'empty', reassignToCategoryId queda como undefined

    this.categoryService.deleteCategory(categoryIdToDelete, reassignToCategoryId).subscribe({
      next: () => {
        const message = this.reassignOption === 'reassign' 
          ? 'Categoría eliminada y productos reasignados correctamente'
          : 'Categoría eliminada. Los productos quedaron sin categoría';
        Swal.fire('Éxito', message, 'success');
        this.activeModal.close({ deleted: true });
      },
      error: (err) => {
        console.error('Error al eliminar categoría:', err);
        Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
      }
    });
  }

  close() {
    this.activeModal.close({ deleted: false });
  }
}



