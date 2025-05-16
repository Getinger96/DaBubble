import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberChannelComponent } from './add-member-channel.component';

describe('AddMemberChannelComponent', () => {
  let component: AddMemberChannelComponent;
  let fixture: ComponentFixture<AddMemberChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMemberChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
