import { HttpClient, HttpParams } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { DownloadFile } from './common.service';
import { CommonService } from './common.service';

// Test interface for generic type
interface TestItem {
  id: number;
  name: string;
  description?: string;
}

// Create a concrete service class for testing
class TestCommonService extends CommonService<TestItem> {
  constructor(http: HttpClient) {
    super(http);
    this.path = '/api/test';
  }
}

describe('CommonService', () => {
  let service: TestCommonService;
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: httpSpy },
        {
          provide: TestCommonService,
          useFactory: (http: HttpClient) => new TestCommonService(http),
          deps: [HttpClient],
        },
      ],
    }).compileComponents();

    service = TestBed.inject(TestCommonService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/test');
  });

  describe('GetAll', () => {
    it('should call GET with correct URL when no id provided', () => {
      const mockItems: TestItem[] = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      httpClient.get.mockReturnValue(of(mockItems));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockItems);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/tests');
    });

    it('should call GET with id when id is provided', () => {
      const mockItems: TestItem[] = [{ id: 1, name: 'Test 1' }];
      httpClient.get.mockReturnValue(of(mockItems));

      service.GetAll(1).subscribe((result) => {
        expect(result).toEqual(mockItems);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/tests/1');
    });

    it('should call GET without id when null is provided', () => {
      const mockItems: TestItem[] = [{ id: 1, name: 'Test 1' }];
      httpClient.get.mockReturnValue(of(mockItems));

      service.GetAll(null).subscribe((result) => {
        expect(result).toEqual(mockItems);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/tests');
    });
  });

  describe('get', () => {
    it('should call GET with correct URL and id', () => {
      const mockItem: TestItem = { id: 1, name: 'Test Item' };
      httpClient.get.mockReturnValue(of(mockItem));

      service.get(1).subscribe((result) => {
        expect(result).toEqual(mockItem);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/test/1');
    });
  });

  describe('add', () => {
    it('should call POST with correct URL and data', () => {
      const newItem: Partial<TestItem> = {
        name: 'New Item',
        description: 'Test description',
      };
      const createdItem: TestItem = { id: 1, ...newItem } as TestItem;
      httpClient.post.mockReturnValue(of(createdItem));

      service.add(newItem).subscribe((result) => {
        expect(result).toEqual(createdItem);
      });

      expect(httpClient.post).toHaveBeenCalledWith('/api/test', newItem);
    });
  });

  describe('update', () => {
    it('should call PUT with correct URL and data without id', () => {
      const updateItem: TestItem = {
        id: 1,
        name: 'Updated Item',
        description: 'Updated description',
      };
      const updatedItem: TestItem = updateItem as TestItem;
      httpClient.put.mockReturnValue(of(updatedItem));

      service.update(updateItem).subscribe((result) => {
        expect(result).toEqual(updatedItem);
      });

      expect(httpClient.put).toHaveBeenCalledWith('/api/test/1', {
        name: 'Updated Item',
        description: 'Updated description',
      });
    });
  });

  describe('delete', () => {
    it('should call DELETE with correct URL', () => {
      httpClient.delete.mockReturnValue(of(undefined));

      service.delete(1).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      expect(httpClient.delete).toHaveBeenCalledWith('/api/test/1');
    });
  });

  describe('download', () => {
    it('should download file by string filename with default params', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      httpClient.get.mockReturnValue(of(mockBlob));

      service.download('test-file.pdf').subscribe((result) => {
        expect(result).toEqual(mockBlob);
      });

      const callArgs = httpClient.get.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test/download/test-file.pdf');
      expect(callArgs[1]).toBeDefined();
      expect(callArgs[1]?.params).toBeInstanceOf(HttpParams);
    });

    it('should download file by string filename with custom params', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      const customParams = new HttpParams().set('version', '1.0');
      httpClient.get.mockReturnValue(of(mockBlob));

      service.download('test-file.pdf', customParams).subscribe((result) => {
        expect(result).toEqual(mockBlob);
      });

      const callArgs = httpClient.get.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test/download/test-file.pdf');
      expect(callArgs[1]).toBeDefined();
      expect(callArgs[1]?.params).toBe(customParams);
    });

    it('should replace forward slashes with pipes in filename', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      httpClient.get.mockReturnValue(of(mockBlob));

      service.download('folder/subfolder/test-file.pdf').subscribe();

      const callArgs = httpClient.get.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test/download/folder|subfolder|test-file.pdf');
      expect(callArgs[1]).toBeDefined();
    });

    it('should download file using DownloadFile object', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      const downloadFile: DownloadFile = {
        file: 'encoded-file-content',
        original_file_name: 'original-name.pdf',
      };
      httpClient.post.mockReturnValue(of(mockBlob));

      service.download(downloadFile).subscribe((result) => {
        expect(result).toEqual(mockBlob);
      });

      const callArgs = httpClient.post.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test/download');
      expect(callArgs[1]).toBe(downloadFile);
      expect(callArgs[2]).toBeDefined();
    });

    it('should handle empty DownloadFile object', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      const downloadFile: DownloadFile = {};
      httpClient.post.mockReturnValue(of(mockBlob));

      service.download(downloadFile).subscribe((result) => {
        expect(result).toEqual(mockBlob);
      });

      const callArgs = httpClient.post.mock.calls[0];
      expect(callArgs[0]).toBe('/api/test/download');
      expect(callArgs[1]).toBe(downloadFile);
      expect(callArgs[2]).toBeDefined();
    });

    it('should call correct method based on parameter type', () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      httpClient.get.mockReturnValue(of(mockBlob));
      httpClient.post.mockReturnValue(of(mockBlob));

      // Test string parameter calls GET
      service.download('test-file.pdf').subscribe();
      expect(httpClient.get).toHaveBeenCalled();
      expect(httpClient.post).not.toHaveBeenCalled();

      // Reset mocks
      httpClient.get.mockClear();
      httpClient.post.mockClear();

      // Test DownloadFile parameter calls POST
      service.download({ file: 'test' }).subscribe();
      expect(httpClient.post).toHaveBeenCalled();
      expect(httpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from GetAll', () => {
      const errorResponse = new Error('HTTP Error');
      httpClient.get.mockImplementation(() => {
        throw errorResponse;
      });

      expect(() => service.GetAll().subscribe()).toThrow();
    });

    it('should propagate HTTP errors from get', () => {
      const errorResponse = new Error('HTTP Error');
      httpClient.get.mockImplementation(() => {
        throw errorResponse;
      });

      expect(() => service.get(1).subscribe()).toThrow();
    });

    it('should propagate HTTP errors from add', () => {
      const errorResponse = new Error('HTTP Error');
      httpClient.post.mockImplementation(() => {
        throw errorResponse;
      });

      expect(() => service.add({ name: 'Test' }).subscribe()).toThrow();
    });

    it('should propagate HTTP errors from update', () => {
      const errorResponse = new Error('HTTP Error');
      httpClient.put.mockImplementation(() => {
        throw errorResponse;
      });

      expect(() =>
        service.update({ id: 1, name: 'Test' }).subscribe(),
      ).toThrow();
    });

    it('should propagate HTTP errors from delete', () => {
      const errorResponse = new Error('HTTP Error');
      httpClient.delete.mockImplementation(() => {
        throw errorResponse;
      });

      expect(() => service.delete(1).subscribe()).toThrow();
    });
  });
});
