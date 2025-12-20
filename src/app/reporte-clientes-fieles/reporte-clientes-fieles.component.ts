import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface ClienteFiel {
  clienteId: string;
  clienteCode: string;
  clienteNombre: string;
  cantidadCompras: number;
  montoTotalGastado: number;
  fechaUltimoPedido: Date;
  nivelFidelidad: string;
}

@Component({
  selector: 'app-reporte-clientes-fieles',
  templateUrl: './reporte-clientes-fieles.component.html',
  styleUrls: ['./reporte-clientes-fieles.component.css']
})
export class ReporteClientesFielesComponent implements OnInit {
  clientes: ClienteFiel[] = [];
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  totalCompras: number = 0;
  totalMonto: number = 0;
  sortOrder: string = 'desc'; // 'asc' o 'desc'

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  displayedClientes: ClienteFiel[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.setDefaultDateRange();
    this.fetchClientesFieles();
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

  fetchClientesFieles() {
    if (!this.validateDates()) return;

    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";
    
    this.authService.getClientesFieles(dateStart, dateEnd, this.sortOrder).subscribe(
      (response: any) => {
        console.log('Respuesta del backend:', response);
        
        // Mapear los datos del backend a la estructura del frontend
        this.clientes = response.clientes.map((cliente: any) => ({
          clienteId: cliente.clienteId,
          clienteCode: cliente.clienteCode,
          clienteNombre: cliente.clienteNombre,
          cantidadCompras: cliente.cantidadCompras,
          montoTotalGastado: cliente.montoTotalGastado,
          fechaUltimoPedido: new Date(cliente.fechaUltimoPedido),
          nivelFidelidad: cliente.nivelFidelidad
        }));
        
        this.calcularTotales();
        this.totalPages = Math.ceil(this.clientes.length / this.pageSize);
        this.currentPage = 1;
        this.updateDisplayedClientes();
      },
      (error) => {
        console.error('Error al obtener clientes fieles:', error);
        this.clientes = [];
        this.calcularTotales();
        this.handleError(error);
      }
    );
  }

  calcularTotales() {
    this.totalCompras = this.clientes.reduce((sum, cliente) => sum + cliente.cantidadCompras, 0);
    this.totalMonto = this.clientes.reduce((sum, cliente) => sum + cliente.montoTotalGastado, 0);
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

  handleError(error: any) {
    console.log(error);
    let errorMessage = 'Se ha producido un error.';
    
    if (error.status === 401) {
      errorMessage = 'La fecha de inicio debe ser menor a la fecha de fin.';
    } else if (error.status === 402) {
      errorMessage = 'La fecha de inicio no puede ser mayor a la actual';
    } else if (error.status === 403) {
      errorMessage = 'No se encontraron clientes fieles en ese rango de fechas.';
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
      'Cantidad de Compras': cliente.cantidadCompras,
      'Monto Total Gastado': cliente.montoTotalGastado,
      'Fecha Último Pedido': new Date(cliente.fechaUltimoPedido).toLocaleDateString('es-AR'),
      'Nivel de Fidelidad': cliente.nivelFidelidad
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Fieles');

    const fechaInicio = new Date(this.dateRangeStart).toLocaleDateString('es-AR').replace(/\//g, '-');
    const fechaFin = new Date(this.dateRangeEnd).toLocaleDateString('es-AR').replace(/\//g, '-');
    const fileName = `Clientes_Fieles_${fechaInicio}_a_${fechaFin}.xlsx`;

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
