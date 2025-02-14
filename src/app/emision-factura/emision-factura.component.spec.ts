import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmisionFacturaComponent } from './emision-factura.component';

describe('EmisionFacturaComponent', () => {
  let component: EmisionFacturaComponent;
  let fixture: ComponentFixture<EmisionFacturaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmisionFacturaComponent]
    });
    fixture = TestBed.createComponent(EmisionFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
