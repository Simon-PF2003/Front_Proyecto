import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsRetrieveComponent } from './products-retrieve.component';
import { ActivatedRoute } from '@angular/router';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { FooterComponent } from '../footer/footer.component';

describe('ProductsRetrieveComponent', () => {
  let component: ProductsRetrieveComponent;
  let fixture: ComponentFixture<ProductsRetrieveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      declarations: [ProductsRetrieveComponent, NavVarComponent, FooterComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } }
      ]
    });
    fixture = TestBed.createComponent(ProductsRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
