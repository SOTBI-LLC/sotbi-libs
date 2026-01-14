import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Access } from '@models/access';
import { configureTestBed } from '@test-setup';
import { of } from 'rxjs';
import { AccessService } from './access.service';

describe('AccessService', () => {
  let service: AccessService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpy = jasmine.createSpyObj('HttpClient', [
      'get',
      'post',
      'patch',
    ]);

    await configureTestBed({
      providers: [{ provide: HttpClient, useValue: httpSpy }, AccessService],
    }).compileComponents();

    service = TestBed.inject(AccessService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/access');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(AccessService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
  });

  describe('GetAll (overridden method)', () => {
    it('should call GET with fixed URL without parameters', () => {
      const mockAccess: Access[] = [
        { id: 1, name: 'Read Access', mask: 1 },
        {
          id: 2,
          name: 'Write Access',
          mask: 2,
          description: 'Write permission',
        },
      ];
      httpClient.get.and.returnValue(of(mockAccess));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockAccess);
      });

      // Verify it calls the hardcoded URL, not the inherited path-based URL
      expect(httpClient.get).toHaveBeenCalledWith('/api/access');
      expect(httpClient.get).not.toHaveBeenCalledWith('/api/accesss');
    });

    it('should return Access array with proper typing', () => {
      const mockAccess: Access[] = [
        {
          id: 1,
          name: 'Admin Access',
          description: 'Full administrative access',
          mask: 255,
          action: 'admin',
        },
      ];
      httpClient.get.and.returnValue(of(mockAccess));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockAccess);
        expect(result[0].id).toBe(1);
        expect(result[0].name).toBe('Admin Access');
        expect(result[0].mask).toBe(255);
      });

      expect(httpClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAccess', () => {
    it('should call GET with correct URL, headers, and response type', () => {
      const mockAccessString = 'user:read,write;admin:all';
      httpClient.get.and.returnValue(of(mockAccessString));

      service.getAccess().subscribe((result) => {
        expect(result).toBe(mockAccessString);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/access/my',
        jasmine.objectContaining({
          headers: jasmine.any(HttpHeaders),
        })
      );
    });

    it('should set correct Content-Type header', () => {
      const mockAccessString = 'permissions:granted';
      httpClient.get.and.returnValue(of(mockAccessString));

      service.getAccess().subscribe();

      const callArgs = httpClient.get.calls.argsFor(0);
      const options = callArgs[1];
      const headers = options.headers as HttpHeaders;

      expect(headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    });

    it('should return string response', () => {
      const expectedResult = 'access_level:high;permissions:read,write,delete';
      httpClient.get.and.returnValue(of(expectedResult));

      service.getAccess().subscribe((result) => {
        expect(typeof result).toBe('string');
        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('getAllSrv', () => {
    it('should call GET with correct URL and return string[][]', () => {
      const mockServerAccess: string[][] = [
        ['server1', 'read', 'write'],
        ['server2', 'read'],
        ['server3', 'admin'],
      ];
      httpClient.get.and.returnValue(of(mockServerAccess));

      service.getAllSrv().subscribe((result) => {
        expect(result).toEqual(mockServerAccess);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/access/server');
    });

    it('should handle empty server access array', () => {
      const emptyResult: string[][] = [];
      httpClient.get.and.returnValue(of(emptyResult));

      service.getAllSrv().subscribe((result) => {
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should properly type the response as string[][]', () => {
      const mockData: string[][] = [['test', 'permissions']];
      httpClient.get.and.returnValue(of(mockData));

      service.getAllSrv().subscribe((result) => {
        expect(Array.isArray(result)).toBe(true);
        expect(Array.isArray(result[0])).toBe(true);
        expect(typeof result[0][0]).toBe('string');
      });
    });
  });

  describe('createSrv', () => {
    it('should call POST with correct URL and data', () => {
      const newServerAccess: string[] = ['new-server', 'read', 'write'];
      const mockResponse: string[][] = [
        ['existing-server', 'admin'],
        ['new-server', 'read', 'write'],
      ];
      httpClient.post.and.returnValue(of(mockResponse));

      service.createSrv(newServerAccess).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/access/server',
        newServerAccess
      );
    });

    it('should handle empty input array', () => {
      const emptyInput: string[] = [];
      const mockResponse: string[][] = [];
      httpClient.post.and.returnValue(of(mockResponse));

      service.createSrv(emptyInput).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/access/server',
        emptyInput
      );
    });

    it('should return updated server access list', () => {
      const newAccess: string[] = ['production-server', 'admin'];
      const expectedResponse: string[][] = [
        ['dev-server', 'read'],
        ['production-server', 'admin'],
      ];
      httpClient.post.and.returnValue(of(expectedResponse));

      service.createSrv(newAccess).subscribe((result) => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[1]).toEqual(['production-server', 'admin']);
      });
    });
  });

  describe('updateSrv', () => {
    it('should call PATCH with correct URL and update structure', () => {
      const updateData = {
        old: [
          ['server1', 'read'],
          ['server2', 'write'],
        ],
        new: [
          ['server1', 'read', 'write'],
          ['server2', 'admin'],
        ],
      };
      const mockResponse: string[][] = [
        ['server1', 'read', 'write'],
        ['server2', 'admin'],
      ];
      httpClient.patch.and.returnValue(of(mockResponse));

      service.updateSrv(updateData).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/access/server',
        updateData
      );
    });

    it('should handle complex permission updates', () => {
      const complexUpdate = {
        old: [
          ['prod-server', 'read'],
          ['dev-server', 'read', 'write'],
          ['test-server', 'read'],
        ],
        new: [
          ['prod-server', 'admin'],
          ['dev-server', 'read'],
          ['test-server', 'read', 'write', 'deploy'],
        ],
      };
      const mockResponse: string[][] = complexUpdate.new;
      httpClient.patch.and.returnValue(of(mockResponse));

      service.updateSrv(complexUpdate).subscribe((result) => {
        expect(result).toEqual(complexUpdate.new);
        expect(result.length).toBe(3);
      });

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/access/server',
        complexUpdate
      );
    });

    it('should validate update structure has both old and new properties', () => {
      const updateData = {
        old: [['server1', 'read']],
        new: [['server1', 'write']],
      };
      const mockResponse: string[][] = updateData.new;
      httpClient.patch.and.returnValue(of(mockResponse));

      service.updateSrv(updateData).subscribe();

      const callArgs = httpClient.patch.calls.argsFor(0);
      const sentData = callArgs[1];

      expect(sentData.old).toBeDefined();
      expect(sentData.new).toBeDefined();
      expect(Array.isArray(sentData.old)).toBe(true);
      expect(Array.isArray(sentData.new)).toBe(true);
    });

    it('should handle empty old and new arrays', () => {
      const emptyUpdate = {
        old: [],
        new: [],
      };
      const mockResponse: string[][] = [];
      httpClient.patch.and.returnValue(of(mockResponse));

      service.updateSrv(emptyUpdate).subscribe((result) => {
        expect(result).toEqual([]);
      });

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/access/server',
        emptyUpdate
      );
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from GetAll', () => {
      const errorResponse = new Error('Access Denied');
      httpClient.get.and.throwError(errorResponse);

      expect(() => service.GetAll().subscribe()).toThrow();
    });

    it('should propagate HTTP errors from getAccess', () => {
      const errorResponse = new Error('Unauthorized');
      httpClient.get.and.throwError(errorResponse);

      expect(() => service.getAccess().subscribe()).toThrow();
    });

    it('should propagate HTTP errors from getAllSrv', () => {
      const errorResponse = new Error('Server Error');
      httpClient.get.and.throwError(errorResponse);

      expect(() => service.getAllSrv().subscribe()).toThrow();
    });

    it('should propagate HTTP errors from createSrv', () => {
      const errorResponse = new Error('Bad Request');
      httpClient.post.and.throwError(errorResponse);

      expect(() => service.createSrv(['test']).subscribe()).toThrow();
    });

    it('should propagate HTTP errors from updateSrv', () => {
      const errorResponse = new Error('Forbidden');
      httpClient.patch.and.throwError(errorResponse);

      const updateData = { old: [], new: [] };
      expect(() => service.updateSrv(updateData).subscribe()).toThrow();
    });
  });

  describe('Service Integration', () => {
    it('should work with real-world access data structure', () => {
      const realWorldAccess: Access[] = [
        {
          id: 1,
          name: 'UserManagement',
          description: 'Manage users and permissions',
          mask: 15,
          action: 'users.*',
        },
        {
          id: 2,
          name: 'ReportAccess',
          mask: 4,
          action: 'reports.read',
        },
      ];
      httpClient.get.and.returnValue(of(realWorldAccess));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(realWorldAccess);
        expect(result.every((access) => typeof access.mask === 'number')).toBe(
          true
        );
        expect(result.some((access) => access.description !== undefined)).toBe(
          true
        );
      });
    });

    it('should handle server access workflow', () => {
      // Simulate a complete workflow: get → create → update
      const existingAccess: string[][] = [['server1', 'read']];
      const newAccess: string[] = ['server2', 'write'];
      const afterCreate: string[][] = [
        ['server1', 'read'],
        ['server2', 'write'],
      ];
      const updatePayload = {
        old: afterCreate,
        new: [
          ['server1', 'admin'],
          ['server2', 'read', 'write'],
        ],
      };

      // Mock the sequence of calls
      httpClient.get.and.returnValue(of(existingAccess));
      httpClient.post.and.returnValue(of(afterCreate));
      httpClient.patch.and.returnValue(of(updatePayload.new));

      // Test the workflow
      service.getAllSrv().subscribe((initial) => {
        expect(initial).toEqual(existingAccess);
      });

      service.createSrv(newAccess).subscribe((created) => {
        expect(created).toEqual(afterCreate);
      });

      service.updateSrv(updatePayload).subscribe((updated) => {
        expect(updated).toEqual(updatePayload.new);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/access/server');
      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/access/server',
        newAccess
      );
      expect(httpClient.patch).toHaveBeenCalledWith(
        '/api/access/server',
        updatePayload
      );
    });
  });
});
