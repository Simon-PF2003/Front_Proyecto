import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteOrdenarClientesComponent } from './reporte-ordenar-clientes.component';

describe('ReporteOrdenarClientesComponent', () => {
  let component: ReporteOrdenarClientesComponent;
  let fixture: ComponentFixture<ReporteOrdenarClientesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteOrdenarClientesComponent]
    });
    fixture = TestBed.createComponent(ReporteOrdenarClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
