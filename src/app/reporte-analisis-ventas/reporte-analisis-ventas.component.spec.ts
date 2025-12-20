import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAnalisisVentasComponent } from './reporte-analisis-ventas.component';

describe('ReporteAnalisisVentasComponent', () => {
  let component: ReporteAnalisisVentasComponent;
  let fixture: ComponentFixture<ReporteAnalisisVentasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteAnalisisVentasComponent]
    });
    fixture = TestBed.createComponent(ReporteAnalisisVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
