import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StockIngresoComponent } from './stock-ingreso.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category.service';

describe('StockIngresoComponent', () => {
  let component: StockIngresoComponent;
  let fixture: ComponentFixture<StockIngresoComponent>;

  beforeEach(() => {
    // Mock del servicio ProductService
    const productServiceMock = {
      getNoStockProducts: () => of([]),
      getProductsWithFilters: (searchTerm?: string, category?: string, brand?: string, hasStock?: boolean, minPrice?: number, maxPrice?: number) => of([]),
      getProducts: () => of([]),
      updateProduct: (data: any, id: string) => of({ success: true })
    };

    // Mock del servicio CategorySelectionService
    const categorySelectionServiceMock = {
      categorySelected$: of('mock-category')
    };

    // Configuración del test
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [StockIngresoComponent, NavVarComponent, FooterComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ q: 'test-search' }) }
        },
        { provide: ProductService, useValue: productServiceMock },
        { provide: CategorySelectionService, useValue: categorySelectionServiceMock }
      ]
    });

    fixture = TestBed.createComponent(StockIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
