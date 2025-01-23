import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenarClientesComponent } from './ordenar-clientes.component';

describe('OrdenarClientesComponent', () => {
  let component: OrdenarClientesComponent;
  let fixture: ComponentFixture<OrdenarClientesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdenarClientesComponent]
    });
    fixture = TestBed.createComponent(OrdenarClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
