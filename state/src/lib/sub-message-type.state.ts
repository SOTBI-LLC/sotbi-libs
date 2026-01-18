import { inject, Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { SubMessageTypeService } from '@services/sub-message-type.service';
import { SubMessageType } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { itemMap } from './simple-edit.state.model';
import { AddItem, DeleteItem, FetchSubMessageTypes, UpdateItem } from './sub-message-type.actions';

export interface EfrsbSubMessageTypeStateModel {
  items: SubMessageType[];
  selected: SubMessageType;
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
  public static getItems(state: EfrsbSubMessageTypeStateModel): SubMessageType[] {
    return state.items;
  }

  @Selector()
  public static getMaps(state: EfrsbSubMessageTypeStateModel) {
    return state.maps;
  }

  public static filtered(typeId: number) {
    return createSelector([EfrsbSubMessageTypeState], ({ items }) => {
      return items.filter((item: SubMessageType) => item.message_type_id === typeId);
    });
  }

  public ngxsOnInit({ dispatch }: StateContext<EfrsbSubMessageTypeStateModel>) {
    dispatch(new FetchSubMessageTypes());
  }

  @Action(FetchSubMessageTypes)
  public fetchSubMessageTypes({ getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>) {
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
        catchError((err) => throwError(err)),
      );
    }
  }

  @Action(AddItem)
  public createItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload },
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
      catchError((err) => throwError(err)),
    );
  }

  @Action(UpdateItem)
  public updateItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload },
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
      catchError((err) => throwError(err)),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, setState }: StateContext<EfrsbSubMessageTypeStateModel>,
    { payload },
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
      catchError((err) => throwError(err)),
    );
  }
}
