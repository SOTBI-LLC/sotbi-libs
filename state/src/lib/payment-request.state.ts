import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PaymentRequestService } from '@services/payment-request.service';
import { removeID } from '@shared/shared-globals';
import { PaymentAttachmentType, PaymentRequest, StatusEnum } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddDirtyItem,
  AddItem,
  DeleteItem,
  FetchItems,
  GetItem,
  UpdateItem,
} from './payment-request.actions';

export class PaymentRequestStateModel {
  public items: PaymentRequest[] = [];
  public selected: PaymentRequest | null = null;
  public loading: boolean = false;
  public count: number = 0;
}

@State<PaymentRequestStateModel>({
  name: 'payment_request',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class PaymentRequestState {
  private readonly itemsService = inject(PaymentRequestService);

  @Selector()
  public static getLoading(state: PaymentRequestStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: PaymentRequestStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: PaymentRequestStateModel): PaymentRequest[] {
    return state.items;
  }

  @Action(FetchItems)
  public fetchItems({ getState, setState, patchState }: StateContext<PaymentRequestStateModel>) {
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      return this.itemsService.getAllWithParams().pipe(
        tap(({ requests, count }) => {
          setState({
            ...state,
            selected: null,
            items: requests,
            count,
          });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: GetItem,
  ) {
    patchState({ loading: true });
    if (!payload) {
      const selected: PaymentRequest = {
        id: 0,
        status: StatusEnum.DRAFT,
        debtor_id: null,
        bank_detail_id: null,
        target: null,
        request_type: null,
        defrayments: [],
        payment_attachments: [],
        worked_by_id: null,
      };
      return patchState({ selected, loading: false });
    } else {
      const state = getState();
      if (state.items.length > 0) {
        const selected = state.items.find(({ id }) => id === payload);
        return setState({ ...state, selected, loading: false });
      } else {
        return this.itemsService.get(payload).pipe(
          tap((item: PaymentRequest) => setState({ ...state, selected: item })),
          catchError((err) => throwError(() => err)),
          finalize(() => patchState({ loading: false })),
        );
      }
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: AddItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.add(removeID(payload)).pipe(
      tap((selected: PaymentRequest) => {
        const state = getState();
        setState({
          ...state,
          items: [selected, ...state.items],
          selected,
          count: state.count + 1,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, setState, patchState }: StateContext<PaymentRequestStateModel>,
    { payload }: UpdateItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.update(payload).pipe(
      tap((selected: PaymentRequest) => {
        const state = getState();
        const items = [...state.items.map((item) => (item.id === selected.id ? selected : item))];
        setState({
          ...state,
          items,
          selected,
          loading: false,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: DeleteItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        setState({
          ...state,
          items,
          selected: null,
          loading: false,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(AddDirtyItem)
  public addDirtyItem(
    { patchState }: StateContext<PaymentRequestStateModel>,
    { payload }: AddDirtyItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.get(payload).pipe(
      tap((item: PaymentRequest) => {
        delete item.status;
        delete item.doer_comment;
        delete item.id;
        delete item.histories;
        item.payment_attachments =
          item.payment_attachments?.filter(
            (elem) =>
              !(
                elem.type === PaymentAttachmentType.ORDERS ||
                elem.type === PaymentAttachmentType.CARDFILE ||
                elem.type === PaymentAttachmentType.OTHER ||
                elem.type === PaymentAttachmentType.WRITINGOUT
              ),
          ) || [];
        if (item.payment_attachments) {
          for (const paymentAttachment of item.payment_attachments) {
            delete paymentAttachment.id;
          }
        }
        if (item.defrayments) {
          for (const defrayment of item.defrayments) {
            delete defrayment.id;
          }
        }
        patchState({ selected: item, loading: false });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
