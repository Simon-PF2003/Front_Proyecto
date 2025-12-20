import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePronosticoDemandaComponent } from './reporte-pronostico-demanda.component';

describe('ReportePronosticoDemandaComponent', () => {
  let component: ReportePronosticoDemandaComponent;
  let fixture: ComponentFixture<ReportePronosticoDemandaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportePronosticoDemandaComponent]
    });
    fixture = TestBed.createComponent(ReportePronosticoDemandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
