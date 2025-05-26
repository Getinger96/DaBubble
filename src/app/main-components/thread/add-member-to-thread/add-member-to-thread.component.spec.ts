import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberToThreadComponent } from './add-member-to-thread.component';

describe('AddMemberToThreadComponent', () => {
  let component: AddMemberToThreadComponent;
  let fixture: ComponentFixture<AddMemberToThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberToThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMemberToThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
