import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAvatarCardComponent } from './change-avatar-card.component';

describe('ChangeAvatarCardComponent', () => {
  let component: ChangeAvatarCardComponent;
  let fixture: ComponentFixture<ChangeAvatarCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAvatarCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeAvatarCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
