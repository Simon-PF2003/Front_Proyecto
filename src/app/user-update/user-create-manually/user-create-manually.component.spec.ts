import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateManuallyComponent } from './user-create-manually.component';

describe('UserCreateManuallyComponent', () => {
  let component: UserCreateManuallyComponent;
  let fixture: ComponentFixture<UserCreateManuallyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCreateManuallyComponent]
    });
    fixture = TestBed.createComponent(UserCreateManuallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
