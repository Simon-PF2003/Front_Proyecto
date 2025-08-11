import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductoAltaComponent } from './product-create.component';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ProductoAltaComponent', () => {
  let component: ProductoAltaComponent;
  let fixture: ComponentFixture<ProductoAltaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule, RouterModule, CommonModule, FormsModule],
      declarations: [ProductoAltaComponent, NavVarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } }
      ]
    });
    fixture = TestBed.createComponent(ProductoAltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
