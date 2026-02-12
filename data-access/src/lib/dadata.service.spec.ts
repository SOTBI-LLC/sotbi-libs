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
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      providers: [DadataService, { provide: HttpClient, useValue: httpSpy }],
    }).compileComponents();

    service = TestBed.inject(DadataService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDataByInn', () => {
    it('should fetch data by inn (success path)', () => {
      const inn = '1234567890';
      httpClient.get.and.returnValue(of([mockResponse]));
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
