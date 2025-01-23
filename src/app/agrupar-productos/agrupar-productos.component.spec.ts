import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgruparProductosComponent } from './agrupar-productos.component';

describe('AgruparProductosComponent', () => {
  let component: AgruparProductosComponent;
  let fixture: ComponentFixture<AgruparProductosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgruparProductosComponent]
    });
    fixture = TestBed.createComponent(AgruparProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
