import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InstitucionalContactoComponent } from './institucional-contacto.component';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { BottomNavbarComponent } from '../bottom-navbar/bottom-navbar.component';
import { ActivatedRoute } from '@angular/router';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FormsModule } from '@angular/forms';

describe('InstitucionalContactoComponent', () => {
  let component: InstitucionalContactoComponent;
  let fixture: ComponentFixture<InstitucionalContactoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule, FormsModule],
      declarations: [InstitucionalContactoComponent, NavVarComponent, ContactFormComponent, BottomNavbarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } } 
      ]
    });
    fixture = TestBed.createComponent(InstitucionalContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
