import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessageUserComponent } from './direct-message-user.component';

describe('DirectMessageUserComponent', () => {
  let component: DirectMessageUserComponent;
  let fixture: ComponentFixture<DirectMessageUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMessageUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectMessageUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
