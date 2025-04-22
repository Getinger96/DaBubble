import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserComponent } from './edit-user.component';
import { RouterLink } from '@angular/router';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserComponent, RouterLink],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
