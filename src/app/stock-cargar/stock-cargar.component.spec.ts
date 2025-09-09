import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCargarComponent } from './stock-cargar.component';

describe('StockCargarComponent', () => {
  let component: StockCargarComponent;
  let fixture: ComponentFixture<StockCargarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockCargarComponent]
    });
    fixture = TestBed.createComponent(StockCargarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
