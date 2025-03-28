import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelMenuComponent } from './channel-menu.component';

describe('ChannelMenuComponent', () => {
  let component: ChannelMenuComponent;
  let fixture: ComponentFixture<ChannelMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
