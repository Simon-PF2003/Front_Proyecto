import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductRetrieveComponent } from './product-retrieve.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavVarComponent } from 'src/app/nav-var/nav-var.component';

describe('ProductRetrieveComponent', () => {
  let component: ProductRetrieveComponent;
  let fixture: ComponentFixture<ProductRetrieveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductRetrieveComponent, NavVarComponent],
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } }
      ]
    });
    fixture = TestBed.createComponent(ProductRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
