import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategorySelectionService, Category } from 'src/app/services/category.service';

@Component({
  selector: 'app-down-comp',
  templateUrl: './down-comp.component.html',
  styleUrls: ['./down-comp.component.css']
})
export class DownCompComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private categorySelectionService: CategorySelectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categorySelectionService.getCategories().subscribe({
      next: (cats) => this.categories = cats || [],
      error: (e) => console.error('Error al cargar categorías en navbar:', e)
    });
  }

  selectCategory(id: string) {
    this.categorySelectionService.selectCategory(id);
    
    // Navegar a la ruta actual manteniendo la funcionalidad en cada sección
    const currentUrl = this.router.url;
    if (currentUrl.includes('/product-update')) {
      this.router.navigate(['/product-update']);
    } else if (currentUrl.includes('/stock-ingreso')) {
      this.router.navigate(['/stock-ingreso']);
    } else if (currentUrl.includes('/cargar-stock')) {
      this.router.navigate(['/cargar-stock']);
    } else if (currentUrl.includes('/reporte-agrupar-productos')) {
      this.router.navigate(['/reporte-agrupar-productos']);
    } else {
      this.router.navigate(['/products-list']);
    }
  }
}
