import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebspaceMenuComponent } from './webspace-menu.component';

describe('WebspaceMenuComponent', () => {
  let component: WebspaceMenuComponent;
  let fixture: ComponentFixture<WebspaceMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebspaceMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebspaceMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
