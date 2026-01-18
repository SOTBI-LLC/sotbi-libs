import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PaymentAttachmentService } from '@services/payment-attachment.service';
import { removeID } from '@shared/shared-globals';
import { PaymentAttachment } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddItem,
  DeleteItem,
  DeleteItems,
  GetAllItems,
  GetItem,
  UpdateItem,
} from './payment-attachment.actions';

export interface PaymentAttachmentStateModel {
  items: PaymentAttachment[];
  selected: PaymentAttachment;
  loading?: boolean;
  count: number;
}

@State<PaymentAttachmentStateModel>({
  name: 'payment_attachment',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class PaymentAttachmentState {
  private readonly itemsService = inject(PaymentAttachmentService);

  @Selector()
  public static getLoading(state: PaymentAttachmentStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: PaymentAttachmentStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: PaymentAttachmentStateModel): PaymentAttachment[] {
    return state.items;
  }

  @Action(GetAllItems)
  public GetAllItems(
    { getState, setState, patchState }: StateContext<PaymentAttachmentStateModel>,
    { payload },
  ) {
    // console.log('PaymentAttachmentState::FetchItems');
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.GetAll(payload).pipe(
        tap((items) => {
          setState({
            ...state,
            selected: null,
            items,
            count: items.length,
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetItem)
  public getItem({ patchState }: StateContext<PaymentAttachmentStateModel>, { payload }) {
    patchState({ loading: true });
    if (!payload) {
      const selected: PaymentAttachment = {
        id: 0,
        type: null,
        payment_request_id: 0,
        creator_id: null,
        original_file_name: null,
        file: null,
      };
      return patchState({ selected, loading: false });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((item) => patchState({ selected: item })),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<PaymentAttachmentStateModel>,
    { payload },
  ) {
    // console.log('PaymentAttachmentState::AddItem', payload);
    patchState({ loading: true });
    return this.itemsService.add(removeID(payload)).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [result, ...state.items],
          selected: result,
          count: state.count + 1,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, setState, patchState }: StateContext<PaymentAttachmentStateModel>,
    { payload },
  ) {
    // console.log('PaymentAttachmentState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    const items = [...state.items];
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const idx = items.findIndex(({ id }) => id === selected.id);
        if (idx >= 0) {
          items[idx] = selected;
          setState({
            ...state,
            items,
            selected,
          });
        }
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<PaymentAttachmentStateModel>,
    { payload },
  ) {
    // console.log('PaymentAttachmentState::DeleteItem', payload);
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItems)
  public deleteItems({ patchState }: StateContext<PaymentAttachmentStateModel>, { payload }) {
    // console.log('PaymentAttachmentState::DeleteItems', payload);
    patchState({ loading: true });
    return this.itemsService.deleteMultiple(payload).pipe(
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
