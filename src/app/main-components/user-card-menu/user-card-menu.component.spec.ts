import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCardMenuComponent } from './user-card-menu.component';

describe('UserCardMenuComponent', () => {
  let component: UserCardMenuComponent;
  let fixture: ComponentFixture<UserCardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserCardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
