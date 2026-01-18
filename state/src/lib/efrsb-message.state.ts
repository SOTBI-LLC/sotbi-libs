import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { EfrsbMessageService } from '@services/efrsb-message.service';
import { Message, StatusEnum } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, FetchItems, GetItem, UpdateItem } from './efrsb-message.actions';

export interface EfrsbMessageStateModel {
  items: Message[];
  selected: Message;
  loading?: boolean;
}

@State<EfrsbMessageStateModel>({
  name: 'efrsb_message',
  defaults: {
    items: [],
    loading: false,
    selected: null,
  },
})
@Injectable()
export class EfrsbMessageState {
  private readonly itemsService = inject(EfrsbMessageService);

  private readonly empty: Message = { id: 0, status: StatusEnum.DRAFT } as Message;

  @Selector()
  public static getLoading(state: EfrsbMessageStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: EfrsbMessageStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: EfrsbMessageStateModel): Message[] {
    return state.items;
  }

  @Action(FetchItems)
  public fetchItems({ getState, setState, patchState }: StateContext<EfrsbMessageStateModel>) {
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      // по факту отдаёт только 25 элементов
      return this.itemsService.getAllMessages(new HttpParams()).pipe(
        tap((res) => {
          setState({
            ...state,
            selected: null,
            items: res.requests,
          });
        }),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: GetItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (payload === 0) {
      return patchState({ selected: this.empty, loading: false });
    }
    return this.itemsService.get(payload).pipe(
      tap((item) => {
        setState({
          ...state,
          selected: item,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: AddItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.add(payload).pipe(
      tap((result) => {
        const state = getState();
        setState({
          ...state,
          items: [...state.items, result],
          selected: result,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, setState, patchState }: StateContext<EfrsbMessageStateModel>,
    { payload }: UpdateItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        setState({
          ...state,
          items: state.items.map((el) => (el.id === selected.id ? selected : el)),
          selected: selected,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: DeleteItem,
  ) {
    patchState({ loading: true });
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        setState({
          ...state,
          items: state.items.filter((el) => el.id !== payload),
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }
}
