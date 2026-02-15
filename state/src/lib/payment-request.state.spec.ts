import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore, provideStates } from '@ngxs/store';
import { PaymentRequestService } from '@sotbi/data-access';
import type {
  PaymentAttachment,
  PaymentRequestHistory,
  User,
} from '@sotbi/models';
import {
  PaymentAttachmentType,
  PaymentRequest,
  PaymentRequestTarget,
  PaymentRequestType,
  StatusEnum,
} from '@sotbi/models';
import { of, throwError } from 'rxjs';
import {
  AddDirtyItem,
  AddItem,
  DeleteItem,
  FetchItems,
  GetItem,
  UpdateItem,
} from './payment-request.actions';
import type { PaymentRequestStateModel } from './payment-request.state';
import { PaymentRequestState } from './payment-request.state';

describe('PaymentRequestState', () => {
  let store: Store;
  let service: jest.Mocked<PaymentRequestService>;

  const mockUser: User = {
    id: 1,
    uuid: null, // Avoid NGXS freeze issues with TypedArrays
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

  const mockPaymentAttachments: PaymentAttachment[] = [
    {
      id: 1,
      type: PaymentAttachmentType.REQUEST,
      payment_request_id: 1,
      creator_id: 1,
      creator: mockUser,
      original_file_name: 'test-document.pdf',
      file: 'uploads/payment-attachments/abc123-test-document.pdf',
      link_name: 'Payment Request Document',
    },
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
  ];

  const history: PaymentRequestHistory = {
    ...new PaymentRequest(),
    ...{
      id: 1,
      created_at: new Date('2024-01-01'),
      revision: 1,
      action: 'created',
      status: StatusEnum.OPEN,
      debtor_id: 1,
      bank_detail_id: 1,
      target: PaymentRequestTarget.PAY,
      request_type: PaymentRequestType.FORM,
      worked_by_id: 1,
      defrayments: [],
      payment_attachments: [],
    },
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
    defrayments: [
      {
        id: 1,
        payment_request_id: 1,
        summ: 1000,
        payment_purpose: 'Test defrayment 1',
        priority: 1,
        creator_id: 1,
        creator: mockUser,
      },
      {
        id: 2,
        payment_request_id: 1,
        summ: 2000,
        payment_purpose: 'Test defrayment 2',
        priority: 2,
        creator_id: 1,
        creator: mockUser,
      },
    ],
    payment_attachments: mockPaymentAttachments,
    project_name: 'Test Project',
    debtor_name: 'Test Debtor LLC',
    defrayments_count: 2,
    updated_by_name: 'John Doe',
    worked_by_name: 'Jane Smith',
    project_owner_id: 1,
    doer_comment: 'Processing payment request',
    debtor: null,
    bank_detail: null,
    bank_detail_bik: '',
    worked_by: null,
    updated_by_id: 0,
    histories: [history],
    updated_by: mockUser,
  };

  const mockPaymentRequest2 = {
    ...new PaymentRequest(),
    ...{
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
  };

  const mockPaymentRequests: PaymentRequest[] = [
    mockPaymentRequest,
    mockPaymentRequest2,
  ];

  beforeEach(async () => {
    const serviceSpy = {
      getAllWithParams: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PaymentRequestService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PaymentRequestService, useValue: serviceSpy },
        provideStore([]),
        provideStates([PaymentRequestState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    service = TestBed.inject(
      PaymentRequestService,
    ) as jest.Mocked<PaymentRequestService>;
  });

  it('should have initial state', () => {
    const state = store.selectSnapshot(PaymentRequestState.getItems);
    const loading = store.selectSnapshot(PaymentRequestState.getLoading);
    const selected = store.selectSnapshot(PaymentRequestState.getSelected);

    expect(state).toEqual([]);
    expect(loading).toBe(false);
    expect(selected).toBeNull();
  });

  describe('Selectors', () => {
    it('should select loading state', () => {
      const mockState: PaymentRequestStateModel = {
        items: [],
        selected: null,
        loading: true,
        count: 0,
      };

      const loading = PaymentRequestState.getLoading(mockState);
      expect(loading).toBe(true);
    });

    it('should select selected item', () => {
      const mockState: PaymentRequestStateModel = {
        items: mockPaymentRequests,
        selected: mockPaymentRequest,
        loading: false,
        count: 2,
      };

      const selected = PaymentRequestState.getSelected(mockState);
      expect(selected).toEqual(mockPaymentRequest);
    });

    it('should select items', () => {
      const mockState: PaymentRequestStateModel = {
        items: mockPaymentRequests,
        selected: null,
        loading: false,
        count: 2,
      };

      const items = PaymentRequestState.getItems(mockState);
      expect(items).toEqual(mockPaymentRequests);
    });
  });

  describe('FetchItems Action', () => {
    it('should fetch items when state is empty', () => {
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      service.getAllWithParams.mockReturnValue(of(mockResponse));

      store.dispatch(new FetchItems());

      const items = store.selectSnapshot(PaymentRequestState.getItems);
      const loading = store.selectSnapshot(PaymentRequestState.getLoading);

      expect(items).toEqual(mockPaymentRequests);
      expect(loading).toBe(false);
      expect(service.getAllWithParams).toHaveBeenCalled();
    });

    it('should not fetch items when state already has items', () => {
      // Set up state with existing items
      store.reset({
        payment_request: {
          items: mockPaymentRequests,
          selected: null,
          loading: false,
          count: 2,
        },
      });

      store.dispatch(new FetchItems());

      expect(service.getAllWithParams).not.toHaveBeenCalled();
    });

    it('should handle fetch error', (done) => {
      const errorResponse = new Error('Fetch failed');
      service.getAllWithParams.mockReturnValue(throwError(() => errorResponse));

      store.dispatch(new FetchItems()).subscribe({
        error: () => {
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });

    it('should set loading to true while fetching', () => {
      const mockResponse = { requests: mockPaymentRequests, count: 2 };
      service.getAllWithParams.mockReturnValue(of(mockResponse));

      let loadingDuringFetch = false;
      store.select(PaymentRequestState.getLoading).subscribe((loading) => {
        if (loading) {
          loadingDuringFetch = true;
        }
      });

      store.dispatch(new FetchItems());

      expect(loadingDuringFetch).toBe(true);
    });
  });

  describe('GetItem Action', () => {
    it('should get item by ID', (done) => {
      service.get.mockReturnValue(of(mockPaymentRequest));

      store.dispatch(new GetItem(1)).subscribe({
        next: () => {
          const selected = store.selectSnapshot(
            PaymentRequestState.getSelected,
          );
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);

          expect(selected).toEqual(mockPaymentRequest);
          expect(loading).toBe(false);
          expect(service.get).toHaveBeenCalledWith(1);
          done();
        },
        error: (error) => {
          console.error('GetItem action error:', error);
          fail(`GetItem action should not fail: ${error.message}`);
          done();
        },
      });
    });

    it('should create new item when payload is 0', () => {
      store.dispatch(new GetItem(0));

      const selected = store.selectSnapshot(PaymentRequestState.getSelected);

      expect(selected).toEqual(expect.objectContaining({
        id: 0,
        status: StatusEnum.DRAFT,
        debtor_id: 0,
        bank_detail_id: 0,
        target: PaymentRequestTarget.PAY,
        request_type: PaymentRequestType.FORM,
        defrayments: [],
        payment_attachments: [],
        worked_by_id: 0,
      }));
      expect(service.get).not.toHaveBeenCalled();
    });

    it('should handle get item error', () => {
      const errorResponse = new Error('Get item failed');
      service.get.mockReturnValue(throwError(() => errorResponse));

      store.dispatch(new GetItem(0));

      const loading = store.selectSnapshot(PaymentRequestState.getLoading);
      expect(loading).toBe(false);
    });

    it('should set loading to false when creating new item', () => {
      store.dispatch(new GetItem(0));

      const loading = store.selectSnapshot(PaymentRequestState.getLoading);
      expect(loading).toBe(false);
    });
  });

  describe('AddItem Action', () => {
    it('should add new item', (done) => {
      const newItem: Partial<PaymentRequest> = {
        status: StatusEnum.DRAFT,
        debtor_id: 1,
        bank_detail_id: 1,
        target: PaymentRequestTarget.PAY,
        request_type: PaymentRequestType.FORM,
        defrayments: [],
        payment_attachments: [],
      };

      service.add.mockReturnValue(of(mockPaymentRequest));

      store.dispatch(new AddItem(newItem)).subscribe(() => {
        const items = store.selectSnapshot(PaymentRequestState.getItems);
        const selected = store.selectSnapshot(PaymentRequestState.getSelected);
        const loading = store.selectSnapshot(PaymentRequestState.getLoading);

        expect(items).toContainEqual(mockPaymentRequest);
        expect(selected).toEqual(mockPaymentRequest);
        expect(loading).toBe(false);
        expect(service.add).toHaveBeenCalledWith(newItem); // removeID is called in the action
        done();
      });
    });

    it('should increment count when adding item', (done) => {
      const newItem: Partial<PaymentRequest> = {
        status: StatusEnum.DRAFT,
        debtor_id: 1,
      };

      // Set initial state with count
      store.reset({
        payment_request: {
          items: [],
          selected: null,
          loading: false,
          count: 5,
        },
      });

      service.add.mockReturnValue(of(mockPaymentRequest));

      store.dispatch(new AddItem(newItem)).subscribe(() => {
        const state = store.selectSnapshot((state) => state.payment_request);
        expect(state.count).toBe(6);
        done();
      });
    });

    it('should handle add item error', (done) => {
      const errorResponse = new Error('Add item failed');
      service.add.mockReturnValue(throwError(() => errorResponse));

      const newItem: Partial<PaymentRequest> = {
        status: StatusEnum.DRAFT,
        debtor_id: 1,
      };

      store.dispatch(new AddItem(newItem)).subscribe({
        next: () => {
          // Action completes due to finalize() even on service errors
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });
  });

  describe('UpdateItem Action', () => {
    beforeEach(() => {
      // Set up state with existing items
      store.reset({
        payment_request: {
          items: mockPaymentRequests,
          selected: mockPaymentRequest,
          loading: false,
          count: 2,
        },
      });
    });

    it('should update existing item', (done) => {
      const updatedItem: PaymentRequest = {
        ...mockPaymentRequest,
        description: 'Updated description',
        status: StatusEnum.WORK,
      };

      service.update.mockReturnValue(of(updatedItem));

      const update = {
        ...new PaymentRequest(),
        ...{ id: 1, description: 'Updated description' },
      };

      store.dispatch(new UpdateItem(update)).subscribe(() => {
        const items = store.selectSnapshot(PaymentRequestState.getItems);
        const selected = store.selectSnapshot(PaymentRequestState.getSelected);
        const loading = store.selectSnapshot(PaymentRequestState.getLoading);

        expect(items[0]).toEqual(updatedItem);
        expect(selected).toEqual(updatedItem);
        expect(loading).toBe(false);
        expect(service.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1,
            description: 'Updated description',
          }),
        );
        done();
      });
    });

    it('should handle update item error', (done) => {
      const errorResponse = new Error('Update item failed');
      service.update.mockReturnValue(throwError(() => errorResponse));

      const update = {
        ...new PaymentRequest(),
        ...{ id: 1, description: 'Updated description' },
      };
      store.dispatch(new UpdateItem(update)).subscribe({
        next: () => {
          // NGXS actions complete even when service calls fail due to finalize()
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          // This might not be called due to how NGXS handles errors
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });

    it('should update correct item in array', (done) => {
      const updatedSecondItem: PaymentRequest = {
        ...mockPaymentRequests[1],
        description: 'Updated second item',
      };

      service.update.mockReturnValue(of(updatedSecondItem));
      const update = {
        ...new PaymentRequest(),
        ...{ id: 2, description: 'Updated second item' },
      };

      store.dispatch(new UpdateItem(update)).subscribe(() => {
        const items = store.selectSnapshot(PaymentRequestState.getItems);

        // Check that we have the expected number of items
        expect(items.length).toBe(2);

        // Check that the second item was updated
        const updatedItem = items.find((item) => item.id === 2);
        expect(updatedItem).toBeDefined();
        expect(updatedItem?.description).toBe('Updated second item');

        // Check that the first item remains unchanged
        const firstItem = items.find((item) => item.id === 1);
        expect(firstItem).toBeDefined();
        expect(firstItem?.description).toBe(mockPaymentRequest.description);

        done();
      });
    });
  });

  describe('DeleteItem Action', () => {
    beforeEach(() => {
      // Set up state with existing items
      store.reset({
        payment_request: {
          items: mockPaymentRequests,
          selected: mockPaymentRequest,
          loading: false,
          count: 2,
        },
      });
    });

    it('should delete item', (done) => {
      service.delete.mockReturnValue(of(undefined));

      store.dispatch(new DeleteItem(1)).subscribe(() => {
        const items = store.selectSnapshot(PaymentRequestState.getItems);
        const loading = store.selectSnapshot(PaymentRequestState.getLoading);

        expect(items.length).toBe(1);
        expect(items[0].id).toBe(2);
        expect(loading).toBe(false);
        expect(service.delete).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle delete item error', (done) => {
      const errorResponse = new Error('Delete item failed');
      service.delete.mockReturnValue(throwError(() => errorResponse));

      store.dispatch(new DeleteItem(1)).subscribe({
        next: () => {
          // Action completes due to finalize() even on service errors
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });

    it('should not affect other items when deleting', (done) => {
      service.delete.mockReturnValue(of(undefined));

      const initialCount = store.selectSnapshot(
        PaymentRequestState.getItems,
      ).length;

      store.dispatch(new DeleteItem(1)).subscribe(() => {
        const items = store.selectSnapshot(PaymentRequestState.getItems);
        expect(items.length).toBe(initialCount - 1);
        expect(items.find((item) => item.id === 1)).toBeUndefined();
        expect(items.find((item) => item.id === 2)).toBeDefined();
        done();
      });
    });
  });

  describe('AddDirtyItem Action', () => {
    it('should add dirty item with cleaned data', (done) => {
      const itemWithAllData = {
        ...mockPaymentRequest,
        id: 1,
        status: StatusEnum.WORK,
        doer_comment: 'Some comment',
        histories: [
          {
            id: 1,
            created_at: new Date('2024-01-01'),
            revision: 1,
            action: 'created',
            status: StatusEnum.OPEN,
            debtor_id: 1,
            bank_detail_id: 1,
            target: PaymentRequestTarget.PAY,
            request_type: PaymentRequestType.FORM,
            worked_by_id: 1,
            defrayments: [],
            payment_attachments: [],
          },
        ],
        payment_attachments: [
          {
            id: 1,
            type: PaymentAttachmentType.REQUEST,
            payment_request_id: 1,
            creator_id: 1,
          },
          {
            id: 2,
            type: PaymentAttachmentType.ORDERS,
            payment_request_id: 1,
            creator_id: 1,
          },
          {
            id: 3,
            type: PaymentAttachmentType.CARDFILE,
            payment_request_id: 1,
            creator_id: 1,
          },
          {
            id: 4,
            type: PaymentAttachmentType.OTHER,
            payment_request_id: 1,
            creator_id: 1,
          },
          {
            id: 5,
            type: PaymentAttachmentType.WRITINGOUT,
            payment_request_id: 1,
            creator_id: 1,
          },
        ],
        defrayments: [
          {
            id: 1,
            payment_request_id: 1,
            summ: 1000,
            payment_purpose: 'Test defrayment 1',
            priority: 1,
            creator_id: 1,
          },
          {
            id: 2,
            payment_request_id: 1,
            summ: 2000,
            payment_purpose: 'Test defrayment 2',
            priority: 2,
            creator_id: 1,
          },
        ],
      };

      service.get.mockReturnValue(of(itemWithAllData as any));

      store.dispatch(new AddDirtyItem(1)).subscribe(() => {
        const selected = store.selectSnapshot(PaymentRequestState.getSelected);

        // Check that sensitive data is reset
        expect(selected?.id).toBe(0);
        expect(selected?.status).toBe(StatusEnum.DRAFT);
        expect(selected?.doer_comment).toBe('');
        expect(selected?.histories).toEqual([]);

        // Check that filtered attachment types are removed
        expect(selected?.payment_attachments.length).toBe(1);
        expect(selected?.payment_attachments[0].type).toBe(
          PaymentAttachmentType.REQUEST,
        );
        expect(selected?.payment_attachments[0].id).toBe(0);

        // Check that defrayment IDs are reset
        expect(selected?.defrayments.length).toBe(2);
        expect(selected?.defrayments[0].id).toBe(0);
        expect(selected?.defrayments[1].id).toBe(0);

        expect(service.get).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle AddDirtyItem error', (done) => {
      const errorResponse = new Error('AddDirtyItem failed');
      service.get.mockReturnValue(throwError(() => errorResponse));

      store.dispatch(new AddDirtyItem(0)).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (err) => {
          expect(err).toBe(errorResponse);
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });

    it('should handle item with no defrayments', (done) => {
      const itemWithoutArrays = {
        ...mockPaymentRequest,
        payment_attachments: null,
        defrayments: null,
      };

      service.get.mockReturnValue(of(itemWithoutArrays as any));

      store.dispatch(new AddDirtyItem(1)).subscribe(() => {
        const selected = store.selectSnapshot(PaymentRequestState.getSelected);
        expect(selected?.defrayments).toBeNull();
        done();
      });
    });

    it('should use consistent error handling', (done) => {
      const errorResponse = new Error('AddDirtyItem failed');
      service.get.mockReturnValue(throwError(() => errorResponse));

      store.dispatch(new AddDirtyItem(-1)).subscribe({
        next: () => {
          fail('Should have thrown an error');
          done();
        },
        error: (err) => {
          expect(err).toBe(errorResponse);
          const loading = store.selectSnapshot(PaymentRequestState.getLoading);
          expect(loading).toBe(false);
          done();
        },
      });
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle service returning null/undefined', () => {
      service.get.mockReturnValue(of(null as any));

      store.dispatch(new GetItem(1));

      const selected = store.selectSnapshot(PaymentRequestState.getSelected);
      expect(selected).toBeNull();
    });

    it('should handle empty arrays properly', () => {
      const emptyResponse = { requests: [], count: 0 };
      service.getAllWithParams.mockReturnValue(of(emptyResponse));

      store.dispatch(new FetchItems());

      const items = store.selectSnapshot(PaymentRequestState.getItems);
      expect(items).toEqual([]);
    });

    it('should handle concurrent actions properly', () => {
      service.getAllWithParams.mockReturnValue(
        of({ requests: mockPaymentRequests, count: 2 }),
      );
      service.get.mockReturnValue(of(mockPaymentRequest));

      // Dispatch multiple actions
      store.dispatch(new FetchItems());
      store.dispatch(new GetItem(1));

      const items = store.selectSnapshot(PaymentRequestState.getItems);
      const selected = store.selectSnapshot(PaymentRequestState.getSelected);

      expect(items).toEqual(mockPaymentRequests);
      expect(selected).toEqual(mockPaymentRequest);
    });

    it('should handle update of non-existent item', () => {
      store.reset({
        payment_request: {
          items: mockPaymentRequests,
          selected: null,
          loading: false,
          count: 2,
        },
      });

      const nonExistentItem: PaymentRequest = {
        ...mockPaymentRequest,
        id: 999, // Non-existent ID
        description: 'Updated description',
      };

      service.update.mockReturnValue(of(nonExistentItem));

      const update = {
        ...new PaymentRequest(),
        ...{ id: 999, description: 'Updated description' },
      };

      store.dispatch(new UpdateItem(update));

      const items = store.selectSnapshot(PaymentRequestState.getItems);
      // The item won't be found in the array, so original items remain unchanged
      expect(items).toEqual(mockPaymentRequests);
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency during operations', (done) => {
      // Start with empty state
      expect(store.selectSnapshot(PaymentRequestState.getItems)).toEqual([]);

      // Step 1: Fetch items
      service.getAllWithParams.mockReturnValue(
        of({ requests: mockPaymentRequests, count: 2 }),
      );

      store.dispatch(new FetchItems()).subscribe(() => {
        expect(store.selectSnapshot(PaymentRequestState.getItems).length).toBe(
          2,
        );

        // Step 2: Add item
        const newItem: PaymentRequest = {
          ...mockPaymentRequest,
          id: 3,
          description: 'New item',
        };
        service.add.mockReturnValue(of(newItem));

        store
          .dispatch(new AddItem({ description: 'New item' }))
          .subscribe(() => {
            expect(
              store.selectSnapshot(PaymentRequestState.getItems).length,
            ).toBe(3);
            expect(
              store.selectSnapshot(PaymentRequestState.getItems)[0],
            ).toEqual(newItem);

            // Step 3: Delete item
            service.delete.mockReturnValue(of(undefined));

            store.dispatch(new DeleteItem(3)).subscribe(() => {
              expect(
                store.selectSnapshot(PaymentRequestState.getItems).length,
              ).toBe(2);
              expect(
                store
                  .selectSnapshot(PaymentRequestState.getItems)
                  .find((i) => i.id === 3),
              ).toBeUndefined();
              done();
            });
          });
      });
    });
  });
});
