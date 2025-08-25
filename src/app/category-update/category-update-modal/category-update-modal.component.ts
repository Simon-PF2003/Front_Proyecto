import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategorySelectionService } from 'src/app/services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-update-modal',
  templateUrl: './category-update-modal.component.html',
  styleUrls: ['./category-update-modal.component.css']
})
export class CategoryUpdateModalComponent {
  @Input() 
  editedCategory: any;

  constructor(
    public activeModal: NgbActiveModal,
    private categoryService: CategorySelectionService
  ) {}

  ngOnInit(): void {

  }

  saveChanges() {
    this.categoryService.updateCategory(this.editedCategory._id, this.editedCategory).subscribe(
      {
        next: res => {
          Swal.fire('Categoría actualizada con éxito!!', '', 'success');
        },
        error: err => {
          Swal.fire('Error', 'Error al actualizar la categoría', 'error');

        }
      }
    );
  }

  close() {
    this.activeModal.close(this.editedCategory);
    location.reload();
  }
}


