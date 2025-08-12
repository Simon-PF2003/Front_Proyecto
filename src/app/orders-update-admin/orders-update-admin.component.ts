import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-update-admin',
  templateUrl: './orders-update-admin.component.html',
  styleUrls: ['./orders-update-admin.component.css']
})
export class OrdersUpdateAdminComponent {
  searchTerm: string = '';
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  showModal: boolean = false;
  selectedPedido: any | null = null;
  selectedStatus: string = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 2; // Cantidad de pedidos por página
  totalPages: number = 1;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getOrders();
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'];
      this.fetchOrders();
    });
  }

  async getOrders() {
    this.orderService.getPedidos().subscribe(async (data: any) => {
      for (const pedido of data) {
        try {
          const cliente = await this.authService.getOrderUser(pedido.userId);
          pedido.businessName = cliente.businessName;
        } catch (error) {
          console.error('Error obteniendo nombre del cliente:', error);
        }
      }
      this.pedidos = data;
      this.pedidosFiltrados = [...this.pedidos];
      this.updatePagination();
    });
  }

  filterPedidos(status?: string) {
    this.selectedStatus = status || '';
    if (status) {
      this.pedidosFiltrados = this.pedidos.filter(pedido => pedido.status === status);
    } else {
      this.pedidosFiltrados = [...this.pedidos];
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  async fetchOrders() {
    if (this.searchTerm) {
      const data = await firstValueFrom(this.orderService.getOrdersFiltered(this.searchTerm));
      for (const pedido of data) {
        const cliente = await this.authService.getOrderUser(pedido.userId);
        pedido.businessName = cliente.businessName;
      }
      this.pedidosFiltrados = data;
    } else {
      this.getOrders();
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  async cambiarEstado(pedId: string, nuevoEstado: string) {
    try {
      await firstValueFrom(this.orderService.cambiarEstado(pedId, nuevoEstado));
      this.getOrders();
      this.showModal = false;
      this.selectedPedido = null;

      if (nuevoEstado === 'Terminado' || nuevoEstado === 'Cancelado') {
        await firstValueFrom(this.orderService.getEmailByOrder(pedId));
      }

      Swal.fire({
        icon: 'success',
        title: '¡Estado actualizado!',
        text: `El pedido ${pedId} ahora está ${nuevoEstado}`,
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  openModal(pedido: any) {
    this.showModal = true;
    this.selectedPedido = pedido._id;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPedido = null;
  }

  // Métodos de paginación
  updatePagination() {
    this.totalPages = Math.ceil(this.pedidosFiltrados.length / this.itemsPerPage);
  }

  get paginatedPedidos() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.pedidosFiltrados.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
}
