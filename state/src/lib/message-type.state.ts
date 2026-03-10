import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { MessageTypeService } from '@sotbi/data-access';
import type { itemMap } from '@sotbi/models';
import { MessageType } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AddMessageType,
  DeleteMessageType,
  FetchMessageTypes,
  UpdateMessageType,
} from './message-type.actions';

export class EfrsbMessageTypeStateModel {
  public items: MessageType[] = [];
  public activeItems: MessageType[] = [];
  public selected: MessageType | null = null;
  public maps: itemMap = new Map();
  public subMaps: Map<number, itemMap> = new Map();
}

@State<EfrsbMessageTypeStateModel>({
  name: 'efrsb_message_type',
  defaults: {
    items: [],
    activeItems: [],
    selected: null,
    maps: new Map(),
    subMaps: new Map(),
  },
})
@Injectable()
export class EfrsbMessageTypeState {
  private readonly itemsService = inject(MessageTypeService);

  private readonly empty = new MessageType();

  @Selector()
  public static getSelected(state: EfrsbMessageTypeStateModel) {
    return state.selected;
  }

  @Selector()
  public static getItems(state: EfrsbMessageTypeStateModel): MessageType[] {
    return state.items;
  }

  @Selector()
  public static getActiveItems(
    state: EfrsbMessageTypeStateModel,
  ): MessageType[] {
    return state.activeItems;
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
  public fetchMessageTypes({
    getState,
    setState,
  }: StateContext<EfrsbMessageTypeStateModel>) {
    const state = getState();
    // console.log('EfrsbMessageTypeState::FetchItems', state);
    if (!state.items.length) {
      return this.itemsService.GetAll().pipe(
        tap((items) => {
          const subMaps = new Map<number, itemMap>();
          const maps = new Map();
          for (const item of items) {
            maps.set(item.id, item.name);
            subMaps.set(
              item.id,
              new Map(item.sub_message_types?.map((a) => [a.id, a.name])),
            );
          }
          setState({
            ...state,
            selected: null,
            // убираем удаленные в типах и в подтипах сразу
            activeItems: items
              ?.filter((item) => !item?.deleted_at)
              .map((item) => ({
                ...item,
                sub_message_types:
                  item?.sub_message_types?.filter((sub) => !sub?.deleted_at) ||
                  [],
              })),
            items: [...items, Object.assign({}, this.empty)],
            maps,
            subMaps,
          });
        }),
        catchError((err) => throwError(() => err)),
      );
    }
    return of();
  }

  @Action(AddMessageType)
  public createItem(
    { getState, setState }: StateContext<EfrsbMessageTypeStateModel>,
    { payload }: AddMessageType,
  ) {
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

  @Action(UpdateMessageType)
  public updateItem(
    { getState, setState }: StateContext<EfrsbMessageTypeStateModel>,
    { payload }: UpdateMessageType,
  ) {
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

  @Action(DeleteMessageType)
  public deleteItem(
    { getState, setState }: StateContext<EfrsbMessageTypeStateModel>,
    { payload }: DeleteMessageType,
  ) {
    // console.log('EfrsbMessageTypeState::DeleteItem', payload);
    return this.itemsService.delete(payload).pipe(
      tap(() => {
        const state = getState();

        const items = state.items.map((el) =>
          el.id === payload ? { ...el, deleted_at: new Date() } : el,
        );

        const maps = new Map(state.maps);
        const item = state.items.find((el) => el.id === payload);
        if (item) {
          maps.set(payload, item.name);
        }

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
