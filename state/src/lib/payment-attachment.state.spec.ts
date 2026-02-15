import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStates, provideStore, Store } from '@ngxs/store';
import { PaymentAttachmentService } from '@sotbi/data-access';
import type { PaymentAttachment, User } from '@sotbi/models';
import { PaymentAttachmentType } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import {
  AddItem,
  DeleteItem,
  DeleteItems,
  GetAllItems,
  GetItem,
  UpdateItem,
} from './payment-attachment.actions';
import type { PaymentAttachmentStateModel } from './payment-attachment.state';
import { PaymentAttachmentState } from './payment-attachment.state';

describe('PaymentAttachmentState', () => {
  let store: Store;
  let service: jest.Mocked<PaymentAttachmentService>;

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

  const mockAttachment: PaymentAttachment = {
    id: 1,
    type: PaymentAttachmentType.REQUEST,
    payment_request_id: 1,
    creator_id: 1,
    creator: mockUser,
    original_file_name: 'req.pdf',
    file: 'uploads/payment-attachments/req.pdf',
    link_name: 'Request Attachment',
  };

  const mockAttachments: PaymentAttachment[] = [
    mockAttachment,
    {
      id: 2,
      type: PaymentAttachmentType.ORDERS,
      payment_request_id: 1,
      creator_id: 1,
      creator: mockUser,
      original_file_name: 'order.pdf',
      file: 'uploads/payment-attachments/order.pdf',
      link_name: 'Payment Order',
    },
  ];

  beforeEach(async () => {
    const serviceSpy = {
      GetAll: jest.fn(),
      get: jest.fn(),
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMultiple: jest.fn(),
    } as unknown as jest.Mocked<PaymentAttachmentService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PaymentAttachmentService, useValue: serviceSpy },
        provideStore([]),
        provideStates([PaymentAttachmentState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    service = TestBed.inject(
      PaymentAttachmentService,
    ) as jest.Mocked<PaymentAttachmentService>;
  });

  it('should have initial state', () => {
    const items = store.selectSnapshot(PaymentAttachmentState.getItems);
    const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);
    const selected = store.selectSnapshot(PaymentAttachmentState.getSelected);

    expect(items).toEqual([]);
    expect(loading).toBe(false);
    expect(selected).toBeNull();
  });

  describe('Selectors', () => {
    it('should select loading, selected and items correctly', () => {
      const mockState: PaymentAttachmentStateModel = {
        items: mockAttachments,
        selected: mockAttachment,
        loading: true,
        count: mockAttachments.length,
      };

      expect(PaymentAttachmentState.getLoading(mockState)).toBe(true);
      expect(PaymentAttachmentState.getSelected(mockState)).toEqual(
        mockAttachment,
      );
      expect(PaymentAttachmentState.getItems(mockState)).toEqual(
        mockAttachments,
      );
    });
  });

  describe('GetAllItems', () => {
    it('should fetch items when state is empty (success path)', () => {
      service.GetAll.mockReturnValue(of(mockAttachments));

      store.dispatch(new GetAllItems(1));

      const items = store.selectSnapshot(PaymentAttachmentState.getItems);
      const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);

      expect(service.GetAll).toHaveBeenCalledWith(1);
      expect(items).toEqual(mockAttachments);
      expect(loading).toBe(false);
    });

    it('should not fetch when items already exist', () => {
      store.reset({
        payment_attachment: {
          items: mockAttachments,
          selected: null,
          loading: false,
          count: mockAttachments.length,
        },
      });

      store.dispatch(new GetAllItems(1));

      expect(service.GetAll).not.toHaveBeenCalled();
    });

    it('should handle fetch error and reset loading', () => {
      service.GetAll.mockReturnValue(
        throwError(() => new Error('Fetch failed')),
      );

      store.dispatch(new GetAllItems(1));

      const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);
      expect(loading).toBe(false);
    });
  });

  describe('GetItem', () => {
    it('should get item by ID (success path)', (done) => {
      service.get.mockReturnValue(of(mockAttachment));

      store.dispatch(new GetItem(1)).subscribe({
        next: () => {
          const selected = store.selectSnapshot(
            PaymentAttachmentState.getSelected,
          );
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );

          expect(service.get).toHaveBeenCalledWith(1);
          expect(selected).toEqual(mockAttachment);
          expect(loading).toBe(false);
          done();
        },
        error: (err) => {
          fail(`GetItem should not error: ${err}`);
          done();
        },
      });
    });

    it('should create new default item when payload is 0 (edge case)', () => {
      store.dispatch(new GetItem(0));

      const selected = store.selectSnapshot(PaymentAttachmentState.getSelected);
      const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);

      expect(selected).toEqual({
        id: 0,
        type: null,
        payment_request_id: 0,
        creator_id: null,
        original_file_name: null,
        file: null,
      });
      expect(loading).toBe(false);

      // zero should be treated as falsy new-item case as well
      store.dispatch(new GetItem(0));
      const selectedZero = store.selectSnapshot(
        PaymentAttachmentState.getSelected,
      );
      expect(selectedZero?.id).toBe(0);
    });

    it('should handle get item error and reset loading', () => {
      service.get.mockReturnValue(throwError(() => new Error('Get failed')));

      store.dispatch(new GetItem(1));

      const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);
      expect(loading).toBe(false);
    });
  });

  describe('AddItem', () => {
    it('should add new item and increment count (success path)', (done) => {
      store.reset({
        payment_attachment: {
          items: [],
          selected: null,
          loading: false,
          count: 0,
        },
      });

      const newItem: Partial<PaymentAttachment> = {
        type: PaymentAttachmentType.OTHER,
        payment_request_id: 1,
        creator_id: 1,
        original_file_name: 'new.pdf',
        file: 'uploads/payment-attachments/new.pdf',
      };

      service.add.mockReturnValue(of(mockAttachment));

      store.dispatch(new AddItem(newItem)).subscribe(() => {
        const items = store.selectSnapshot(PaymentAttachmentState.getItems);
        const selected = store.selectSnapshot(
          PaymentAttachmentState.getSelected,
        );
        const state = store.selectSnapshot(
          (s) => s.payment_attachment as PaymentAttachmentStateModel,
        );

        expect(items[0]).toEqual(mockAttachment);
        expect(selected).toEqual(mockAttachment);
        expect(state.count).toBe(1);
        expect(service.add).toHaveBeenCalledWith(newItem);
        done();
      });
    });

    it('should handle add item error and reset loading', (done) => {
      service.add.mockReturnValue(throwError(() => new Error('Add failed')));

      const newItem: Partial<PaymentAttachment> = {
        type: PaymentAttachmentType.REQUEST,
      };

      store.dispatch(new AddItem(newItem)).subscribe({
        next: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
      });
    });
  });

  describe('UpdateItem', () => {
    beforeEach(() => {
      store.reset({
        payment_attachment: {
          items: mockAttachments,
          selected: mockAttachment,
          loading: false,
          count: mockAttachments.length,
        },
      });
    });

    it('should update existing item immutably and set selected (success path)', (done) => {
      const updated: PaymentAttachment = {
        ...mockAttachment,
        link_name: 'Updated Name',
      } as PaymentAttachment;
      service.update.mockReturnValue(of(updated));

      const itemsBefore = store.selectSnapshot(PaymentAttachmentState.getItems);

      store
        .dispatch(
          new UpdateItem({
            id: 1,
            link_name: 'Updated Name',
            type: PaymentAttachmentType.REQUEST,
            payment_request_id: 0,
            creator_id: 0,
            creator: null,
            original_file_name: null,
            file: null,
          }),
        )
        .subscribe(() => {
          const itemsAfter = store.selectSnapshot(
            PaymentAttachmentState.getItems,
          );
          const selected = store.selectSnapshot(
            PaymentAttachmentState.getSelected,
          );
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );

          expect(itemsAfter[0]).toEqual(updated);
          expect(selected).toEqual(updated);
          expect(loading).toBe(false);
          expect(itemsAfter).not.toBe(itemsBefore); // immutability check
          expect(service.update).toHaveBeenCalledWith({
            id: 1,
            link_name: 'Updated Name',
          });
          done();
        });
    });

    it('should not modify items when updating non-existent item (edge case)', (done) => {
      const nonExisting: PaymentAttachment = {
        ...mockAttachment,
        id: 999,
        link_name: 'Does Not Exist',
      };
      service.update.mockReturnValue(of(nonExisting));

      const before = store.selectSnapshot(PaymentAttachmentState.getItems);

      store
        .dispatch(
          new UpdateItem({
            id: 999,
            link_name: 'Does Not Exist',
            type: PaymentAttachmentType.REQUEST,
            payment_request_id: 0,
            creator_id: 0,
            creator: null,
            original_file_name: null,
            file: null,
          }),
        )
        .subscribe(() => {
          const after = store.selectSnapshot(PaymentAttachmentState.getItems);
          expect(after).toEqual(before);
          done();
        });
    });

    it('should handle update error and reset loading', (done) => {
      service.update.mockReturnValue(
        throwError(() => new Error('Update failed')),
      );

      store
        .dispatch(
          new UpdateItem({
            id: 1,
            link_name: 'X',
            type: PaymentAttachmentType.REQUEST,
            payment_request_id: 0,
            creator_id: 0,
            creator: null,
            original_file_name: null,
            file: null,
          }),
        )
        .subscribe({
          next: () => {
            const loading = store.selectSnapshot(
              PaymentAttachmentState.getLoading,
            );
            expect(loading).toBe(false);
            done();
          },
          error: () => {
            const loading = store.selectSnapshot(
              PaymentAttachmentState.getLoading,
            );
            expect(loading).toBe(false);
            done();
          },
        });
    });
  });

  describe('DeleteItem', () => {
    beforeEach(() => {
      store.reset({
        payment_attachment: {
          items: mockAttachments,
          selected: mockAttachment,
          loading: false,
          count: mockAttachments.length,
        },
      });
    });

    it('should delete item (success path)', (done) => {
      service.delete.mockReturnValue(of(undefined));

      store.dispatch(new DeleteItem(1)).subscribe(() => {
        const items = store.selectSnapshot(PaymentAttachmentState.getItems);
        const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);

        expect(items.length).toBe(1);
        expect(items[0].id).toBe(2);
        expect(loading).toBe(false);
        expect(service.delete).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle delete error and reset loading', (done) => {
      service.delete.mockReturnValue(
        throwError(() => new Error('Delete failed')),
      );

      store.dispatch(new DeleteItem(1)).subscribe({
        next: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
      });
    });
  });

  describe('DeleteItems (bulk)', () => {
    it('should call service with filenames and reset loading (success path)', (done) => {
      const files = ['a.pdf', 'b.docx'];
      service.deleteMultiple.mockReturnValue(of(undefined));

      store.dispatch(new DeleteItems(files)).subscribe(() => {
        const loading = store.selectSnapshot(PaymentAttachmentState.getLoading);
        expect(service.deleteMultiple).toHaveBeenCalledWith(files);
        expect(loading).toBe(false);
        done();
      });
    });

    it('should handle bulk delete error and reset loading', (done) => {
      service.deleteMultiple.mockReturnValue(
        throwError(() => new Error('Bulk failed')),
      );

      store.dispatch(new DeleteItems(['x'])).subscribe({
        next: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
        error: () => {
          const loading = store.selectSnapshot(
            PaymentAttachmentState.getLoading,
          );
          expect(loading).toBe(false);
          done();
        },
      });
    });
  });

  describe('State Consistency Scenario', () => {
    it('should maintain consistent state across fetch -> add -> delete', (done) => {
      // Fetch
      service.GetAll.mockReturnValue(of(mockAttachments));
      store.dispatch(new GetAllItems(1)).subscribe(() => {
        expect(
          store.selectSnapshot(PaymentAttachmentState.getItems).length,
        ).toBe(2);

        // Add
        const created: PaymentAttachment = {
          ...mockAttachment,
          id: 3,
          link_name: 'New',
        };
        service.add.mockReturnValue(of(created));

        store.dispatch(new AddItem({ link_name: 'New' })).subscribe(() => {
          expect(
            store.selectSnapshot(PaymentAttachmentState.getItems).length,
          ).toBe(3);
          expect(
            store.selectSnapshot(PaymentAttachmentState.getItems)[0],
          ).toEqual(created);

          // Delete
          service.delete.mockReturnValue(of(undefined));
          store.dispatch(new DeleteItem(3)).subscribe(() => {
            expect(
              store.selectSnapshot(PaymentAttachmentState.getItems).length,
            ).toBe(2);
            expect(
              store
                .selectSnapshot(PaymentAttachmentState.getItems)
                .find((i) => i.id === 3),
            ).toBeUndefined();
            done();
          });
        });
      });
    });
  });
});
