import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionClienteComponent } from './edicion-cliente.component';

describe('EdicionClienteComponent', () => {
  let component: EdicionClienteComponent;
  let fixture: ComponentFixture<EdicionClienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EdicionClienteComponent]
    });
    fixture = TestBed.createComponent(EdicionClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
