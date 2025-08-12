import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SupplierService } from './supplier.service';
import { SupplierUpdateComponent } from '../supplier-update/supplier-update.component';
import { SupplierCreateComponent } from '../supplier-create/supplier-create.component';

describe('SupplierService', () => {
  let service: SupplierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SupplierUpdateComponent, SupplierCreateComponent]
    });
    service = TestBed.inject(SupplierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
