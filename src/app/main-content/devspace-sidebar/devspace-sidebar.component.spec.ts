import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevspaceSidebarComponent } from './devspace-sidebar.component';

describe('DevspaceSidebarComponent', () => {
  let component: DevspaceSidebarComponent;
  let fixture: ComponentFixture<DevspaceSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevspaceSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevspaceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
