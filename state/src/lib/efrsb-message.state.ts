import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { EfrsbMessageService, NOTIFICATION } from '@sotbi/data-access';
import type { Message, PublicationBySubMsgAndDebtor } from '@sotbi/models';
import { StatusEnum } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddEfrsbMessage,
  DeleteEfrsbMessage,
  FetchEfrsbMessages,
  GetEfrsbMessage,
  GetPublicationsBySubMessageIdAndDebtorId,
  UpdateEfrsbMessage,
} from './efrsb-message.actions';

export class EfrsbMessageStateModel {
  public items: Message[] = [];
  public selected: Message | null = null;
  public loading = false;
  public publications: PublicationBySubMsgAndDebtor[] = [];
}

@State<EfrsbMessageStateModel>({
  name: 'efrsb_message',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    publications: [],
  },
})
@Injectable()
export class EfrsbMessageState {
  private readonly itemsService = inject(EfrsbMessageService);
  private readonly notification = inject(NOTIFICATION, { optional: true });

  private readonly empty: Message = {
    id: 0,
    status: StatusEnum.DRAFT,
  } as Message;

  @Selector()
  public static getLoading(state: EfrsbMessageStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: EfrsbMessageStateModel): Message | null {
    return state.selected;
  }

  @Selector()
  public static getItems(state: EfrsbMessageStateModel): Message[] {
    return state.items;
  }

  @Selector()
  public static getPublications(
    state: EfrsbMessageStateModel,
  ): PublicationBySubMsgAndDebtor[] {
    return state.publications;
  }

  /** не используется */
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
    return of([]);
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
      return of(null);
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

  @Action(AddEfrsbMessage)
  public createItem(
    { getState, patchState, setState }: StateContext<EfrsbMessageStateModel>,
    { payload }: AddEfrsbMessage,
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

  @Action(UpdateEfrsbMessage)
  public updateItem(
    { getState, setState, patchState }: StateContext<EfrsbMessageStateModel>,
    { payload }: UpdateEfrsbMessage,
  ) {
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
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

  @Action(GetPublicationsBySubMessageIdAndDebtorId)
  public getPublicationsBySubMessageIdAndDebtorId(
    { patchState, getState, setState }: StateContext<EfrsbMessageStateModel>,
    { subMessageId, debtorId }: GetPublicationsBySubMessageIdAndDebtorId,
  ) {
    patchState({ loading: true });
    return this.itemsService
      .getPublicationsBySubMessageIdAndDebtorId(subMessageId, debtorId)
      .pipe(
        tap((items) => {
          setState({
            ...getState(),
            publications: items,
          });
        }),
        catchError((err) => {
          this.notification?.showError(
            err?.error || 'Произошла ошибка при поиске публикаций',
          );
          return throwError(() => err);
        }),
        finalize(() => patchState({ loading: false })),
      );
  }
}
