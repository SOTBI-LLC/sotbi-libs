import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { Debtor, DebtorsList } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { DebtorService } from './debtor.service';

describe('DebtorService', () => {
  let service: DebtorService;
  let httpClient: jest.Mocked<HttpClient>;

  const mockDebtor: Debtor = {
    id: 1,
    name: 'Test Debtor LLC',
    full_name: 'Test Debtor Limited Liability Company',
    inn: '1234567890',
    kpp: '123456789',
    ogrn: '1234567890123',
    address: '123 Test Street, Test City',
    post_address: 'PO Box 123, Test City',
    arbitration_id: 'ARB123',
    case_no: 'CASE-001',
    decision_date: new Date('2024-01-15'),
    initiation_date: new Date('2024-01-01'),
    procedure_date: new Date('2024-02-01'),
    bankruptcy_manager_id: 1,
    project_id: 1,
    project: {
      id: 1,
      name: 'Test Project',
      created_at: new Date('2023-12-01'),
    },
    stage_id: 1,
    kind: false, // юр.лицо
    reportable: true,
    category_id: 1,
    procedure_id: 1,
    links: [],
    registry: 1000000,
    deposit: 500000,
    not_deposit: 300000,
    deposit_share: 50,
    not_deposit_share: 30,
    profit_cat: { id: 1, name: 'High' },
    profit_cat_id: 1,
    created_at: new Date('2024-01-01'),
  };

  const mockDebtorsList: DebtorsList[] = [
    {
      id: 1,
      name: 'Test Debtor LLC',
      debtor_created_at: new Date('2024-01-01'),
      full_name: 'Test Debtor Limited Liability Company',
      koordinator: 'John Coordinator',
      group1: 'Group A',
      group2: 'Group B',
      state: 'Active',
      inn: '1234567890',
      kpp: '123456789',
      ogrn: '1234567890123',
      address: '123 Test Street, Test City',
      post_address: 'PO Box 123, Test City',
      arbitration_name: 'Test Arbitration Court',
      case_no: 'CASE-001',
      decision_date: new Date('2024-01-15'),
      initiation_date: new Date('2024-01-01'),
      procedure_date: new Date('2024-02-01'),
      bankruptcy_name: 'Test Bankruptcy Manager',
      bankruptcy_manager_id: 1,
      sro: 'Test SRO',
      project_id: 1,
      project_name: 'Test Project',
      project_created_at: new Date('2023-12-01'),
      stage_name: 'Initial',
      kind: 'юр.лицо',
      category_name: 'Category A',
      procedure_name: 'Procedure A',
      registry: 1000000,
      deposit: 500000,
      not_deposit: 300000,
      deposit_share: 50,
      not_deposit_share: 30,
      reportable: 'да',
      profit_cat_name: 'High',
      links: [],
    },
    {
      id: 2,
      name: 'Another Debtor Inc',
      debtor_created_at: new Date('2024-01-02'),
      full_name: 'Another Debtor Incorporated',
      koordinator: 'Jane Coordinator',
      group1: 'Group C',
      group2: 'Group D',
      state: 'Inactive',
      inn: '0987654321',
      kpp: '987654321',
      ogrn: '3210987654321',
      address: '456 Another Street, Another City',
      post_address: 'PO Box 456, Another City',
      arbitration_name: 'Another Arbitration Court',
      case_no: 'CASE-002',
      decision_date: new Date('2024-01-20'),
      bankruptcy_name: 'Another Bankruptcy Manager',
      bankruptcy_manager_id: 2,
      sro: 'Another SRO',
      project_id: 2,
      project_name: 'Another Project',
      project_created_at: new Date('2023-11-01'),
      stage_name: 'Advanced',
      kind: 'физ.лицо',
      category_name: 'Category B',
      procedure_name: 'Procedure B',
      registry: 2000000,
      deposit: 800000,
      not_deposit: 600000,
      deposit_share: 40,
      not_deposit_share: 60,
      reportable: 'нет',
      profit_cat_name: 'Medium',
      links: [],
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

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        DebtorService,
      ],
    }).compileComponents();

    service = TestBed.inject(DebtorService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/debtors');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(DebtorService);
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
      const mockResponse = { debtors: mockDebtorsList, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(params).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.debtors).toEqual(mockDebtorsList);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors', { params });
    });

    it('should handle empty parameters', () => {
      const emptyParams = new HttpParams();
      const mockResponse = { debtors: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(emptyParams).subscribe((result) => {
        expect(result.debtors).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors', {
        params: emptyParams,
      });
    });

    it('should handle complex query parameters', () => {
      const complexParams = new HttpParams()
        .set('search', 'Test Company')
        .set('category', '1')
        .set('stage', '2')
        .set('sortBy', 'name')
        .set('sortOrder', 'asc');
      const mockResponse = { debtors: [mockDebtorsList[0]], count: 1 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(complexParams).subscribe((result) => {
        expect(result.count).toBe(1);
        expect(result.debtors.length).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors', {
        params: complexParams,
      });
    });
  });

  describe('getList', () => {
    it('should call GET with correct URL and return Debtor array', () => {
      const params = new HttpParams().set('filter', 'active');
      const mockDebtors: Debtor[] = [mockDebtor];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.getList(params).subscribe((result) => {
        expect(result).toEqual(mockDebtors);
        expect(result[0].id).toBe(1);
        expect(result[0].name).toBe('Test Debtor LLC');
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/list', {
        params,
      });
    });

    it('should handle empty result', () => {
      const params = new HttpParams().set('filter', 'nonexistent');
      const emptyResult: Debtor[] = [];
      httpClient.get.mockReturnValue(of(emptyResult));

      service.getList(params).subscribe((result) => {
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('getListWithBankDetail$', () => {
    it('should call GET with correct URL for bank details', () => {
      const mockDebtorsWithBank: Debtor[] = [
        {
          ...mockDebtor,
          bank_details: [
            {
              id: 1,
              name: 'Test Bank Detail',
              bank: 'Test Bank',
              bik: '044525225',
              bank_account: '40702810400000000001',
              corr_account: '30101810400000000225',
              city: 'Test City',
              location: 'Test Location',
              open_date: new Date('2024-01-01'),
              close_date: null,
              account_type: { id: 1, name: 'Current' },
              has_client_bank: true,
            },
          ],
        },
      ];
      httpClient.get.mockReturnValue(of(mockDebtorsWithBank));

      service.getListWithBankDetail$().subscribe((result) => {
        expect(result).toEqual(mockDebtorsWithBank);
        expect(result[0].bank_details).toBeDefined();
        expect(result[0].bank_details?.length).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/bank_details');
    });

    it('should handle debtors without bank details', () => {
      const mockDebtorsNoBankDetails: Debtor[] = [
        { ...mockDebtor, bank_details: [] },
      ];
      httpClient.get.mockReturnValue(of(mockDebtorsNoBankDetails));

      service.getListWithBankDetail$().subscribe((result) => {
        expect(result[0].bank_details).toEqual([]);
      });
    });
  });

  describe('getDebtorsByBankruptcy', () => {
    it('should call GET with correct URL and bankruptcy ID', () => {
      const bankruptcyId = 123;
      const mockDebtors: Debtor[] = [mockDebtor];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.getDebtorsByBankruptcy(bankruptcyId).subscribe((result) => {
        expect(result).toEqual(mockDebtors);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/debtors/bankruptcy/123',
      );
    });

    it('should handle zero bankruptcy ID', () => {
      const mockDebtors: Debtor[] = [];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.getDebtorsByBankruptcy(0).subscribe((result) => {
        expect(result).toEqual([]);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/bankruptcy/0');
    });

    it('should handle negative bankruptcy ID', () => {
      const mockDebtors: Debtor[] = [];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.getDebtorsByBankruptcy(-1).subscribe((result) => {
        expect(result).toEqual([]);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/bankruptcy/-1');
    });
  });

  describe('getListAsProject', () => {
    it('should call getList with asproject=true parameter', () => {
      const mockDebtors: Debtor[] = [mockDebtor];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.getListAsProject().subscribe((result) => {
        expect(result).toEqual(mockDebtors);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/list', {
        params: new HttpParams().set('asproject', 'true'),
      });
    });

    it('should return project-formatted debtors', () => {
      const projectDebtors: Debtor[] = [
        {
          ...mockDebtor,
          project: {
            id: 1,
            name: 'Main Project',
            created_at: new Date('2023-01-01'),
          },
        },
      ];
      httpClient.get.mockReturnValue(of(projectDebtors));

      service.getListAsProject().subscribe((result) => {
        expect(result[0].project).toBeDefined();
        expect(result[0].project?.name).toBe('Main Project');
      });
    });
  });

  describe('getDebtorsShort', () => {
    it('should call getList with short=true parameter', () => {
      const mockShortDebtors: Debtor[] = [
        {
          id: 1,
          name: 'Short Debtor',
          full_name: 'Short Debtor Full Name',
          inn: '1234567890',
          kpp: '123456789',
          ogrn: '1234567890123',
          address: 'Short Address',
          post_address: 'Short Post Address',
          arbitration_id: 'ARB123',
          case_no: 'CASE-001',
          decision_date: new Date('2024-01-15'),
          bankruptcy_manager_id: 1,
          project_id: 1,
          project: { id: 1, name: 'Short Project' },
          links: [],
          profit_cat: { id: 1, name: 'Short' },
        },
      ];
      httpClient.get.mockReturnValue(of(mockShortDebtors));

      service.getDebtorsShort().subscribe((result) => {
        expect(result).toEqual(mockShortDebtors);
        expect(result[0].name).toBe('Short Debtor');
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/list', {
        params: new HttpParams().set('short', 'true'),
      });
    });
  });

  describe('restore', () => {
    it('should call PATCH with correct URL and empty body', () => {
      const restoredDebtor: Debtor = { ...mockDebtor, id: 123 };
      httpClient.patch.mockReturnValue(of(restoredDebtor));

      service.restore(123).subscribe((result) => {
        expect(result).toEqual(restoredDebtor);
        expect(result.id).toBe(123);
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/debtors/123', {});
    });

    it('should handle restore with zero ID', () => {
      const mockResult: Debtor = { ...mockDebtor, id: 0 };
      httpClient.patch.mockReturnValue(of(mockResult));

      service.restore(0).subscribe((result) => {
        expect(result.id).toBe(0);
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/debtors/0', {});
    });
  });

  describe('checkInn', () => {
    it('should call GET with correct URL and INN parameter', () => {
      const inn = '1234567890';
      const mockResponse: number[] = [1, 2, 3];
      httpClient.get.mockReturnValue(of(mockResponse));

      service.checkInn(inn).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(Array.isArray(result)).toBe(true);
        expect(result.every((id) => typeof id === 'number')).toBe(true);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/debtors/inn/1234567890',
      );
    });

    it('should handle empty INN check result', () => {
      const inn = '0000000000';
      const emptyResult: number[] = [];
      httpClient.get.mockReturnValue(of(emptyResult));

      service.checkInn(inn).subscribe((result) => {
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/debtors/inn/0000000000',
      );
    });

    it('should handle INN with existing conflicts', () => {
      const inn = '7777777777';
      const conflictIds: number[] = [100, 200, 300];
      httpClient.get.mockReturnValue(of(conflictIds));

      service.checkInn(inn).subscribe((result) => {
        expect(result).toEqual(conflictIds);
        expect(result.length).toBe(3);
      });
    });

    it('should handle special characters in INN', () => {
      const specialInn = '123-456-789';
      const mockResponse: number[] = [];
      httpClient.get.mockReturnValue(of(mockResponse));

      service.checkInn(specialInn).subscribe((result) => {
        expect(result).toEqual([]);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/debtors/inn/123-456-789',
      );
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
          expect(error.message).toBe('Server Error');
          done();
        },
      });
    });

    it('should propagate HTTP errors from getList', (done) => {
      const errorResponse = new Error('Not Found');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      const params = new HttpParams();
      service.getList(params).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Not Found');
          done();
        },
      });
    });

    it('should propagate HTTP errors from getListWithBankDetail$', (done) => {
      const errorResponse = new Error('Access Denied');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.getListWithBankDetail$().subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Access Denied');
          done();
        },
      });
    });

    it('should propagate HTTP errors from getDebtorsByBankruptcy', (done) => {
      const errorResponse = new Error('Bankruptcy not found');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.getDebtorsByBankruptcy(999).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Bankruptcy not found');
          done();
        },
      });
    });

    it('should propagate HTTP errors from restore', (done) => {
      const errorResponse = new Error('Cannot restore');
      httpClient.patch.mockReturnValue(throwError(() => errorResponse));

      service.restore(123).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Cannot restore');
          done();
        },
      });
    });

    it('should propagate HTTP errors from checkInn', (done) => {
      const errorResponse = new Error('INN validation failed');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.checkInn('1234567890').subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('INN validation failed');
          done();
        },
      });
    });
  });

  describe('CommonService Integration', () => {
    it('should inherit and use GetAll method correctly', () => {
      const mockDebtors: Debtor[] = [mockDebtor];
      httpClient.get.mockReturnValue(of(mockDebtors));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockDebtors);
      });

      // CommonService GetAll calls {path}s which would be /api/debtorss
      expect(httpClient.get).toHaveBeenCalledWith('/api/debtorss');
    });

    it('should inherit and use get method correctly', () => {
      httpClient.get.mockReturnValue(of(mockDebtor));

      service.get(1).subscribe((result) => {
        expect(result).toEqual(mockDebtor);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/1');
    });

    it('should inherit and use add method correctly', () => {
      const newDebtor: Partial<Debtor> = {
        name: 'New Debtor',
        full_name: 'New Debtor Full Name',
        inn: '9999999999',
        kpp: '999999999',
        ogrn: '9999999999999',
        address: 'New Address',
        post_address: 'New Post Address',
        arbitration_id: 'ARB999',
        case_no: 'CASE-999',
        decision_date: new Date('2024-03-01'),
        bankruptcy_manager_id: 99,
        project_id: 99,
        project: { id: 99, name: 'New Project' },
        links: [],
        profit_cat: { id: 99, name: 'New' },
      };
      const createdDebtor: Debtor = { ...newDebtor, id: 999 } as Debtor;
      httpClient.post.mockReturnValue(of(createdDebtor));

      service.add(newDebtor).subscribe((result) => {
        expect(result).toEqual(createdDebtor);
        expect(result.id).toBe(999);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/api/debtors', newDebtor);
    });

    it('should inherit and use update method correctly', () => {
      const updatedDebtor: Debtor = {
        id: 1,
        name: 'Updated Debtor Name',
        full_name: 'Updated Full Name',
        inn: '',
        kpp: '',
        ogrn: '',
        address: '',
        post_address: '',
        arbitration_id: '',
        case_no: '',
        bankruptcy_manager_id: 0,
        project_id: 0,
      };
      const responseDebtor: Debtor = { ...mockDebtor, ...updatedDebtor };
      httpClient.put.mockReturnValue(of(responseDebtor));

      service.update(updatedDebtor).subscribe((result) => {
        expect(result.name).toBe('Updated Debtor Name');
        expect(result.full_name).toBe('Updated Full Name');
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/debtors/1',
        expect.any(Object),
      );
    });

    it('should inherit and use delete method correctly', () => {
      httpClient.delete.mockReturnValue(of(undefined));

      service.delete(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      expect(httpClient.delete).toHaveBeenCalledWith('/api/debtors/1');
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should handle complete debtor management workflow', () => {
      // Simulate: search → get details → update → restore flow
      const searchParams = new HttpParams().set('search', 'Test Company');
      const searchResponse = { debtors: mockDebtorsList, count: 2 };
      const debtorDetails = mockDebtor;
      const updatedDebtor = { ...mockDebtor, name: 'Updated Company' };
      const restoredDebtor = { ...updatedDebtor, id: 1 };

      httpClient.get
        .mockReturnValueOnce(of(searchResponse))
        .mockReturnValueOnce(of(debtorDetails));
      httpClient.put.mockReturnValue(of(updatedDebtor));
      httpClient.patch.mockReturnValue(of(restoredDebtor));

      // Search for debtors
      service.getAllWithParams(searchParams).subscribe((searchResult) => {
        expect(searchResult.count).toBe(2);
      });

      // Get specific debtor details
      service.get(1).subscribe((details) => {
        expect(details.id).toBe(1);
      });

      // Update debtor
      service
        .update({ id: 1, name: 'Updated Company' })
        .subscribe((updated) => {
          expect(updated.name).toBe('Updated Company');
        });

      // Restore debtor
      service.restore(1).subscribe((restored) => {
        expect(restored.id).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.put).toHaveBeenCalledTimes(1);
      expect(httpClient.patch).toHaveBeenCalledTimes(1);
    });

    it('should handle bankruptcy-specific workflow', () => {
      const bankruptcyId = 42;
      const bankruptcyDebtors: Debtor[] = [
        { ...mockDebtor, bankruptcy_manager_id: bankruptcyId },
      ];
      const innCheckResult: number[] = [1, 2];

      httpClient.get
        .mockReturnValueOnce(of(bankruptcyDebtors))
        .mockReturnValueOnce(of(innCheckResult));

      // Get debtors by bankruptcy
      service.getDebtorsByBankruptcy(bankruptcyId).subscribe((debtors) => {
        expect(debtors.length).toBe(1);
        expect(debtors[0].bankruptcy_manager_id).toBe(bankruptcyId);
      });

      // Check INN conflicts
      service.checkInn('1234567890').subscribe((conflicts) => {
        expect(conflicts).toEqual([1, 2]);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/bankruptcy/42');
      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/debtors/inn/1234567890',
      );
    });

    it('should handle project and reporting workflow', () => {
      const projectDebtors: Debtor[] = [
        {
          ...mockDebtor,
          reportable: true,
          project: { id: 1, name: 'Project Alpha' },
        },
      ];
      const shortDebtors: Debtor[] = [{ ...mockDebtor, name: 'Short Name' }];
      const bankDetailDebtors: Debtor[] = [
        {
          ...mockDebtor,
          bank_details: [
            {
              id: 1,
              name: 'Main Bank Detail',
              bank: 'Main Bank',
              bik: '044525225',
              bank_account: '40702810400000000001',
              corr_account: '30101810400000000225',
              city: 'Main City',
              location: 'Main Location',
              open_date: new Date('2024-01-01'),
              close_date: null,
              account_type: { id: 1, name: 'Current' },
              has_client_bank: true,
            },
          ],
        },
      ];

      httpClient.get
        .mockReturnValueOnce(of(projectDebtors))
        .mockReturnValueOnce(of(shortDebtors))
        .mockReturnValueOnce(of(bankDetailDebtors));

      // Get debtors as projects
      service.getListAsProject().subscribe((projects) => {
        expect(projects[0].reportable).toBe(true);
        expect(projects[0].project?.name).toBe('Project Alpha');
      });

      // Get short debtor list
      service.getDebtorsShort().subscribe((short) => {
        expect(short[0].name).toBe('Short Name');
      });

      // Get debtors with bank details
      service.getListWithBankDetail$().subscribe((withBank) => {
        expect(withBank[0].bank_details?.length).toBe(1);
        expect(withBank[0].bank_details?.[0].bank).toBe('Main Bank');
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/list', {
        params: new HttpParams().set('asproject', 'true'),
      });
      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/list', {
        params: new HttpParams().set('short', 'true'),
      });
      expect(httpClient.get).toHaveBeenCalledWith('/api/debtors/bank_details');
    });
  });
});
