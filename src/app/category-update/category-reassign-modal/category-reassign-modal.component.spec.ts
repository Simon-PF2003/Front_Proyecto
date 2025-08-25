import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryReassignModalComponent } from './category-reassign-modal.component';

describe('CategoryReassignModalComponent', () => {
  let component: CategoryReassignModalComponent;
  let fixture: ComponentFixture<CategoryReassignModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryReassignModalComponent]
    });
    fixture = TestBed.createComponent(CategoryReassignModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
