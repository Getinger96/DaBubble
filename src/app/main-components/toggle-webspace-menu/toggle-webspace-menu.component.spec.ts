import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleWebspaceMenuComponent } from './toggle-webspace-menu.component';

describe('ToggleWebspaceMenuComponent', () => {
  let component: ToggleWebspaceMenuComponent;
  let fixture: ComponentFixture<ToggleWebspaceMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleWebspaceMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToggleWebspaceMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
