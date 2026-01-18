import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { MessageTypeService } from '@services/message-type.service';
import { MessageType } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AddItem, DeleteItem, FetchMessageTypes, UpdateItem } from './message-type.actions';
import { itemMap } from './simple-edit.state.model';

export interface EfrsbMessageTypeStateModel {
  items: Partial<MessageType>[];
  selected: MessageType;
  maps: itemMap;
  subMaps: Map<number, itemMap>;
}

@State<EfrsbMessageTypeStateModel>({
  name: 'efrsb_message_type',
  defaults: {
    items: [],
    selected: null,
    maps: new Map(),
    subMaps: new Map(),
  },
})
@Injectable()
export class EfrsbMessageTypeState {
  private readonly itemsService = inject(MessageTypeService);

  private readonly empty: Partial<MessageType> = {
    id: 0,
  };

  @Selector()
  public static getSelected(state: EfrsbMessageTypeStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: EfrsbMessageTypeStateModel): Partial<MessageType>[] {
    return state.items;
  }

  @Selector()
  public static getMaps(state: EfrsbMessageTypeStateModel) {
    return state.maps;
  }

  @Selector()
  public static getSubMaps(state: EfrsbMessageTypeStateModel) {
    return state.subMaps;
  }

  public ngxsOnInit({ dispatch }: StateContext<EfrsbMessageTypeStateModel>) {
    dispatch(new FetchMessageTypes());
  }

  @Action(FetchMessageTypes, { cancelUncompleted: true })
  public fetchMessageTypes({ getState, setState }: StateContext<EfrsbMessageTypeStateModel>) {
    const state = getState();
    // console.log('EfrsbMessageTypeState::FetchItems', state);
    if (!state.items.length) {
      return this.itemsService.GetAll().pipe(
        tap((items) => {
          const subMaps = new Map<number, itemMap>();
          const maps = new Map();
          for (const item of items) {
            maps.set(item.id, item.name);
            subMaps.set(item.id, new Map(item.sub_message_types?.map((a) => [a.id, a.name])));
          }
          setState({
            ...state,
            selected: null,
            items: [...items, Object.assign({}, this.empty)],
            maps,
            subMaps,
          });
        }),
        catchError((err) => throwError(() => err)),
      );
    }
  }

  @Action(AddItem)
  public createItem({ getState, setState }: StateContext<EfrsbMessageTypeStateModel>, { payload }) {
    // console.log('EfrsbMessageTypeState::AddItem', payload);
    return this.itemsService.add(payload).pipe(
      tap((result) => {
        const state = getState();
        const items = state.items.filter(({ id }) => id != null);
        const maps = state.maps;
        maps.set(result.id, result.name);
        setState({
          ...state,
          items: [...items, Object.assign({}, this.empty)],
          selected: result,
          maps,
        });
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  @Action(UpdateItem)
  public updateItem({ getState, setState }: StateContext<EfrsbMessageTypeStateModel>, { payload }) {
    // console.log('EfrsbMessageTypeState::UpdateItem', payload);
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

  @Action(DeleteItem)
  public deleteItem({ getState, setState }: StateContext<EfrsbMessageTypeStateModel>, { payload }) {
    // console.log('EfrsbMessageTypeState::DeleteItem', payload);
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
