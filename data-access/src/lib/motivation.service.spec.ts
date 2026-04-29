import { TestBed } from '@angular/core/testing';

import { PerformancePeriodService } from './motivation.service';

describe('PerformancePeriodService', () => {
  let service: PerformancePeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
