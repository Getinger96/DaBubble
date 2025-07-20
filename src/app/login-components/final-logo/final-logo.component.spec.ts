import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalLogoComponent } from './final-logo.component';

describe('FinalLogoComponent', () => {
  let component: FinalLogoComponent;
  let fixture: ComponentFixture<FinalLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalLogoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
