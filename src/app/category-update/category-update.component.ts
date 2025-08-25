import { Component, OnInit } from '@angular/core';
import { CategorySelectionService } from '../services/category.service';
import { CategoryUpdateModalComponent } from './category-update-modal/category-update-modal.component';
import { CategoryReassignModalComponent } from './category-reassign-modal/category-reassign-modal.component';
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

    // Obtener todas las categorías excepto la que se quiere eliminar
    const availableCategories = this.foundCategories.filter(c => c._id !== categoryId);

    const modalRef = this.modalService.open(CategoryReassignModalComponent, { centered: true });
    modalRef.componentInstance.categoryToDelete = categoryToDelete;
    modalRef.componentInstance.availableCategories = availableCategories;

    modalRef.result.then((result) => {
      if (result && result.deleted) {
        this.obtenerCategorias(); // Recargar la lista de categorías
      }
    }).catch(() => {
      // El usuario cerró el modal sin confirmar
    });
  }
}
