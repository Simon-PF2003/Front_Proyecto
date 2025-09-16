import { Component, Input } from '@angular/core';
import { FiltersStateService } from '../filters-state.service';

@Component({
  selector: 'app-filters-panel',
  templateUrl: './filters-panel.component.html',
  styleUrls: ['./filters-panel.component.css']
})
export class FiltersPanelComponent {
  @Input() categories: any[] = [];
  @Input() brands: any[] = [];

  constructor(public filters: FiltersStateService) {}

  applyPrice() {
    // este método no hace nada directo: el padre (página) detecta cambios por subscription y hace fetch
    // igual lo dejamos por semántica del botón "Aplicar filtro"
  }

  getCategoryName(id: string): string {
    if (!id || !this.categories || !this.categories.length) return id;
    const cat = this.categories.find((x: any) => x && x._id === id);
    return cat?.type ?? id;
  }
}
