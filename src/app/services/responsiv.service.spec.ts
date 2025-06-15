import { TestBed } from '@angular/core/testing';

import { ResponsivService } from './responsiv.service';

describe('ResponsivService', () => {
  let service: ResponsivService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsivService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
