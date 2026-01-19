import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRetrieveComponent } from './dashboard-retrieve.component';

describe('DashboardRetrieveComponent', () => {
  let component: DashboardRetrieveComponent;
  let fixture: ComponentFixture<DashboardRetrieveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardRetrieveComponent]
    });
    fixture = TestBed.createComponent(DashboardRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
