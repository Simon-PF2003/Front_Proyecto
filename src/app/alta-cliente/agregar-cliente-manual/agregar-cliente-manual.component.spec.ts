import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarClienteManualComponent } from './agregar-cliente-manual.component';

describe('AgregarClienteManualComponent', () => {
  let component: AgregarClienteManualComponent;
  let fixture: ComponentFixture<AgregarClienteManualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarClienteManualComponent]
    });
    fixture = TestBed.createComponent(AgregarClienteManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
