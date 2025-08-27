import { Component, OnInit } from '@angular/core';
import { BrandSelectionService } from '../services/brand.service';
import { BrandUpdateModalComponent } from './brand-update-modal/brand-update-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brand-update',
  templateUrl: './brand-update.component.html',
  styleUrls: ['./brand-update.component.css']
})
export class BrandUpdateComponent {

  brand: string = '';
  foundBrands: any[] = [];
  displayedBrands: any[] = [];
  brandObject: any = null;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
      private brandService: BrandSelectionService,
      private modalService: NgbModal
  ){}

  ngOnInit(): void {
    this.obtenerMarcas();
  }

  obtenerMarcas() {
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        this.foundBrands = brands;
        this.actualizarPaginacion();
      },
      error: (error) => {
        console.error('Error al obtener las marcas', error);
      }
    });
  }

  onBuscarClick() {
    if (!this.brand.trim()) {
      this.obtenerMarcas();
      return;
    }
    this.brandService.searchBrands(this.brand).subscribe({
      next: (brands) => {
        this.foundBrands = brands;
        this.actualizarPaginacion();
      },
      error: (error) => {
        Swal.fire('Error', 'No se encontró ninguna marca. Busque por descripción', 'warning');
      }
    });
  }

  actualizarPaginacion() {
    this.totalPages = Math.ceil(this.foundBrands.length / this.pageSize);
    this.currentPage = 1;
    this.actualizarMarcasMostradas();
  }

  actualizarMarcasMostradas() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedBrands = this.foundBrands.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.actualizarMarcasMostradas();
    }
  }

  modifyBrand(brandObject: any) {
    const modalRef = this.modalService.open(BrandUpdateModalComponent, { centered: true });
    modalRef.componentInstance.editedBrand = { ...brandObject };
    modalRef.result.then((result) => {
      if (result) {
        this.obtenerMarcas();
      }
    });
  }

  deleteBrand(brandId: string) {
    // Obtener la marca que se va a eliminar
    const brandToDelete = this.foundBrands.find(b => b._id === brandId);
    if (!brandToDelete) {
      Swal.fire('Error', 'Marca no encontrada', 'error');
      return;
    }

    // Confirmar eliminación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la marca "${brandToDelete.brand}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.brandService.deleteBrand(brandId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La marca ha sido eliminada correctamente', 'success');
            this.obtenerMarcas(); // Recargar la lista de marcas
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar la marca', 'error');
            console.error('Error al eliminar la marca:', error);
          }
        });
      }
    });
  }
}
