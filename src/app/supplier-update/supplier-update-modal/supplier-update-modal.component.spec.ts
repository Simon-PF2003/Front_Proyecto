import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierUpdateModalComponent } from './supplier-update-modal.component';

describe('SupplierUpdateModalComponent', () => {
  let component: SupplierUpdateModalComponent;
  let fixture: ComponentFixture<SupplierUpdateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierUpdateModalComponent]
    });
    fixture = TestBed.createComponent(SupplierUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
