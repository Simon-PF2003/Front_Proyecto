import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductUpdateModalComponent } from './product-update-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductUpdateModalComponent', () => {
  let component: ProductUpdateModalComponent;
  let fixture: ComponentFixture<ProductUpdateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      declarations: [ProductUpdateModalComponent],
      providers: [NgbActiveModal]
    });
    fixture = TestBed.createComponent(ProductUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
