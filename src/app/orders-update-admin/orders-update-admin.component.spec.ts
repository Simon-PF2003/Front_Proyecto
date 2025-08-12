import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrdersUpdateAdminComponent } from './orders-update-admin.component';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('OrdersUpdateAdminComponent', () => {
  let component: OrdersUpdateAdminComponent;
  let fixture: ComponentFixture<OrdersUpdateAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      declarations: [OrdersUpdateAdminComponent, NavVarComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            queryParams: of({ q: 'test-query' }) // Simulando los queryParams
          }
        }
      ]
    });
    fixture = TestBed.createComponent(OrdersUpdateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
