import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { EfrsbMessageService } from '@sotbi/data-access';
import type { Message } from '@sotbi/models';
import { StatusEnum } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEfrsbMessage,
  DeleteEfrsbMessage,
  FetchEfrsbMessages,
  GetEfrsbMessage,
  UpdateEfrsbMessage,
} from './efrsb-message.actions';

export class EfrsbMessageStateModel {
  public items: Message[] = [];
  public selected: Message | null = null;
  public loading = false;
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

  private readonly empty: Message = {
    id: 0,
    status: StatusEnum.DRAFT,
  } as Message;

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

  @Action(FetchEfrsbMessages)
  public fetchItems({
    getState,
    setState,
    patchState,
  }: StateContext<EfrsbMessageStateModel>) {
    const state = getState();
    if (!state.items.length) {
      patchState({ loading: true });
      // по факту отдаёт только 25 элементов
      this.itemsService.getAllMessages(new HttpParams()).pipe(
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

  @Action(GetEfrsbMessage)
  public getItem(
    { patchState, getState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: GetEfrsbMessage,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (payload === 0) {
      patchState({ selected: this.empty, loading: false });
      return;
    }
    this.itemsService.get(payload).pipe(
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

  @Action(AddEfrsbMessage)
  public createItem(
    { getState, patchState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: AddEfrsbMessage,
  ) {
    patchState({ loading: true });
    this.itemsService.add(payload).pipe(
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

  @Action(UpdateEfrsbMessage)
  public updateItem(
    { getState, setState, patchState }: StateContext<EfrsbMessageStateModel>,
    { payload }: UpdateEfrsbMessage,
  ) {
    patchState({ loading: true });
    const state = getState();
    this.itemsService.update(payload).pipe(
      tap((selected) => {
        setState({
          ...state,
          items: state.items.map((el) =>
            el.id === selected.id ? selected : el,
          ),
          selected: selected,
        });
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteEfrsbMessage)
  public deleteItem(
    { getState, patchState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: DeleteEfrsbMessage,
  ) {
    patchState({ loading: true });
    this.itemsService.delete(payload).pipe(
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
