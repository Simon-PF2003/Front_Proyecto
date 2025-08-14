import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavVarComponent } from '../nav-var/nav-var.component';
import { InstitucionalQuienesSomosComponent } from './institucional-quienes-somos.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { NavbarBottomComponent } from '../navbar-bottom/navbar-bottom.component';

describe('InstitucionalQuienesSomosComponent', () => {
  let component: InstitucionalQuienesSomosComponent;
  let fixture: ComponentFixture<InstitucionalQuienesSomosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      declarations: [InstitucionalQuienesSomosComponent, NavVarComponent, NavbarBottomComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } } 
      ]
    });
    fixture = TestBed.createComponent(InstitucionalQuienesSomosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
