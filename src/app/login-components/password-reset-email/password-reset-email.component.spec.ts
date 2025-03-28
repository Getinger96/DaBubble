import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetEmailComponent } from './password-reset-email.component';

describe('PasswordResetComponent', () => {
  let component: PasswordResetEmailComponent;
  let fixture: ComponentFixture<PasswordResetEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordResetEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
