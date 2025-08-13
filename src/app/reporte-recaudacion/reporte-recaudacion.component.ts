import { Component, OnInit } from '@angular/core';
import { BillService } from '../services/bill.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-recaudacion',
  templateUrl: './reporte-recaudacion.component.html',
  styleUrls: ['./reporte-recaudacion.component.css']
})
export class ReporteRecaudacionComponent implements OnInit {
  facturas: any[] = [];
  totalRecaudado: number = 0;
  dateRangeStart: string = '';
  dateRangeEnd: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  displayedFacturas: any[] = [];

  constructor(
    private billService: BillService
  ) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.fetchRecaudacion();
  }

  setDefaultDateRange() {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    this.dateRangeStart = lastMonth.toISOString().split('T')[0];
    this.dateRangeEnd = today.toISOString().split('T')[0];
  }

  validateDates(): boolean {
    const startDate = new Date(this.dateRangeStart);
    const endDate = new Date(this.dateRangeEnd);

    if (startDate > endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas no válidas',
        text: 'La fecha de inicio no puede ser mayor a la fecha de fin.',
      });
      return false;
    }
    return true;
  }

  fetchRecaudacion() {
    if (!this.validateDates()) return;
    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";
    this.billService.getBills(dateStart, dateEnd).subscribe(
      (response: any) => {
        this.facturas = response.bills;
        this.totalRecaudado = response.totalRecaudado;
        this.totalPages = Math.ceil(this.facturas.length / this.pageSize);
        this.currentPage = 1;
        this.updateDisplayedFacturas();
      },
      (error) => {
        console.log(error);
        let errorMessage = 'Se ha producido un error.';
        if (error.status === 401) errorMessage = 'La fecha de inicio debe ser menor a la fecha de fin.';
        else if (error.status === 402) errorMessage = 'La fecha de inicio no puede ser mayor a la actual';
        else if (error.status === 403) errorMessage = 'No se encontraron facturas en ese rango de fechas.';
        else if (error.status === 400) errorMessage = 'Se ha producido un error con la solicitud.';
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      }
    );
  }

  updateDisplayedFacturas() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedFacturas = this.facturas.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedFacturas();
    }
  }
}
