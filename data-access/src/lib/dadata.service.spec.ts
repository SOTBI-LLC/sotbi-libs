import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { Dadata } from '@sotbi/models';
import { of } from 'rxjs';
import { DadataService } from './dadata.service';

describe('DadataService', () => {
  const mockResponse: Dadata = {
    data: {
      kpp: '1234567890',
      name: {
        full: 'test',
        short_with_opf: 'test',
      },
    },
    unrestricted_value: 'test',
    value: 'test',
  };
  let service: DadataService;
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [DadataService, { provide: HttpClient, useValue: httpSpy }],
    }).compileComponents();

    service = TestBed.inject(DadataService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDataByInn', () => {
    it('should fetch data by inn (success path)', () => {
      const inn = '1234567890';
      httpClient.get.mockReturnValue(of([mockResponse]));
      service.getDataByInn(inn).subscribe((result) => {
        expect(result).toEqual([mockResponse]);
      });
      const expected = new HttpParams().set('inn', '1234567890');
      expect(httpClient.get).toHaveBeenCalledWith('/api/suggestions', {
        params: expected,
      });
    });
  });
});
