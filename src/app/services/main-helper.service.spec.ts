import { TestBed } from '@angular/core/testing';

import { MainHelperService } from './main-helper.service';

describe('MainHelperService', () => {
  let service: MainHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
