import { Component, OnInit } from '@angular/core';
import { BillService } from '../services/bill.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recaudacion',
  templateUrl: './recaudacion.component.html',
  styleUrls: ['./recaudacion.component.css']
})
export class RecaudacionComponent implements OnInit {
  facturas: any[] = [];
  totalRecaudado: number = 0;
  dateRangeStart: string = '';
  dateRangeEnd: string = '';

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
        console.log(this.facturas);
      },
      (error) => {
        console.log(error);
        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de inicio debe ser menor a la fecha de fin.',
          });
        } else if (error.status === 402) {
            Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de inicio no puede ser mayor a la actual',
          });
        } else if (error.status === 403) {
          Swal.fire({
            icon: 'info',
            title: 'Error',
            text: 'No se encontraron facturas en ese rango de fechas.',
          });
        } else if (error.status === 400) {
            Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha producido un error con la solicitud.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha producido un error.',
          });
        }
      }
    );
  }
}
