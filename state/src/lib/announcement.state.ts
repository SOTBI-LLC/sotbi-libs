import { Injectable, inject } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { AnnouncementService } from '@sotbi/data-access';
import type { Announcement } from '@sotbi/models';
import { DatePublish } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  AddItem,
  DeleteItem,
  FetchItems,
  GetItem,
  UpdateItem,
} from './announcement.actions';

export interface AnnouncementStateModel {
  items: Announcement[];
  selected: Announcement | null;
  loading: boolean;
  count: number;
}

@State<AnnouncementStateModel>({
  name: 'announcement',
  defaults: {
    items: [],
    loading: false,
    selected: null,
    count: 0,
  },
})
@Injectable()
export class AnnouncementState {
  private readonly itemsService = inject(AnnouncementService);

  @Selector()
  public static getLoading(state: AnnouncementStateModel): boolean {
    return state.loading;
  }

  @Selector()
  public static getSelected(state: AnnouncementStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: AnnouncementStateModel): Announcement[] {
    return state.items;
  }

  @Action(FetchItems)
  public FetchItems(
    { getState, setState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: FetchItems,
  ) {
    // console.log('AnnouncementState::FetchItems');
    if (!payload) {
      payload = { all: false, refresh: true };
    }
    const state = getState();
    if (!state.items.length || payload.refresh) {
      patchState({ loading: true });
      return this.itemsService
        .getAllWithCondition(
          payload.all,
          payload.show_planned,
          payload.omit_img,
        )
        .pipe(
          tap((items) => {
            setState({
              ...state,
              selected: null,
              items,
              count: items.length,
            });
          }),
          catchError((err) => throwError(err)),
          finalize(() => patchState({ loading: false })),
        );
    }
    return undefined;
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState, setState }: StateContext<AnnouncementStateModel>,
    { payload }: GetItem,
  ) {
    const state = getState();
    patchState({ loading: true });
    if (!payload) {
      const selected: Announcement = {
        id: 0,
        new: true,
        title: null,
        content: null,
        creator_id: 0,
        date_publish: DatePublish.NOW,
        start: null,
        end: null,
        author_id: 0,
      };
      return setState({
        ...state,
        selected,
        loading: false,
      });
    } else {
      return this.itemsService.get(payload).pipe(
        tap((selected) =>
          setState({
            ...state,
            selected,
          }),
        ),
        catchError((err) => throwError(err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, patchState, setState }: StateContext<AnnouncementStateModel>,
    { payload }: AddItem,
  ) {
    // console.log('AnnouncementState::AddItem', payload);
    patchState({ loading: true });
    return this.itemsService.add(removeID(payload)).pipe(
      tap((selected) => {
        const state = getState();
        setState({
          ...state,
          items: [selected, ...state.items],
          selected,
          count: state.count + 1,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(UpdateItem)
  public UpdateItem(
    { getState, setState, patchState }: StateContext<AnnouncementStateModel>,
    { payload }: UpdateItem,
  ) {
    // console.log('AnnouncementState::UpdateItem', payload);
    patchState({ loading: true });
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const items = state.items.map((item) =>
          item.id === selected.id ? selected : item,
        );
        setState({
          ...state,
          items,
          selected,
        });
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, patchState, setState }: StateContext<AnnouncementStateModel>,
    { payload }: DeleteItem,
  ) {
    // console.log('AnnouncementState::DeleteItem', payload);
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
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => patchState({ loading: false })),
    );
  }
}
