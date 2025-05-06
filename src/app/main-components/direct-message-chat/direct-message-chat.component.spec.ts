import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageChatComponent } from './direct-message-chat.component';

describe('DirectMessageChatComponent', () => {
  let component: DirectMessageChatComponent;
  let fixture: ComponentFixture<DirectMessageChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
