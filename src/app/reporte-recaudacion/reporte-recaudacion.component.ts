import { Component, OnInit } from '@angular/core';
import { BillService } from '../services/bill.service';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';

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
        console.log('Respuesta del backend (getBills):', response);
        console.log('Facturas recibidas:', response.bills);
        
        // Procesar las facturas para extraer los códigos correctos
        this.facturas = response.bills.map((factura: any) => {
          console.log('Procesando factura:', factura);
          return {
            ...factura,
            userCode: factura.userId?.code || factura.userId?._id || 'N/A',
            orderCode: factura.orderId?.code || factura.orderId?._id || 'N/A',
            userBusinessName: factura.userId?.businessName || 'No disponible'
          };
        });
        
        console.log('Facturas procesadas:', this.facturas);
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

  exportarExcel() {
    if (this.facturas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay facturas para exportar.',
      });
      return;
    }

    // Mostrar loading mientras se genera el Excel
    Swal.fire({
      title: 'Generando Excel...',
      text: 'Por favor espera mientras se prepara el archivo',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const dateStart = this.dateRangeStart + "T00:00:00Z";
    const dateEnd = this.dateRangeEnd + "T23:59:59Z";

    this.billService.exportBillsExcel(dateStart, dateEnd).subscribe({
      next: (blob: Blob) => {
        Swal.close();
        
        // Generar el nombre del archivo con las fechas
        const fechaInicio = new Date(this.dateRangeStart).toLocaleDateString('es-ES').replace(/\//g, '-');
        const fechaFin = new Date(this.dateRangeEnd).toLocaleDateString('es-ES').replace(/\//g, '-');
        const nombreArchivo = `Reporte_Recaudacion_${fechaInicio}_al_${fechaFin}.xlsx`;

        // Descargar el archivo
        saveAs(blob, nombreArchivo);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Exportación exitosa!',
          text: `El archivo ${nombreArchivo} se ha descargado correctamente.`,
          timer: 3000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error al exportar Excel:', error);
        
        let errorMessage = 'Ocurrió un error al generar el archivo Excel.';
        if (error.status === 403) {
          errorMessage = 'No se encontraron facturas para exportar en el rango de fechas seleccionado.';
        } else if (error.status === 400) {
          errorMessage = 'Rango de fechas inválido.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor al generar el Excel.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error de exportación',
          text: errorMessage,
        });
      }
    });
  }

  verFactura(billId: string) {
    if (!billId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de factura no válido',
      });
      return;
    }

    // Mostrar loading mientras se obtiene el PDF
    Swal.fire({
      title: 'Cargando factura...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.billService.getBillPDF(billId).subscribe({
      next: (pdfBlob: Blob) => {
        Swal.close();
        
        // Crear URL del blob y abrirlo en nueva pestaña
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

        // Liberar el objeto URL después de un tiempo
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 100);
      },
      error: (error) => {
        Swal.close();
        console.error('Error al obtener PDF de factura:', error);
        
        let errorMessage = 'Ocurrió un error al obtener la factura.';
        if (error.status === 404) {
          errorMessage = 'Factura no encontrada.';
        } else if (error.status === 400) {
          errorMessage = 'ID de factura inválido.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor al generar el PDF.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al visualizar factura',
          text: errorMessage,
        });
      }
    });
  }
}
