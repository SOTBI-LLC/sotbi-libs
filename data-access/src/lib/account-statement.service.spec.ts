import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { AccountStatement, User } from '@sotbi/models';
import { StatusEnum } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { AccountStatementService } from './account-statement.service';

describe('AccountStatementService', () => {
  let service: AccountStatementService;
  let httpClient: jest.Mocked<HttpClient>;

  const mockUser: User = {
    id: 1,
    uuid: null,
    user: 'test.user',
    avatar: 'avatar.jpg',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    hired: new Date('2023-01-01'),
    fired: new Date('2025-12-31'),
    password: 'hashedpassword',
    data: new Date('2023-01-01'),
    role: 1,
    user_group_id: 1,
    group: {
      id: 1,
      name: 'User',
      label: 'Regular User',
      level: 2,
      home: '/dashboard',
    },
    position_id: 1,
    users_positions: [],
    unit1_id: 1,
    unit1: 'Finance',
    unit2_id: 1,
    unit2: 'Payments',
    settings: 0,
    staff_type: 1,
    update_at: new Date('2023-01-01'),
    updated_by: 1,
    surname: 'User',
    patronymic: 'Test',
    birthday: new Date('1990-01-01'),
    passport_series: '1234',
    passport_number: '567890',
    passport_date: new Date('2010-01-01'),
    passport_issued: 'Test Department',
    inn: '123456789012',
    snils: '123-456-789 01',
    diploma: 'Test University',
    mobile: '+1234567890',
    external_email: 'test.external@example.com',
    tg_nik: '@testuser',
    registration_address: '123 Test St',
    actual_address: '456 Real St',
    scans: [],
  };

  const mockAccountStatement: AccountStatement = {
    id: 1,
    status: StatusEnum.OPEN,
    bank_detail_id: 1,
    bank_account: '40702810000000123456',
    name: 'Test Bank Account',
    bank: 'Test Bank',
    bik: '044525225',
    project_name: 'Test Project',
    debtor_name: 'Test Debtor LLC',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
    request_type: 1,
    creator_id: 1,
    creator: mockUser,
    creator_name: 'Test User',
    created_at: new Date('2024-01-01'),
    doer_id: 2,
    doer: { ...mockUser, id: 2, name: 'Doer User' },
    doer_name: 'Doer User',
    executed_at: new Date('2024-01-02'),
    executed_time: new Date('2024-01-02T10:30:00'),
    pdf_file_name: 'statement_2024_01.pdf',
    txt_file_name: 'statement_2024_01.txt',
    excel_file_name: 'statement_2024_01.xlsx',
    description: 'Monthly bank statement',
    request_reason: 'Monthly reconciliation',
    reject_reason: null,
    duration: 24,
    debtor_id: 1,
  };

  const mockAccountStatements: AccountStatement[] = [
    mockAccountStatement,
    {
      id: 2,
      status: StatusEnum.WORK,
      bank_detail_id: 2,
      bank_account: '40702810000000654321',
      name: 'Another Bank Account',
      bank: 'Another Bank',
      bik: '044525999',
      project_name: 'Another Project',
      debtor_name: 'Another Debtor Inc',
      start: new Date('2024-02-01'),
      end: new Date('2024-02-29'),
      request_type: 2,
      creator_id: 1,
      creator: mockUser,
      creator_name: 'Test User',
      created_at: new Date('2024-02-01'),
      doer_id: 2,
      doer: { ...mockUser, id: 2, name: 'Doer User' },
      doer_name: 'Doer User',
      executed_at: new Date('2024-02-02'),
      executed_time: new Date('2024-02-02T14:15:00'),
      pdf_file_name: 'statement_2024_02.pdf',
      txt_file_name: null,
      excel_file_name: null,
      description: 'February statement',
      request_reason: 'Audit requirement',
      reject_reason: null,
      duration: 48,
      debtor_id: 2,
    },
  ];

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        AccountStatementService,
      ],
    }).compileComponents();

    service = TestBed.inject(AccountStatementService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/accountstatements');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(AccountStatementService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.GetAll).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
    expect(typeof service.download).toBe('function');
  });

  describe('getAllWithParams', () => {
    it('should call GET with correct URL and parameters (success path)', () => {
      const params = new HttpParams().set('page', '1').set('limit', '10');
      const mockResponse = { requests: mockAccountStatements, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(params).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.requests).toEqual(mockAccountStatements);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params,
      });
    });

    it('should handle empty parameters', () => {
      const emptyParams = new HttpParams();
      const mockResponse = { requests: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(emptyParams).subscribe((result) => {
        expect(result.requests).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: emptyParams,
      });
    });

    it('should handle undefined parameters', () => {
      const mockResponse = { requests: mockAccountStatements, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(undefined as any).subscribe((result) => {
        expect(result.requests).toEqual(mockAccountStatements);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: undefined,
      });
    });

    it('should handle complex query parameters', () => {
      const complexParams = new HttpParams()
        .set('status', StatusEnum.OPEN)
        .set('bank_detail_id', '1')
        .set('start_date', '2024-01-01')
        .set('end_date', '2024-01-31')
        .set('creator_id', '1')
        .set('request_type', '1')
        .set('sort', 'created_at')
        .set('order', 'desc');

      const mockResponse = { requests: [mockAccountStatement], count: 1 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(complexParams).subscribe((result) => {
        expect(result.count).toBe(1);
        expect(result.requests.length).toBe(1);
        expect(result.requests[0]).toEqual(mockAccountStatement);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: complexParams,
      });
    });

    it('should handle status filtering', () => {
      const statusParams = new HttpParams().set('status', StatusEnum.WORK);

      const filteredResponse = {
        requests: mockAccountStatements.filter(
          (req) => req.status === StatusEnum.WORK,
        ),
        count: 1,
      };
      httpClient.get.mockReturnValue(of(filteredResponse));

      service.getAllWithParams(statusParams).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.requests[0].status).toBe(StatusEnum.WORK);
        expect(result.count).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: statusParams,
      });
    });

    it('should handle request type filtering', () => {
      const typeParams = new HttpParams().set('request_type', '2');

      const filteredResponse = {
        requests: mockAccountStatements.filter((req) => req.request_type === 2),
        count: 1,
      };
      httpClient.get.mockReturnValue(of(filteredResponse));

      service.getAllWithParams(typeParams).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.requests[0].request_type).toBe(2);
        expect(result.count).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: typeParams,
      });
    });

    it('should handle date range parameters', () => {
      const dateParams = new HttpParams()
        .set('start_date', '2024-01-01')
        .set('end_date', '2024-12-31');

      const mockResponse = { requests: mockAccountStatements, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(dateParams).subscribe((result) => {
        expect(result.requests).toEqual(mockAccountStatements);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: dateParams,
      });
    });

    it('should return observable with account statements', () => {
      const params = new HttpParams().set('limit', '5');
      const mockResponse = { requests: mockAccountStatements, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      const result = service.getAllWithParams(params);

      expect(result).toBeDefined();
      result.subscribe((response) => {
        expect(Array.isArray(response.requests)).toBeTruthy();
        expect(typeof response.count).toBe('number');
        expect(response.requests.length).toBeGreaterThan(0);
        expect(response.requests[0].id).toBeDefined();
        expect(response.requests[0].bank_detail_id).toBeDefined();
      });
    });

    it('should handle pagination parameters', () => {
      const page1Params = new HttpParams().set('page', '1').set('limit', '1');
      const page2Params = new HttpParams().set('page', '2').set('limit', '1');

      const page1Response = { requests: [mockAccountStatements[0]], count: 2 };
      const page2Response = { requests: [mockAccountStatements[1]], count: 2 };

      httpClient.get
        .mockReturnValueOnce(of(page1Response))
        .mockReturnValueOnce(of(page2Response));

      // Get first page
      service.getAllWithParams(page1Params).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.count).toBe(2);
        expect(result.requests[0].id).toBe(1);
      });

      // Get second page
      service.getAllWithParams(page2Params).subscribe((result) => {
        expect(result.requests.length).toBe(1);
        expect(result.count).toBe(2);
        expect(result.requests[0].id).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from getAllWithParams', (done) => {
      const errorResponse = new Error('Server Error');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      const params = new HttpParams().set('page', '1');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('Server Error');
          done();
        },
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params,
      });
    });

    it('should handle network timeout errors', (done) => {
      const timeoutError = new Error('Request timeout');
      httpClient.get.mockReturnValue(throwError(() => timeoutError));

      const params = new HttpParams().set('limit', '10');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Request timeout');
          done();
        },
      });
    });

    it('should handle HTTP 404 errors', (done) => {
      const notFoundError = { status: 404, message: 'Not Found' };
      httpClient.get.mockReturnValue(throwError(() => notFoundError));

      const params = new HttpParams().set('id', '999');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Not Found');
          done();
        },
      });
    });

    it('should handle HTTP 500 errors', (done) => {
      const serverError = { status: 500, message: 'Internal Server Error' };
      httpClient.get.mockReturnValue(throwError(() => serverError));

      const params = new HttpParams().set('status', 'invalid');

      service.getAllWithParams(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.message).toBe('Internal Server Error');
          done();
        },
      });
    });
  });

  describe('Edge Cases and Invalid Inputs', () => {
    it('should handle malformed response structure', () => {
      const malformedResponse = { data: mockAccountStatements } as any; // Missing 'requests' and 'count'
      httpClient.get.mockReturnValue(of(malformedResponse));

      const params = new HttpParams().set('page', '1');

      service.getAllWithParams(params).subscribe((result) => {
        expect(result).toEqual(malformedResponse);
        // Service should return whatever the API returns, validation is handled elsewhere
      });
    });

    it('should handle null response', () => {
      httpClient.get.mockReturnValue(of(null));

      const params = new HttpParams().set('page', '1');

      service.getAllWithParams(params).subscribe((result) => {
        expect(result).toBeNull();
      });
    });

    it('should handle empty response with correct structure', () => {
      const emptyResponse = { requests: [], count: 0 };
      httpClient.get.mockReturnValue(of(emptyResponse));

      const params = new HttpParams().set('filter', 'nonexistent');

      service.getAllWithParams(params).subscribe((result) => {
        expect(result.requests).toEqual([]);
        expect(result.count).toBe(0);
      });
    });

    it('should handle special characters in parameters', () => {
      const specialParams = new HttpParams()
        .set('search', 'тест + специальные символы & encoded%20text')
        .set('debtor_name', 'ООО "Рога и копыта"')
        .set('bank', 'Bank with spaces & symbols');

      const mockResponse = { requests: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(specialParams).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: specialParams,
      });
    });

    it('should handle very large parameter values', () => {
      const largeParams = new HttpParams()
        .set('limit', '999999')
        .set('offset', '999999999')
        .set('description', 'A'.repeat(1000)); // Very long string

      const mockResponse = { requests: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(largeParams).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle typical account statement filtering workflow', () => {
      // Search by bank detail and date range
      const searchParams = new HttpParams()
        .set('bank_detail_id', '1')
        .set('start_date', '2024-01-01')
        .set('end_date', '2024-01-31')
        .set('status', StatusEnum.OPEN);

      const filteredStatements = mockAccountStatements.filter(
        (stmt) => stmt.bank_detail_id === 1 && stmt.status === StatusEnum.OPEN,
      );

      const searchResponse = {
        requests: filteredStatements,
        count: filteredStatements.length,
      };

      httpClient.get.mockReturnValue(of(searchResponse));

      service.getAllWithParams(searchParams).subscribe((result) => {
        expect(result.requests.length).toBe(filteredStatements.length);
        expect(
          result.requests.every((stmt) => stmt.bank_detail_id === 1),
        ).toBeTruthy();
        expect(
          result.requests.every((stmt) => stmt.status === StatusEnum.OPEN),
        ).toBeTruthy();
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/accountstatements', {
        params: searchParams,
      });
    });

    it('should handle sorting and ordering parameters', () => {
      const sortParams = new HttpParams()
        .set('sort', 'created_at')
        .set('order', 'desc')
        .set('limit', '10');

      const sortedResponse = {
        requests: [...mockAccountStatements].sort(
          (a, b) => b.created_at.getTime() - a.created_at.getTime(),
        ),
        count: mockAccountStatements.length,
      };

      httpClient.get.mockReturnValue(of(sortedResponse));

      service.getAllWithParams(sortParams).subscribe((result) => {
        expect(result.requests).toEqual(sortedResponse.requests);
        expect(result.count).toBe(mockAccountStatements.length);
      });
    });

    it('should handle creator and doer filtering', () => {
      const userParams = new HttpParams()
        .set('creator_id', '1')
        .set('doer_id', '2');

      const userFilteredResponse = {
        requests: mockAccountStatements.filter(
          (stmt) => stmt.creator_id === 1 && stmt.doer_id === 2,
        ),
        count: mockAccountStatements.length,
      };

      httpClient.get.mockReturnValue(of(userFilteredResponse));

      service.getAllWithParams(userParams).subscribe((result) => {
        expect(
          result.requests.every((stmt) => stmt.creator_id === 1),
        ).toBeTruthy();
        expect(
          result.requests.every((stmt) => stmt.doer_id === 2),
        ).toBeTruthy();
      });
    });
  });
});
