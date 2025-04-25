import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageActionBoxComponent } from './message-action-box.component';

describe('MessageActionBoxComponent', () => {
  let component: MessageActionBoxComponent;
  let fixture: ComponentFixture<MessageActionBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageActionBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageActionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
