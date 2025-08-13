import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAgruparProductosComponent } from './reporte-agrupar-productos.component';

describe('ReporteAgruparProductosComponent', () => {
  let component: ReporteAgruparProductosComponent;
  let fixture: ComponentFixture<ReporteAgruparProductosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteAgruparProductosComponent]
    });
    fixture = TestBed.createComponent(ReporteAgruparProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
