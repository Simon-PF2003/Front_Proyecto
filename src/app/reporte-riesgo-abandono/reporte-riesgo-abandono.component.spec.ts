import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteRiesgoAbandonoComponent } from './reporte-riesgo-abandono.component';

describe('ReporteRiesgoAbandonoComponent', () => {
  let component: ReporteRiesgoAbandonoComponent;
  let fixture: ComponentFixture<ReporteRiesgoAbandonoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteRiesgoAbandonoComponent]
    });
    fixture = TestBed.createComponent(ReporteRiesgoAbandonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
