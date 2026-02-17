import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { PaymentRequestService } from '@sotbi/data-access';
import {
  PaymentAttachmentType,
  PaymentRequest,
  StatusEnum,
} from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddDirtyPaymentRequest,
  AddPaymentRequest,
  DeletePaymentRequest,
  FetchPaymentRequests,
  GetPaymentRequest,
  UpdatePaymentRequest,
} from './payment-request.actions';

export class PaymentRequestStateModel {
  public items: PaymentRequest[] = [];
  public selected: PaymentRequest | null | undefined = null;
  public loading = false;
  public count = 0;
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

  @Action(FetchPaymentRequests)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<PaymentRequestStateModel>) {
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
    return;
  }

  @Action(GetPaymentRequest)
  public getItem(
    { patchState, getState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: GetPaymentRequest,
  ) {
    patchState({ loading: true });
    if (!payload) {
      const selected = new PaymentRequest();
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

  @Action(AddPaymentRequest)
  public createItem(
    { getState, patchState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: AddPaymentRequest,
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

  @Action(UpdatePaymentRequest)
  public updateItem(
    { getState, setState, patchState }: StateContext<PaymentRequestStateModel>,
    { payload }: UpdatePaymentRequest,
  ) {
    patchState({ loading: true });
    return this.itemsService.update(payload).pipe(
      tap((selected: PaymentRequest) => {
        const state = getState();
        const items = [
          ...state.items.map((item) =>
            item.id === selected.id ? selected : item,
          ),
        ];
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

  @Action(DeletePaymentRequest)
  public deleteItem(
    { getState, patchState, setState }: StateContext<PaymentRequestStateModel>,
    { payload }: DeletePaymentRequest,
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

  @Action(AddDirtyPaymentRequest)
  public addDirtyItem(
    { patchState }: StateContext<PaymentRequestStateModel>,
    { payload }: AddDirtyPaymentRequest,
  ) {
    patchState({ loading: true });
    return this.itemsService.get(payload).pipe(
      tap((item: PaymentRequest) => {
        item.status = StatusEnum.DRAFT;
        item.doer_comment = '';
        item.id = 0;
        item.histories = [];
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
            paymentAttachment.id = 0;
          }
        }
        if (item.defrayments) {
          for (const defrayment of item.defrayments) {
            defrayment.id = 0;
          }
        }
        patchState({ selected: item, loading: false });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
