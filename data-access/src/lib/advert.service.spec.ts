import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { Advert, Progress, User } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { AdvertService } from './advert.service';

describe('AdvertService', () => {
  let service: AdvertService;
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

  const mockProgress: Progress = {
    value: 75,
    status: [1, 2, 3],
    id: 1,
  };

  const mockAdvert: Advert = {
    id: 1,
    week: 5,
    bidding: {
      id: 1,
      name: 'Test Bidding',
      description: 'Test bidding description',
      debtorId: 1,
      initiatorId: 1,
    },
    biddingId: 1,
    debtor: {
      id: 1,
      name: 'Test Debtor LLC',
      inn: '1234567890',
      kpp: '123456789',
      address: '123 Test St',
      ogrn: '1234567890123',
    } as any,
    debtorId: 1,
    trading_code: {
      id: 1,
      name: 'TC001',
      description: 'Test Trading Code',
    } as any,
    trading_code_id: 1,
    advertId: 1,
    advert: {
      id: 1,
      name: 'Test Advert Type',
    } as any,
    advertOther: 'Other advert info',
    organiser: {
      id: 1,
      name: 'Test Organizer',
    } as any,
    organiserId: 1,
    responsible: {
      id: 1,
      name: 'Test Responsible',
    } as any,
    responsibleId: 1,
    project: {
      id: 1,
      name: 'Test Project',
    } as any,
    projectId: 1,
    lawyerId: 1,
    lawyer: mockUser,
    taskLists: [],
    attachments: [],
    comment: 'Test comment',
    progress: mockProgress,
    requestCount: 5,
    lotsCount: 3,
    creator: mockUser,
    created_at: new Date('2024-01-01'),
  };

  const mockAdverts: Advert[] = [
    mockAdvert,
    {
      ...mockAdvert,
      id: 2,
      week: 6,
      comment: 'Second advert comment',
      requestCount: 2,
      lotsCount: 1,
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
      providers: [{ provide: HttpClient, useValue: httpSpy }, AdvertService],
    }).compileComponents();

    service = TestBed.inject(AdvertService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/adverts');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(AdvertService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.GetAll).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
    expect(typeof service.download).toBe('function');
  });

  describe('getAllWithParams', () => {
    it('should fetch adverts for specific week and year (success path)', () => {
      const week = 5;
      const year = 2024;
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(week, year).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.adverts).toEqual(mockAdverts);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=5.2024');
    });

    it('should fetch old adverts when week is 0 or negative', () => {
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(0, 2024).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.adverts).toEqual(mockAdverts);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/old');
    });

    it('should fetch old adverts when week is negative', () => {
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(-1, 2024).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/old');
    });

    it('should handle current week and year', () => {
      const currentWeek = 25;
      const currentYear = 2024;
      const mockResponse = { adverts: [mockAdvert], count: 1 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(currentWeek, currentYear).subscribe((result) => {
        expect(result.count).toBe(1);
        expect(result.adverts.length).toBe(1);
        expect(result.adverts[0]).toEqual(mockAdvert);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=25.2024');
    });

    it('should handle future week and year', () => {
      const futureWeek = 52;
      const futureYear = 2025;
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(futureWeek, futureYear).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=52.2025');
    });

    it('should return observable with adverts', () => {
      const week = 10;
      const year = 2024;
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      const result = service.getAllWithParams(week, year);

      expect(result).toBeDefined();
      result.subscribe((response) => {
        expect(Array.isArray(response.adverts)).toBeTruthy();
        expect(typeof response.count).toBe('number');
        expect(response.adverts.length).toBeGreaterThan(0);
        expect(response.adverts[0].id).toBeDefined();
        expect(response.adverts[0].week).toBeDefined();
      });
    });
  });

  describe('getOldCount', () => {
    it('should fetch count of old adverts (success path)', () => {
      const mockCount = 15;
      httpClient.get.mockReturnValue(of(mockCount));

      service.getOldCount().subscribe((result) => {
        expect(result).toBe(mockCount);
        expect(typeof result).toBe('number');
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/old/count');
    });

    it('should handle zero count', () => {
      const mockCount = 0;
      httpClient.get.mockReturnValue(of(mockCount));

      service.getOldCount().subscribe((result) => {
        expect(result).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/old/count');
    });

    it('should return observable with number', () => {
      const mockCount = 42;
      httpClient.get.mockReturnValue(of(mockCount));

      const result = service.getOldCount();

      expect(result).toBeDefined();
      result.subscribe((count) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('search', () => {
    it('should search adverts by phrase with default page (success path)', () => {
      const phrase = 'test search';
      const mockResponse = { adverts: [mockAdvert], count: 1 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        expect(result.adverts).toEqual([mockAdvert]);
        expect(result.count).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=test search&page=0',
      );
    });

    it('should search adverts by phrase with specific page', () => {
      const phrase = 'bidding';
      const page = 2;
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase, page).subscribe((result) => {
        expect(result.adverts).toEqual(mockAdverts);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=bidding&page=2',
      );
    });

    it('should handle empty search phrase', () => {
      const phrase = '';
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase).subscribe((result) => {
        expect(result.adverts).toEqual(mockAdverts);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=&page=0',
      );
    });

    it('should handle search phrase with special characters', () => {
      const phrase = 'search with spaces & symbols';
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase, 1).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=search with spaces & symbols&page=1',
      );
    });

    it('should handle no search results', () => {
      const phrase = 'nonexistent';
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase, 0).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=nonexistent&page=0',
      );
    });

    it('should return observable with search results', () => {
      const phrase = 'test';
      const mockResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(mockResponse));

      const result = service.search(phrase, 1);

      expect(result).toBeDefined();
      result.subscribe((response) => {
        expect(Array.isArray(response.adverts)).toBeTruthy();
        expect(typeof response.count).toBe('number');
      });
    });
  });

  describe('getProgress', () => {
    it('should fetch progress for specific advert (success path)', () => {
      const advertId = 1;
      httpClient.get.mockReturnValue(of(mockProgress));

      service.getProgress(advertId).subscribe((result) => {
        expect(result).toEqual(mockProgress);
        expect(result.value).toBe(75);
        expect(result.status).toEqual([1, 2, 3]);
        expect(result.id).toBe(1);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/1/progress');
    });

    it('should handle progress with zero value', () => {
      const advertId = 2;
      const zeroProgress: Progress = { value: 0, status: [], id: 2 };
      httpClient.get.mockReturnValue(of(zeroProgress));

      service.getProgress(advertId).subscribe((result) => {
        expect(result.value).toBe(0);
        expect(result.status).toEqual([]);
        expect(result.id).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/2/progress');
    });

    it('should handle progress with full completion', () => {
      const advertId = 3;
      const fullProgress: Progress = {
        value: 100,
        status: [1, 2, 3, 4, 5],
        id: 3,
      };
      httpClient.get.mockReturnValue(of(fullProgress));

      service.getProgress(advertId).subscribe((result) => {
        expect(result.value).toBe(100);
        expect(result.status.length).toBe(5);
        expect(result.id).toBe(3);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/3/progress');
    });

    it('should return observable with progress', () => {
      const advertId = 1;
      httpClient.get.mockReturnValue(of(mockProgress));

      const result = service.getProgress(advertId);

      expect(result).toBeDefined();
      result.subscribe((progress) => {
        expect(typeof progress.value).toBe('number');
        expect(Array.isArray(progress.status)).toBeTruthy();
        expect(progress.value).toBeGreaterThanOrEqual(0);
        expect(progress.value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('restore', () => {
    it('should restore advert by ID (success path)', () => {
      const advertId = 1;
      const restoredAdvert: Advert = { ...mockAdvert, id: advertId };
      httpClient.patch.mockReturnValue(of(restoredAdvert));

      service.restore(advertId).subscribe((result) => {
        expect(result).toEqual(restoredAdvert);
        expect(result.id).toBe(advertId);
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/adverts/1', null);
    });

    it('should restore different advert', () => {
      const advertId = 5;
      const restoredAdvert: Advert = {
        ...mockAdvert,
        id: advertId,
        comment: 'Restored advert',
      };
      httpClient.patch.mockReturnValue(of(restoredAdvert));

      service.restore(advertId).subscribe((result) => {
        expect(result.id).toBe(advertId);
        expect(result.comment).toBe('Restored advert');
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/adverts/5', null);
    });

    it('should return observable with restored advert', () => {
      const advertId = 1;
      httpClient.patch.mockReturnValue(of(mockAdvert));

      const result = service.restore(advertId);

      expect(result).toBeDefined();
      result.subscribe((advert) => {
        expect(typeof advert.id).toBe('number');
        expect(advert.id).toBeGreaterThan(0);
        expect(advert.week).toBeDefined();
        expect(advert.creator).toBeDefined();
      });
    });
  });

  describe('Inherited CommonService methods', () => {
    it('should call GetAll with correct URL', () => {
      httpClient.get.mockReturnValue(of(mockAdverts));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockAdverts);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/advertss');
    });

    it('should call GetAll with ID parameter', () => {
      const projectId = 1;
      const filteredAdverts = mockAdverts.filter(
        (advert) => advert.projectId === projectId,
      );
      httpClient.get.mockReturnValue(of(filteredAdverts));

      service.GetAll(projectId).subscribe((result) => {
        expect(result).toEqual(filteredAdverts);
      });

      expect(httpClient.get).toHaveBeenCalledWith(`/api/advertss/${projectId}`);
    });

    it('should call get with correct URL', () => {
      const advertId = 1;
      httpClient.get.mockReturnValue(of(mockAdvert));

      service.get(advertId).subscribe((result) => {
        expect(result).toEqual(mockAdvert);
      });

      expect(httpClient.get).toHaveBeenCalledWith(`/api/adverts/${advertId}`);
    });

    it('should call add with correct URL and data', () => {
      const newAdvert: Partial<Advert> = {
        week: 10,
        comment: 'New advert',
        biddingId: 1,
        debtorId: 1,
        projectId: 1,
      };
      httpClient.post.mockReturnValue(of(mockAdvert));

      service.add(newAdvert).subscribe((result) => {
        expect(result).toEqual(mockAdvert);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/api/adverts', newAdvert);
    });

    it('should call update with correct URL and data', () => {
      const updatedAdvert: Partial<Advert> = {
        comment: 'Updated comment',
      };
      const expectedResult = { ...mockAdvert, comment: 'Updated comment' };
      httpClient.put.mockReturnValue(of(expectedResult));

      service.update({ id: 1, ...updatedAdvert }).subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

      expect(httpClient.put).toHaveBeenCalledWith('/api/adverts/1', {
        comment: 'Updated comment',
      });
    });

    it('should call delete with correct URL', () => {
      const advertId = 1;
      httpClient.delete.mockReturnValue(of(undefined));

      service.delete(advertId).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        `/api/adverts/${advertId}`,
      );
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from getAllWithParams', (done) => {
      const errorResponse = new Error('Server Error');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.getAllWithParams(5, 2024).subscribe({
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

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=5.2024');
    });

    it('should propagate HTTP errors from getOldCount', (done) => {
      const errorResponse = new Error('Count fetch failed');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.getOldCount().subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Count fetch failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from search', (done) => {
      const errorResponse = new Error('Search failed');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.search('test', 0).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Search failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from getProgress', (done) => {
      const errorResponse = new Error('Progress fetch failed');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.getProgress(1).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Progress fetch failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from restore', (done) => {
      const errorResponse = new Error('Restore failed');
      httpClient.patch.mockReturnValue(throwError(() => errorResponse));

      service.restore(1).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Restore failed');
          done();
        },
      });
    });

    it('should handle HTTP 404 errors', (done) => {
      const notFoundError = { status: 404, message: 'Not Found' };
      httpClient.get.mockReturnValue(throwError(() => notFoundError));

      service.getProgress(999).subscribe({
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
      httpClient.patch.mockReturnValue(throwError(() => serverError));

      service.restore(1).subscribe({
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
    it('should handle very large week numbers', () => {
      const largeWeek = 9999;
      const year = 2024;
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(largeWeek, year).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?week=9999.2024',
      );
    });

    it('should handle very old years', () => {
      const week = 1;
      const oldYear = 1900;
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.getAllWithParams(week, oldYear).subscribe((result) => {
        expect(result.adverts).toEqual([]);
        expect(result.count).toBe(0);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=1.1900');
    });

    it('should handle search with very long phrase', () => {
      const longPhrase = 'a'.repeat(1000);
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(longPhrase, 0).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        `/api/adverts?search=${longPhrase}&page=0`,
      );
    });

    it('should handle search with negative page', () => {
      const phrase = 'test';
      const negativePage = -1;
      const mockResponse = { adverts: [], count: 0 };
      httpClient.get.mockReturnValue(of(mockResponse));

      service.search(phrase, negativePage).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=test&page=-1',
      );
    });

    it('should handle getProgress with negative ID', () => {
      const negativeId = -1;
      const mockProgress: Progress = { value: 0, status: [], id: negativeId };
      httpClient.get.mockReturnValue(of(mockProgress));

      service.getProgress(negativeId).subscribe((result) => {
        expect(result.id).toBe(negativeId);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/-1/progress');
    });

    it('should handle restore with zero ID', () => {
      const zeroId = 0;
      const mockAdvertWithZeroId: Advert = { ...mockAdvert, id: zeroId };
      httpClient.patch.mockReturnValue(of(mockAdvertWithZeroId));

      service.restore(zeroId).subscribe((result) => {
        expect(result.id).toBe(zeroId);
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/adverts/0', null);
    });

    it('should handle malformed response from getAllWithParams', () => {
      const malformedResponse = { data: mockAdverts } as any; // Missing 'adverts' and 'count'
      httpClient.get.mockReturnValue(of(malformedResponse));

      service.getAllWithParams(1, 2024).subscribe((result) => {
        expect(result).toEqual(malformedResponse);
        // Service should return whatever the API returns, validation is handled elsewhere
      });
    });

    it('should handle null response from getOldCount', () => {
      httpClient.get.mockReturnValue(of(null));

      service.getOldCount().subscribe((result) => {
        expect(result).toBeNull();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle typical advert management workflow', () => {
      // Search for adverts
      const searchResponse = { adverts: [mockAdvert], count: 1 };
      httpClient.get.mockReturnValue(of(searchResponse));

      service.search('test project').subscribe((searchResult) => {
        expect(searchResult.adverts.length).toBe(1);
      });

      // Get progress for found advert
      httpClient.get.mockReturnValue(of(mockProgress));

      service.getProgress(1).subscribe((progress) => {
        expect(progress.value).toBe(75);
      });

      // Update the advert
      const updatedAdvert = { ...mockAdvert, comment: 'Updated via workflow' };
      httpClient.put.mockReturnValue(of(updatedAdvert));

      service
        .update({ id: 1, comment: 'Updated via workflow' })
        .subscribe((updated) => {
          expect(updated.comment).toBe('Updated via workflow');
        });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.put).toHaveBeenCalledTimes(1);
    });

    it('should handle weekly advert filtering scenario', () => {
      // Get current week adverts
      const currentWeekResponse = { adverts: [mockAdvert], count: 1 };
      httpClient.get.mockReturnValue(of(currentWeekResponse));

      service.getAllWithParams(5, 2024).subscribe((result) => {
        expect(
          result.adverts.every((advert) => advert.week === 5),
        ).toBeTruthy();
      });

      // Get old adverts
      const oldAdvertsResponse = { adverts: mockAdverts, count: 2 };
      httpClient.get.mockReturnValue(of(oldAdvertsResponse));

      service.getAllWithParams(0, 2024).subscribe((result) => {
        expect(result.adverts).toEqual(mockAdverts);
      });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts?week=5.2024');
      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/old');
    });

    it('should handle pagination workflow', () => {
      const phrase = 'search term';

      // First page
      const page1Response = { adverts: [mockAdverts[0]], count: 2 };
      httpClient.get.mockReturnValue(of(page1Response));

      service.search(phrase, 0).subscribe((result) => {
        expect(result.adverts.length).toBe(1);
        expect(result.count).toBe(2);
      });

      // Second page
      const page2Response = { adverts: [mockAdverts[1]], count: 2 };
      httpClient.get.mockReturnValue(of(page2Response));

      service.search(phrase, 1).subscribe((result) => {
        expect(result.adverts.length).toBe(1);
        expect(result.count).toBe(2);
      });

      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=search term&page=0',
      );
      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/adverts?search=search term&page=1',
      );
    });

    it('should handle restore and progress workflow', () => {
      // Restore an advert
      const restoredAdvert = {
        ...mockAdvert,
        comment: 'Restored successfully',
      };
      httpClient.patch.mockReturnValue(of(restoredAdvert));

      service.restore(1).subscribe((restored) => {
        expect(restored.comment).toBe('Restored successfully');
      });

      // Check progress after restore
      const updatedProgress: Progress = {
        value: 100,
        status: [1, 2, 3, 4],
        id: 1,
      };
      httpClient.get.mockReturnValue(of(updatedProgress));

      service.getProgress(1).subscribe((progress) => {
        expect(progress.value).toBe(100);
        expect(progress.status.length).toBe(4);
      });

      expect(httpClient.patch).toHaveBeenCalledWith('/api/adverts/1', null);
      expect(httpClient.get).toHaveBeenCalledWith('/api/adverts/1/progress');
    });
  });
});
