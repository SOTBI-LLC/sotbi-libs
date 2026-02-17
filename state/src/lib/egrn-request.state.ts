import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { EgrnRequestService, RealEstateService } from '@sotbi/data-access';
import { EgrnAttachmentType, EgrnRequest } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddDirtyEgrnRequest,
  AddEgrnRequest,
  DeleteEgrnRequest,
  FetchEgrnRequests,
  GetEgrnRequest,
  RemoveRealEstate,
  UpdateEgrnRequest,
} from './egrn-request.actions';

export class EgrnRequestStateModel {
  public items: EgrnRequest[] = [];
  public selected: EgrnRequest | null = null;
  public loading = false;
  public count = 0;
}

@State<EgrnRequestStateModel>({
  name: 'egrn_request',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class EgrnRequestState {
  private readonly itemsService = inject(EgrnRequestService);
  private readonly realEstateServ = inject(RealEstateService);

  public readonly egrnAttachmentType = EgrnAttachmentType;

  @Selector()
  public static getLoading(state: EgrnRequestStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: EgrnRequestStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: EgrnRequestStateModel): EgrnRequest[] {
    return state.items;
  }

  public ngxsOnInit({ dispatch }: StateContext<EgrnRequestStateModel>) {
    dispatch(new FetchEgrnRequests());
  }

  @Action(FetchEgrnRequests)
  public fetchItems(
    { getState, setState, patchState }: StateContext<EgrnRequestStateModel>,
    { payload }: FetchEgrnRequests,
  ) {
    // console.log('EgrnState::FetchItems', payload);
    const state = getState();
    if (!state.items.length || payload.refresh) {
      patchState({ loading: true });
      this.itemsService.getall(new HttpParams(), payload.view).pipe(
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

  @Action(GetEgrnRequest)
  public getItem(
    { patchState }: StateContext<EgrnRequestStateModel>,
    { payload }: GetEgrnRequest,
  ) {
    patchState({ loading: true });
    if (!payload) {
      const selected: EgrnRequest = new EgrnRequest();
      return patchState({ selected });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((item) => patchState({ selected: item })),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddEgrnRequest)
  public createItem(
    { getState, patchState, setState }: StateContext<EgrnRequestStateModel>,
    { payload }: AddEgrnRequest,
  ) {
    // console.log('EgrnState::AddItem', payload);
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

  @Action(AddDirtyEgrnRequest)
  public AddDirtyItem(
    { patchState }: StateContext<EgrnRequestStateModel>,
    { payload }: AddDirtyEgrnRequest,
  ) {
    return this.itemsService.get(payload).pipe(
      tap((item: EgrnRequest) => {
        item.request_num = null;
        item.key = null;
        item.doer_comment = null;
        // удаляю перед дублированием файл результата
        item.egrn_attachments = item.egrn_attachments?.filter(
          (elem) => elem.type !== this.egrnAttachmentType.RESULT,
        );
        if (item.egrn_attachments) {
          for (const egrnAttachment of item.egrn_attachments) {
            delete egrnAttachment.id;
          }
        }
        if (item.real_estates) {
          for (const realEstate of item.real_estates) {
            realEstate.id = 0;
            realEstate.file = null;
            realEstate.original_file_name = null;
            realEstate.request_num = null;
            realEstate.key = null;
          }
        }
        patchState({ selected: item });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateEgrnRequest)
  public updateItem(
    { getState, setState, patchState }: StateContext<EgrnRequestStateModel>,
    { payload }: UpdateEgrnRequest,
  ) {
    // console.log('EgrnState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    // delete payload.request_type;
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        state.items[idx] = selected;
        setState({
          ...state,
          items: state.items,
          selected,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteEgrnRequest)
  public deleteItem(
    { getState, patchState, setState }: StateContext<EgrnRequestStateModel>,
    { payload }: DeleteEgrnRequest,
  ) {
    // console.log('EgrnState::DeleteItem', payload);
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

  @Action(RemoveRealEstate)
  public removeRealEstate(
    { getState, patchState, setState }: StateContext<EgrnRequestStateModel>,
    { payload }: RemoveRealEstate,
  ) {
    const { /*idx,*/ id } = payload;
    // console.log('EgrnState::RemoveRealEstate', idx, id);
    patchState({ loading: true });
    return this.realEstateServ.delete(id).pipe(
      tap(() => {
        const state = getState();
        if (state.selected) {
          const item = structuredClone(state.selected);
          item.real_estates =
            item.real_estates.filter((el) => el.id === id) ?? [];
          const ind = state.items.findIndex((el) => el.id === item.id);
          state.items[ind] = item;
          setState({
            ...state,
            items: state.items,
            selected: item,
          });
        }
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
