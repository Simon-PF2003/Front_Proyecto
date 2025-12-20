import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteClientesFielesComponent } from './reporte-clientes-fieles.component';

describe('ReporteClientesFielesComponent', () => {
  let component: ReporteClientesFielesComponent;
  let fixture: ComponentFixture<ReporteClientesFielesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteClientesFielesComponent]
    });
    fixture = TestBed.createComponent(ReporteClientesFielesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
