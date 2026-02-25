import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, createSelector, Selector, State } from '@ngxs/store';
import { SubMessageTypeService } from '@sotbi/data-access';
import type { SubMessageType } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { itemMap } from './simple-edit.state.model';
import {
  AddSubMessageType,
  DeleteSubMessageType,
  FetchSubMessageTypes,
  UpdateSubMessageType,
} from './sub-message-type.actions';

export interface EfrsbSubMessageTypeStateModel {
  items: SubMessageType[];
  selected: SubMessageType | null | undefined;
  maps: itemMap;
}

@State<EfrsbSubMessageTypeStateModel>({
  name: 'efrsb_sub_message_type',
  defaults: {
    items: [],
    selected: null,
    maps: new Map(),
  },
})
@Injectable()
export class EfrsbSubMessageTypeState {
  private readonly itemsService = inject(SubMessageTypeService);

  private readonly empty: SubMessageType = {
    message_type_id: 0,
    // message_type: emptySimpleEdit,
  } as SubMessageType;

  @Selector()
  public static getSelected(state: EfrsbSubMessageTypeStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(
    state: EfrsbSubMessageTypeStateModel,
  ): SubMessageType[] {
    return state.items;
  }

  @Selector()
  public static getMaps(state: EfrsbSubMessageTypeStateModel) {
    return state.maps;
  }

  public static filtered(typeId: number) {
    return createSelector([EfrsbSubMessageTypeState], ({ items }) => {
      return items.filter(
        (item: SubMessageType) => item.message_type_id === typeId,
      );
    });
  }

  public ngxsOnInit({ dispatch }: StateContext<EfrsbSubMessageTypeStateModel>) {
    dispatch(new FetchSubMessageTypes());
  }

  @Action(FetchSubMessageTypes)
  public fetchSubMessageTypes({
    getState,
    setState,
  }: StateContext<EfrsbSubMessageTypeStateModel>) {
    const state = getState();
    // console.log('EfrsbSubMessageTypeState::FetchItems', state);
    if (!state.items.length) {
      return this.itemsService.GetAll().pipe(
        tap((items) => {
          const maps = new Map(items.map((item) => [item.id, item.name]));
          setState({
            ...state,
            selected: null,
            items: [...items, Object.assign({}, this.empty)],
            maps,
          });
        }),
        catchError((err) => throwError(() => err)),
      );
    }
    return of();
  }

  @Action(AddSubMessageType)
  public createItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload }: AddSubMessageType,
  ) {
    // console.log('EfrsbSubMessageTypeState::AddItem', payload);
    return this.itemsService.add(payload).pipe(
      tap((result) => {
        const state = getState();
        const items = state.items.filter(({ id }) => id != null);
        const maps = state.maps;
        maps.set(result.id, result.name);
        setState({
          ...state,
          items: [...items, result, Object.assign({}, this.empty)],
          selected: result,
          maps,
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(UpdateSubMessageType)
  public updateItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload }: UpdateSubMessageType,
  ) {
    // console.log('EfrsbSubMessageTypeState::UpdateItem', payload);
    const state = getState();
    return this.itemsService.update(payload).pipe(
      tap((selected) => {
        const idx = state.items.findIndex(({ id }) => id === selected.id);
        state.items[idx] = selected;
        const maps = state.maps;
        maps.set(selected.id, selected.name);
        setState({
          ...state,
          items: state.items,
          selected,
          maps,
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(DeleteSubMessageType)
  public deleteItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload }: DeleteSubMessageType,
  ) {
    // console.log('EfrsbSubMessageTypeState::DeleteItem', payload);
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const items = state.items.filter((el) => el.id !== payload);
        const maps = state.maps;
        maps.delete(payload);
        setState({
          ...state,
          items,
          maps,
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }
}
