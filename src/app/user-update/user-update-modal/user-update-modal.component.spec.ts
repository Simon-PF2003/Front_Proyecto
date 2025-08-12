import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateModalComponent } from './user-update-modal.component';

describe('UserUpdateModalComponent', () => {
  let component: UserUpdateModalComponent;
  let fixture: ComponentFixture<UserUpdateModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserUpdateModalComponent]
    });
    fixture = TestBed.createComponent(UserUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
