import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { PaymentRequest, User } from '@sotbi/models';
import {
  PaymentRequestTarget,
  PaymentRequestType,
  StatusEnum,
} from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { PaymentRequestService } from './payment-request.service';

describe('PaymentRequestService', () => {
  let service: PaymentRequestService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  const mockUser: User = {
    id: 1,
    uuid: new Uint16Array([1, 2, 3, 4]),
    user: 'john.doe',
    avatar: 'avatar.jpg',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    hired: new Date('2023-01-01'),
    fired: new Date('2025-12-31'),
    password: 'hashedpassword',
    data: new Date('2023-01-01'),
    role: 1,
    user_group_id: 1,
    group: {
      id: 1,
      name: 'Admin',
      label: 'Administrator',
      level: 1,
      home: '/admin',
    },
    position_id: 1,
    users_positions: [],
    unit1_id: 1,
    unit1: 'Development',
    unit2_id: 1,
    unit2: 'Frontend',
    settings: 0,
    staff_type: 1,
    update_at: new Date('2023-01-01'),
    updated_by: 1,
    surname: 'Doe',
    patronymic: 'Middle',
    birthday: new Date('1990-01-01'),
    passport_series: '1234',
    passport_number: '567890',
    passport_date: new Date('2010-01-01'),
    passport_issued: 'Test Department',
    inn: '123456789012',
    snils: '123-456-789 01',
    diploma: 'Test University',
    mobile: '+1234567890',
    external_email: 'john.external@example.com',
    tg_nik: '@johndoe',
    registration_address: '123 Test St',
    actual_address: '456 Real St',
    scans: [],
  };

  const mockPaymentRequest: PaymentRequest = {
    id: 1,
    status: StatusEnum.OPEN,
    debtor_id: 1,
    bank_detail_id: 1,
    target: PaymentRequestTarget.PAY,
    request_type: PaymentRequestType.FORM,
    description: 'Test payment request',
    worked_by_id: 1,
    defrayments: [],
    payment_attachments: [],
    project_name: 'Test Project',
    debtor_name: 'Test Debtor LLC',
    defrayments_count: 2,
    updated_by_name: 'John Doe',
    worked_by_name: 'Jane Smith',
    project_owner_id: 1,
    doer_comment: 'Processing payment request',
  };

  const mockPaymentRequests: PaymentRequest[] = [
    mockPaymentRequest,
    {
      id: 2,
      status: StatusEnum.WORK,
      debtor_id: 2,
      bank_detail_id: 2,
      target: PaymentRequestTarget.CARDFILE,
      request_type: PaymentRequestType.SIGN,
      description: 'Another payment request',
      worked_by_id: 2,
      defrayments: [],
      payment_attachments: [],
      project_name: 'Another Project',
      debtor_name: 'Another Debtor Inc',
      defrayments_count: 1,
      updated_by_name: 'Bob Wilson',
      worked_by_name: 'Alice Johnson',
      project_owner_id: 2,
    },
  ];

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpClient', [
      'get',
      'post',
      'put',
      'patch',
      'delete',
    ]);

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        PaymentRequestService,
      ],
    }).compileComponents();

    service = TestBed.inject(PaymentRequestService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/payment-request');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(PaymentRequestService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.GetAll).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
    expect(typeof service.download).toBe('function');
  });

  describe('getAllWithParams', () => {
    it('should call GET with correct URL and parameters', () => {
      const params = new HttpParams().set('page', '1').set('limit', '10');
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      httpClient.get.and.returnValue(of(mockResponse));

      service.getAllWithParams(params).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.requests).toEqual(mockPaymentRequests);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params,
      });
    });

    it('should handle empty parameters', () => {
      const emptyParams = new HttpParams();
      const mockResponse = { requests: [], count: 0 };
      httpClient.get.and.returnValue(of(mockResponse));

      service.getAllWithParams(emptyParams).subscribe((result) => {
        expect(result.requests).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: emptyParams,
      });
    });

    it('should handle undefined parameters', () => {
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      httpClient.get.and.returnValue(of(mockResponse));

      service.getAllWithParams(undefined).subscribe((result) => {
        expect(result.requests).toEqual(mockPaymentRequests);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: undefined,
      });
    });

    it('should handle complex query parameters', () => {
      const complexParams = new HttpParams()
        .set('search', 'Test Project')
        .set('status', StatusEnum.OPEN)
        .set('target', PaymentRequestTarget.PAY)
        .set('request_type', PaymentRequestType.FORM)
        .set('debtor_id', '1')
        .set('worked_by_id', '1')
        .set('page', '1')
        .set('limit', '20')
        .set('sortBy', 'created_at')
        .set('sortOrder', 'desc');
      const mockResponse = { requests: [mockPaymentRequest], count: 1 };
      httpClient.get.and.returnValue(of(mockResponse));

      service.getAllWithParams(complexParams).subscribe((result) => {
        expect(result.count).toBe(1);
        expect(result.requests.length).toBe(1);
        expect(result.requests[0]).toEqual(mockPaymentRequest);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: complexParams,
      });
    });

    it('should handle filtering by status', () => {
      const statusParams = new HttpParams()
        .set('status', StatusEnum.WORK)
        .set('page', '1')
        .set('limit', '10');
      const filteredResponse = {
        requests: [mockPaymentRequests[1]],
        count: 1,
      };
      httpClient.get.and.returnValue(of(filteredResponse));

      service.getAllWithParams(statusParams).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.requests[0].status).toBe(StatusEnum.WORK);
        expect(result.count).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: statusParams,
      });
    });

    it('should handle filtering by target type', () => {
      const targetParams = new HttpParams()
        .set('target', PaymentRequestTarget.CARDFILE)
        .set('page', '1')
        .set('limit', '10');
      const filteredResponse = {
        requests: [mockPaymentRequests[1]],
        count: 1,
      };
      httpClient.get.and.returnValue(of(filteredResponse));

      service.getAllWithParams(targetParams).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.requests[0].target).toBe(PaymentRequestTarget.CARDFILE);
        expect(result.count).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: targetParams,
      });
    });

    it('should handle date range filtering', () => {
      const dateParams = new HttpParams()
        .set('date_from', '2024-01-01')
        .set('date_to', '2024-12-31')
        .set('page', '1')
        .set('limit', '10');
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      httpClient.get.and.returnValue(of(mockResponse));

      service.getAllWithParams(dateParams).subscribe((result) => {
        expect(result.requests).toEqual(mockPaymentRequests);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: dateParams,
      });
    });

    it('should return observable with correct response structure', () => {
      const params = new HttpParams().set('page', '1');
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      httpClient.get.and.returnValue(of(mockResponse));

      const result = service.getAllWithParams(params);

      expect(result).toBeDefined();
      result.subscribe((response) => {
        expect(response.requests).toBeDefined();
        expect(response.count).toBeDefined();
        expect(Array.isArray(response.requests)).toBeTruthy();
        expect(typeof response.count).toBe('number');
      });
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from getAllWithParams', (done) => {
      const errorResponse = new Error('Server Error');
      httpClient.get.and.returnValue(throwError(() => errorResponse));

      const params = new HttpParams().set('page', '1');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Server Error');
          done();
        },
      });
    });

    it('should handle network errors gracefully', (done) => {
      const networkError = new Error('Network Error');
      httpClient.get.and.returnValue(throwError(() => networkError));

      const params = new HttpParams().set('limit', '10');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Network Error');
          done();
        },
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle a typical payment request workflow', () => {
      // Search for payment requests
      const searchParams = new HttpParams()
        .set('search', 'Test')
        .set('status', StatusEnum.OPEN)
        .set('page', '1')
        .set('limit', '10');
      const searchResponse = { requests: [mockPaymentRequest], count: 1 };

      // Get specific payment request details
      const paymentRequestDetails: PaymentRequest = {
        ...mockPaymentRequest,
        histories: [],
        updated_by: mockUser,
      };

      // Update payment request
      const updatedPaymentRequest: PaymentRequest = {
        ...mockPaymentRequest,
        status: StatusEnum.WORK,
        doer_comment: 'Started processing',
      };

      httpClient.get.and.returnValues(
        of(searchResponse),
        of(paymentRequestDetails),
      );
      httpClient.put.and.returnValue(of(updatedPaymentRequest));

      // Search for payment requests
      service.getAllWithParams(searchParams).subscribe((searchResult) => {
        expect(searchResult.count).toBe(1);
      });

      // Get specific payment request details
      service.get(1).subscribe((details) => {
        expect(details.id).toBe(1);
      });

      // Update payment request
      service
        .update({ id: 1, status: StatusEnum.WORK })
        .subscribe((updated) => {
          expect(updated.status).toBe(StatusEnum.WORK);
        });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.put).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination correctly', () => {
      const page1Params = new HttpParams().set('page', '1').set('limit', '5');
      const page2Params = new HttpParams().set('page', '2').set('limit', '5');

      const page1Response = { requests: [mockPaymentRequests[0]], count: 2 };
      const page2Response = { requests: [mockPaymentRequests[1]], count: 2 };

      httpClient.get.and.returnValues(of(page1Response), of(page2Response));

      // Get first page
      service.getAllWithParams(page1Params).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.count).toBe(2);
      });

      // Get second page
      service.getAllWithParams(page2Params).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: page1Params,
      });
      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-requests', {
        params: page2Params,
      });
    });
  });
});
