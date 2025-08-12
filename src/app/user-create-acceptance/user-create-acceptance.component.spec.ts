import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateAcceptanceComponent } from './user-create-acceptance.component';

describe('UserCreateAcceptanceComponent', () => {
  let component: UserCreateAcceptanceComponent;
  let fixture: ComponentFixture<UserCreateAcceptanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserCreateAcceptanceComponent]
    });
    fixture = TestBed.createComponent(UserCreateAcceptanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
