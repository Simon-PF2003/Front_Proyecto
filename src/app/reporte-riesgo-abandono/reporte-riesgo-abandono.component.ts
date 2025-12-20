import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface ClienteRiesgo {
  clienteId: string;
  clienteCode: string;
  clienteNombre: string;
  fechaUltimoPedido: Date;
  diasInactividad: number;
  montoGastado: number;
  nivelRiesgo: string;
}

@Component({
  selector: 'app-reporte-riesgo-abandono',
  templateUrl: './reporte-riesgo-abandono.component.html',
  styleUrls: ['./reporte-riesgo-abandono.component.css']
})
export class ReporteRiesgoAbandonoComponent implements OnInit {
  clientes: ClienteRiesgo[] = [];
  dateRangeStart: string = '';
  dateRangeEnd: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  displayedClientes: ClienteRiesgo[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.fetchClientesRiesgo();
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

  fetchClientesRiesgo() {
    if (!this.validateDates()) return;

    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";
    
    this.authService.getClientesRiesgoAbandono(dateStart, dateEnd).subscribe(
      (response: any) => {
        console.log('Respuesta del backend:', response);
        
        // Mapear los datos del backend a la estructura del frontend
        this.clientes = response.clientes.map((cliente: any) => ({
          clienteId: cliente.clienteId,
          clienteCode: cliente.clienteCode,
          clienteNombre: cliente.clienteNombre,
          fechaUltimoPedido: new Date(cliente.fechaUltimoPedido),
          diasInactividad: cliente.diasInactividad,
          montoGastado: cliente.montoGastado,
          nivelRiesgo: cliente.nivelRiesgo
        }));
        
        this.totalPages = Math.ceil(this.clientes.length / this.pageSize);
        this.currentPage = 1;
        this.updateDisplayedClientes();
      },
      (error) => {
        console.error('Error al obtener clientes en riesgo:', error);
        this.clientes = [];
        this.handleError(error);
      }
    );
  }

  updateDisplayedClientes() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedClientes = this.clientes.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedClientes();
    }
  }

  countByRiesgo(nivel: string): number {
    return this.clientes.filter(c => c.nivelRiesgo === nivel).length;
  }

  handleError(error: any) {
    console.log(error);
    let errorMessage = 'Se ha producido un error.';
    
    if (error.status === 401) {
      errorMessage = 'La fecha de inicio debe ser menor a la fecha de fin.';
    } else if (error.status === 402) {
      errorMessage = 'La fecha de inicio no puede ser mayor a la actual';
    } else if (error.status === 403) {
      errorMessage = 'No se encontraron clientes en riesgo en ese rango de fechas.';
    } else if (error.status === 400) {
      errorMessage = 'Se ha producido un error con la solicitud.';
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }

  exportarExcel() {
    const datosExportar = this.clientes.map(cliente => ({
      'ID Cliente': cliente.clienteCode,
      'Nombre': cliente.clienteNombre,
      'Fecha Último Pedido': new Date(cliente.fechaUltimoPedido).toLocaleDateString('es-AR'),
      'Días de Inactividad': cliente.diasInactividad,
      'Monto Gastado': cliente.montoGastado,
      'Nivel de Riesgo': cliente.nivelRiesgo
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riesgo Abandono');

    const fechaInicio = new Date(this.dateRangeStart).toLocaleDateString('es-AR').replace(/\//g, '-');
    const fechaFin = new Date(this.dateRangeEnd).toLocaleDateString('es-AR').replace(/\//g, '-');
    const fileName = `Riesgo_Abandono_${fechaInicio}_a_${fechaFin}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: 'success',
      title: 'Exportación exitosa',
      text: 'El archivo Excel se ha descargado correctamente.',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
