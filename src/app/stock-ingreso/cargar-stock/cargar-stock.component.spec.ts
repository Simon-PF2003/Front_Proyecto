import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarStockComponent } from './cargar-stock.component';

describe('CargarStockComponent', () => {
  let component: CargarStockComponent;
  let fixture: ComponentFixture<CargarStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CargarStockComponent]
    });
    fixture = TestBed.createComponent(CargarStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
