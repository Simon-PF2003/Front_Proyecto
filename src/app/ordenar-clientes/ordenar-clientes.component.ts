import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ordenar-clientes',
  templateUrl: './ordenar-clientes.component.html',
  styleUrls: ['./ordenar-clientes.component.css']
})
export class OrdenarClientesComponent implements OnInit {
  clients: any[] = [];
  sortCriteria: string = 'antiguedad';
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  sortOrder: string = 'asc';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.fetchClients();
  }

  async onCriteriaChange() {
    this.fetchClients();
  }

  validateDates(): boolean {
    const today = new Date();
    const startDate = new Date(this.dateRangeStart);
    const endDate = new Date(this.dateRangeEnd);

    // Validar que startDate no sea mayor a hoy
    if (this.dateRangeStart && startDate > today) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha no válida',
        text: 'La fecha de inicio no puede ser mayor a hoy.',
      });
      this.dateRangeStart = '';
      return false;
    }

    // Validar que endDate no sea menor a startDate
    if (this.dateRangeEnd && this.dateRangeStart && endDate < startDate) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas no válidas',
        text: 'La fecha de fin no puede ser menor a la fecha de inicio.',
      });
      this.dateRangeEnd = '';
      return false;
    }

    return true;
  }

  fetchClients() {
    if (!this.validateDates()) return;

    const filters = {
      sortCriteria: this.sortCriteria,
      dateRangeStart: this.dateRangeStart,
      dateRangeEnd: this.dateRangeEnd,
      sortOrder: this.sortOrder,
    };

    this.authService.getFilteredClients(filters).subscribe(
      (data) => {
        this.clients = data;

        // Mostrar alerta si no hay clientes
        if (this.clients.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No hay clientes que cumplan con los criterios seleccionados. Modifique el rango de fechas seleccionado o eliminelo',
          });
        }
      },
      (error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al obtener los clientes. Por favor, intenta nuevamente.',
        });
      }
    );
  }
}
