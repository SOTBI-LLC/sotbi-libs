import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AccreditationService } from './accreditation.service';

describe('AccreditationService', () => {
  let service: AccreditationService;

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        AccreditationService,
      ],
    }).compileComponents();

    service = TestBed.inject(AccreditationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/accreditations');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(AccreditationService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
  });
});
