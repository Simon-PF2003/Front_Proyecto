import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteRecaudacionComponent } from './reporte-recaudacion.component';

describe('ReporteRecaudacionComponent', () => {
  let component: ReporteRecaudacionComponent;
  let fixture: ComponentFixture<ReporteRecaudacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteRecaudacionComponent]
    });
    fixture = TestBed.createComponent(ReporteRecaudacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
