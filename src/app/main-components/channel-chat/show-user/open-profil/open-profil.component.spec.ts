import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProfilComponent } from './open-profil.component';

describe('OpenProfilComponent', () => {
  let component: OpenProfilComponent;
  let fixture: ComponentFixture<OpenProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenProfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
