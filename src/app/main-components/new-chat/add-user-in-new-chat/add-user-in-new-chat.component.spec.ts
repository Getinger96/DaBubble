import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserInNewChatComponent } from './add-user-in-new-chat.component';

describe('AddUserInNewChatComponent', () => {
  let component: AddUserInNewChatComponent;
  let fixture: ComponentFixture<AddUserInNewChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUserInNewChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUserInNewChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
