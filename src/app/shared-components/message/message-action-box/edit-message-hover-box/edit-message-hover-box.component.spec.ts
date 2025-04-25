import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMessageHoverBoxComponent } from './edit-message-hover-box.component';

describe('EditMessageHoverBoxComponent', () => {
  let component: EditMessageHoverBoxComponent;
  let fixture: ComponentFixture<EditMessageHoverBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMessageHoverBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMessageHoverBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
