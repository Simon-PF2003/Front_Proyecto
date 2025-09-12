import { Component, OnInit } from '@angular/core';
import { UsersCountService } from '../services/users-count.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  pendingUsersCount: number = 0;
  lowStockProductsCount: number = 0; 

  constructor(
    private usersCountService: UsersCountService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Suscribirse al conteo de usuarios pendientes
    this.usersCountService.pendingUsersCount$.subscribe(count => {
      this.pendingUsersCount = count;
    });
    
    // Actualizar el conteo inicial
    this.usersCountService.updatePendingUsersCount();
    this.productService.getNoStockProducts().subscribe(count => {
      this.lowStockProductsCount = count.length;
      console.log(this.lowStockProductsCount);
    });
  }
}
