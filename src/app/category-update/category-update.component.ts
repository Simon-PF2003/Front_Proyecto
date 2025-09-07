import { Component, OnInit } from '@angular/core';
import { CategorySelectionService } from '../services/category.service';
import { CategoryUpdateModalComponent } from './category-update-modal/category-update-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-update',
  templateUrl: './category-update.component.html',
  styleUrls: ['./category-update.component.css']
})
export class CategoryUpdateComponent implements OnInit {
  type: string = '';
  foundCategories: any[] = [];
  displayedCategories: any[] = [];
  category: any = null;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
      private categoryService: CategorySelectionService,
      private modalService: NgbModal
  ){}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.foundCategories = categories;
        this.actualizarPaginacion();
      },
      error: (error) => {
        console.error('Error al obtener las categorias', error);
      }
    });
  }

  onBuscarClick() {
    if (!this.type.trim()) {
      this.obtenerCategorias();
      return;
    }
    this.categoryService.searchCategories(this.type).subscribe({
      next: (categories) => {
        this.foundCategories = categories;
        this.actualizarPaginacion();
      },
      error: (error) => {
        Swal.fire('Error', 'No se encontró ninguna categoria. Busque por descripción', 'warning');
      }
    });
  }

  actualizarPaginacion() {
    this.totalPages = Math.ceil(this.foundCategories.length / this.pageSize);
    this.currentPage = 1;
    this.actualizarCategoriasMostradas();
  }

  actualizarCategoriasMostradas() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedCategories = this.foundCategories.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.actualizarCategoriasMostradas();
    }
  }

  modifyCategory(category: any) {
    const modalRef = this.modalService.open(CategoryUpdateModalComponent, { centered: true });
    modalRef.componentInstance.editedCategory = { ...category };
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerCategorias();
      }
    });
  }

  deleteCategory(categoryId: string) {
    // Obtener la categoría que se va a eliminar
    const categoryToDelete = this.foundCategories.find(c => c._id === categoryId);
    if (!categoryToDelete) {
      Swal.fire('Error', 'Categoría no encontrada', 'error');
      return;
    }

    // Mostrar confirmación de eliminación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la categoría "${categoryToDelete.type}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceder con la eliminación
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'La categoría ha sido eliminada correctamente', 'success');
            this.obtenerCategorias(); // Recargar la lista de categorías
          },
          error: (err) => {
            console.error('Error al eliminar categoría:', err);
            if (err?.status === 400) {
              Swal.fire(
                'No se puede eliminar', 
                'Esta categoría tiene productos asociados. No es posible eliminarla.', 
                'error'
              );
            } else {
              const msg = err?.error?.message || 'Error al eliminar la categoría';
              Swal.fire('Error', msg, 'error');
            }
          }
        });
      }
    });
  }
}
