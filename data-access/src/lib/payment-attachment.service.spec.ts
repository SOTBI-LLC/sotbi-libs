import { HttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { UploadResult, User } from '@sotbi/models';
import { PaymentAttachment, PaymentAttachmentType } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { PaymentAttachmentService } from './payment-attachment.service';

describe('PaymentAttachmentService', () => {
  let service: PaymentAttachmentService;
  let httpClient: jest.Mocked<HttpClient>;

  const mockUser: User = {
    id: 1,
    uuid: new Uint16Array([1, 2, 3, 4]),
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

  const mockPaymentAttachment: PaymentAttachment = {
    id: 1,
    type: PaymentAttachmentType.REQUEST,
    payment_request_id: 1,
    creator_id: 1,
    creator: mockUser,
    original_file_name: 'test-document.pdf',
    file: 'uploads/payment-attachments/abc123-test-document.pdf',
    link_name: 'Payment Request Document',
  };

  const mockPaymentAttachments: PaymentAttachment[] = [
    mockPaymentAttachment,
    {
      id: 2,
      type: PaymentAttachmentType.ORDERS,
      payment_request_id: 1,
      creator_id: 1,
      creator: mockUser,
      original_file_name: 'payment-order.pdf',
      file: 'uploads/payment-attachments/def456-payment-order.pdf',
      link_name: 'Payment Order',
    },
    {
      id: 3,
      type: PaymentAttachmentType.WRITINGOUT,
      payment_request_id: 2,
      creator_id: 1,
      creator: mockUser,
      original_file_name: 'bank-statement.xlsx',
      file: 'uploads/payment-attachments/ghi789-bank-statement.xlsx',
      link_name: 'Bank Statement',
    },
  ];

  const mockUploadResults: UploadResult[] = [
    {
      original_file_name: 'document1.pdf',
      file: 'uploads/payment-attachments/xyz123-document1.pdf',
    },
    {
      original_file_name: 'document2.docx',
      file: 'uploads/payment-attachments/xyz124-document2.docx',
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
        PaymentAttachmentService,
      ],
    }).compileComponents();

    service = TestBed.inject(PaymentAttachmentService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct path set', () => {
    expect(service.path).toBe('/api/payment-attachment');
  });

  it('should extend CommonService', () => {
    expect(service).toBeInstanceOf(PaymentAttachmentService);
    // Verify it has inherited methods from CommonService
    expect(typeof service.GetAll).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.add).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
    expect(typeof service.download).toBe('function');
  });

  describe('Inherited CommonService methods', () => {
    it('should call GetAll with correct URL', () => {
      httpClient.get.mockReturnValue(of(mockPaymentAttachments));

      service.GetAll().subscribe((result) => {
        expect(result).toEqual(mockPaymentAttachments);
      });

      expect(httpClient.get).toHaveBeenCalledWith('/api/payment-attachments');
    });

    it('should call GetAll with ID parameter', () => {
      const paymentRequestId = 1;
      const filteredAttachments = mockPaymentAttachments.filter(
        (att) => att.payment_request_id === paymentRequestId,
      );
      httpClient.get.mockReturnValue(of(filteredAttachments));

      service.GetAll(paymentRequestId).subscribe((result) => {
        expect(result).toEqual(filteredAttachments);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        `/api/payment-attachments/${paymentRequestId}`,
      );
    });

    it('should call get with correct URL', () => {
      const attachmentId = 1;
      httpClient.get.mockReturnValue(of(mockPaymentAttachment));

      service.get(attachmentId).subscribe((result) => {
        expect(result).toEqual(mockPaymentAttachment);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        `/api/payment-attachment/${attachmentId}`,
      );
    });

    it('should call add with correct URL and data', () => {
      const newAttachment: Partial<PaymentAttachment> = {
        type: PaymentAttachmentType.OTHER,
        payment_request_id: 1,
        creator_id: 1,
        original_file_name: 'new-file.pdf',
        file: 'uploads/payment-attachments/new123-new-file.pdf',
      };
      httpClient.post.mockReturnValue(of(mockPaymentAttachment));

      service.add(newAttachment).subscribe((result) => {
        expect(result).toEqual(mockPaymentAttachment);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/payment-attachment',
        newAttachment,
      );
    });

    it('should call update with correct URL and data', () => {
      const updatedAttachment: PaymentAttachment = {
        ...new PaymentAttachment(),
        ...{
          id: 1,
          link_name: 'Updated Document Name',
        },
      };
      const expectedResult = {
        ...mockPaymentAttachment,
        link_name: 'Updated Document Name',
      };
      httpClient.put.mockReturnValue(of(expectedResult));

      service.update(updatedAttachment).subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/payment-attachment/1',
        expect.objectContaining({
          link_name: 'Updated Document Name',
        }),
      );
    });

    it('should call delete with correct URL', () => {
      const attachmentId = 1;
      httpClient.delete.mockReturnValue(of(undefined));

      service.delete(attachmentId).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        `/api/payment-attachment/${attachmentId}`,
      );
    });
  });

  describe('deleteFile', () => {
    it('should call DELETE with correct URL and body', () => {
      const fileName = 'uploads/payment-attachments/test-file.pdf';
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteFile(fileName).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/upload/payment-attachment',
        {
          body: { file: fileName },
        },
      );
    });

    it('should handle file deletion successfully', () => {
      const fileName = 'uploads/payment-attachments/document.pdf';
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteFile(fileName).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/upload/payment-attachment',
        {
          body: { file: fileName },
        },
      );
    });

    it('should handle empty filename', () => {
      const fileName = '';
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteFile(fileName).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/upload/payment-attachment',
        {
          body: { file: '' },
        },
      );
    });

    it('should handle special characters in filename', () => {
      const fileName =
        'uploads/payment-attachments/файл с пробелами и символами #@$.pdf';
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteFile(fileName).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/upload/payment-attachment',
        {
          body: { file: fileName },
        },
      );
    });
  });

  describe('upload', () => {
    it('should call POST with correct URL and FormData', () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test content']), 'test.pdf');
      formData.append('payment_request_id', '1');

      httpClient.post.mockReturnValue(of(mockUploadResults));

      service.upload(formData).subscribe((result) => {
        expect(result).toEqual(mockUploadResults);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/upload/payment-attachments',
        formData,
      );
    });

    it('should handle multiple file upload', () => {
      const formData = new FormData();
      formData.append('files', new Blob(['content1']), 'file1.pdf');
      formData.append('files', new Blob(['content2']), 'file2.docx');

      const multipleUploadResults: UploadResult[] = [
        { original_file_name: 'file1.pdf', file: 'uploads/file1.pdf' },
        { original_file_name: 'file2.docx', file: 'uploads/file2.docx' },
      ];

      httpClient.post.mockReturnValue(of(multipleUploadResults));

      service.upload(formData).subscribe((result) => {
        expect(result).toEqual(multipleUploadResults);
        expect(result.length).toBe(2);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/upload/payment-attachments',
        formData,
      );
    });

    it('should handle empty FormData', () => {
      const emptyFormData = new FormData();
      const emptyResults: UploadResult[] = [];

      httpClient.post.mockReturnValue(of(emptyResults));

      service.upload(emptyFormData).subscribe((result) => {
        expect(result).toEqual(emptyResults);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/upload/payment-attachments',
        emptyFormData,
      );
    });

    it('should return observable with upload results', () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.pdf');

      httpClient.post.mockReturnValue(of(mockUploadResults));

      const result = service.upload(formData);
      expect(result).toBeDefined();

      result.subscribe((uploadResults) => {
        expect(Array.isArray(uploadResults)).toBeTruthy();
        expect(uploadResults.length).toBeGreaterThan(0);
        expect(uploadResults[0].original_file_name).toBeDefined();
        expect(uploadResults[0].file).toBeDefined();
      });
    });
  });

  describe('deleteMultiple', () => {
    it('should call DELETE with correct URL and params', () => {
      const fileNames = [
        'uploads/payment-attachments/file1.pdf',
        'uploads/payment-attachments/file2.docx',
      ];
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteMultiple(fileNames).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/payment-attachments/download',
        {
          params: { file: fileNames },
        },
      );
    });

    it('should handle single file in array', () => {
      const fileNames = ['uploads/payment-attachments/single-file.pdf'];
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteMultiple(fileNames).subscribe((result) => {
        expect(result).toBeUndefined();
      });

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/payment-attachments/download',
        {
          params: { file: fileNames },
        },
      );
    });

    it('should handle empty array', () => {
      const fileNames: string[] = [];
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteMultiple(fileNames).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/payment-attachments/download',
        {
          params: { file: fileNames },
        },
      );
    });

    it('should handle multiple files correctly', () => {
      const fileNames = ['file1.pdf', 'file2.docx', 'file3.xlsx', 'file4.png'];
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteMultiple(fileNames).subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/payment-attachments/download',
        {
          params: { file: fileNames },
        },
      );
    });
  });

  describe('HTTP Error Handling', () => {
    it('should propagate HTTP errors from deleteFile', (done) => {
      const errorResponse = new Error('File deletion failed');
      httpClient.delete.mockReturnValue(throwError(() => errorResponse));

      const fileName = 'uploads/test.pdf';

      service.deleteFile(fileName).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('File deletion failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from upload', (done) => {
      const errorResponse = new Error('Upload failed');
      httpClient.post.mockReturnValue(throwError(() => errorResponse));

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.pdf');

      service.upload(formData).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Upload failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from deleteMultiple', (done) => {
      const errorResponse = new Error('Multiple deletion failed');
      httpClient.delete.mockReturnValue(throwError(() => errorResponse));

      const fileNames = ['file1.pdf', 'file2.docx'];

      service.deleteMultiple(fileNames).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('Multiple deletion failed');
          done();
        },
      });
    });

    it('should propagate HTTP errors from inherited methods', (done) => {
      const errorResponse = new Error('Server Error');
      httpClient.get.mockReturnValue(throwError(() => errorResponse));

      service.get(1).subscribe({
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
  });

  describe('Integration scenarios', () => {
    it('should handle a typical file management workflow', () => {
      // Upload files
      const formData = new FormData();
      formData.append('file', new Blob(['content']), 'document.pdf');

      // Get all attachments for a payment request
      const paymentRequestAttachments = mockPaymentAttachments.filter(
        (att) => att.payment_request_id === 1,
      );

      // Delete a specific file
      const fileToDelete = 'uploads/payment-attachments/old-file.pdf';

      // Update attachment metadata
      const updatedAttachment = {
        ...mockPaymentAttachment,
        link_name: 'Updated Name',
      };

      httpClient.post.mockReturnValue(of(mockUploadResults));
      httpClient.get.mockReturnValue(of(paymentRequestAttachments));
      httpClient.delete.mockReturnValue(of(undefined));
      httpClient.put.mockReturnValue(of(updatedAttachment));

      // Execute workflow
      service.upload(formData).subscribe((uploadResult) => {
        expect(uploadResult).toEqual(mockUploadResults);
      });

      service.GetAll(1).subscribe((attachments) => {
        expect(attachments).toEqual(paymentRequestAttachments);
      });

      service.deleteFile(fileToDelete).subscribe();

      service
        .update({ id: 1, link_name: 'Updated Name' })
        .subscribe((updated) => {
          expect(updated.link_name).toBe('Updated Name');
        });

      expect(httpClient.post).toHaveBeenCalledTimes(1);
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      expect(httpClient.delete).toHaveBeenCalledTimes(1);
      expect(httpClient.put).toHaveBeenCalledTimes(1);
    });

    it('should handle attachment type filtering scenario', () => {
      const requestTypeAttachments = mockPaymentAttachments.filter(
        (att) => att.type === PaymentAttachmentType.REQUEST,
      );

      httpClient.get.mockReturnValue(of(requestTypeAttachments));

      service.GetAll().subscribe((attachments) => {
        const requestAttachments = attachments.filter(
          (att) => att.type === PaymentAttachmentType.REQUEST,
        );
        expect(requestAttachments.length).toBe(1);
        expect(requestAttachments[0].type).toBe(PaymentAttachmentType.REQUEST);
      });
    });

    it('should handle bulk operations scenario', () => {
      const filesToDelete = [
        'uploads/file1.pdf',
        'uploads/file2.docx',
        'uploads/file3.xlsx',
      ];

      httpClient.delete
        .mockReturnValueOnce(of(undefined)) // deleteFile call
        .mockReturnValueOnce(of(undefined)); // deleteMultiple call

      // Delete individual file first
      service.deleteFile(filesToDelete[0]).subscribe();

      // Then delete remaining files in bulk
      service.deleteMultiple(filesToDelete.slice(1)).subscribe();

      expect(httpClient.delete).toHaveBeenCalledTimes(2);
      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/upload/payment-attachment',
        {
          body: { file: filesToDelete[0] },
        },
      );
      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/payment-attachments/download',
        {
          params: { file: filesToDelete.slice(1) },
        },
      );
    });
  });
});
