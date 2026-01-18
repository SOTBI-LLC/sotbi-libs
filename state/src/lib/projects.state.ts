import { Injectable, inject } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { forMap } from '@root/shared/rx-filtres';
import { ProjectService } from '@services/project.service';
import { Project } from '@sotbi/models';
import { clone } from 'ramda';
import { throwError } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, tap } from 'rxjs/operators';
import {
  AddItem,
  DeleteItem,
  EditItem,
  FetchAllProjects,
  FetchProjects,
  GetItem,
} from './projects.actions';
import { itemMap } from './simple-edit.state.model';

export class ProjectStateModel {
  public loading: boolean = false;
  public items: Project[] = [];
  public shortItems: Partial<Project>[] = [];
  public selected: Project = { id: 0, name: '' };
  public maps: itemMap = new Map();
}

@State<ProjectStateModel>({
  name: 'projects',
  defaults: {
    maps: new Map(),
    loading: false,
    items: [],
    shortItems: [],
    selected: null,
  },
})
@Injectable()
export class ProjectsState implements NgxsOnInit {
  private readonly prjSrv = inject(ProjectService);

  private readonly rowData: Project = {
    id: 0,
    name: '',
    // condition: ConditionType.ENTRY,
  };

  @Selector()
  public static getItems(state: ProjectStateModel) {
    return state.items;
  }

  @Selector()
  public static getAllItems(state: ProjectStateModel) {
    return state.shortItems;
  }

  @Selector()
  public static getMaps(state: ProjectStateModel) {
    return state.maps;
  }

  @Selector()
  public static getItem(state: ProjectStateModel) {
    return state.selected;
  }

  public ngxsOnInit({ dispatch }: StateContext<ProjectStateModel>) {
    dispatch(new FetchAllProjects());
  }

  @Action(FetchProjects, { cancelUncompleted: true })
  public fetchItems({ getState, setState, patchState }: StateContext<ProjectStateModel>) {
    const state = getState();
    if (!state.items.length) {
      return this.prjSrv.getAll$().pipe(
        tap({
          next: (result) => {
            if (!state.maps.size) {
              const maps = new Map(result.map(forMap));
              setState({
                ...state,
                items: result,
                maps,
              });
            } else {
              patchState({ items: result });
            }
          },
          error: (err) => {
            console.error(err.message);
          },
        }),
      );
    }
  }

  @Action(FetchAllProjects, { cancelUncompleted: true })
  public fetchAllItems({ getState, setState }: StateContext<ProjectStateModel>) {
    const state = getState();
    if (!state.shortItems.length) {
      return this.prjSrv.getAll$({ short: true }).pipe(
        distinctUntilChanged(),
        catchError((err) => throwError(() => err)),
        tap({
          next: (result) => {
            const maps = new Map(result.map(forMap));
            setState({
              ...state,
              shortItems: result,
              maps,
            });
          },
          error: (err) => {
            console.error(err.message);
          },
        }),
      );
    }
  }

  @Action(GetItem)
  public getItem(
    { patchState, getState, setState }: StateContext<ProjectStateModel>,
    { payload }: GetItem,
  ) {
    patchState({ loading: true });
    const state = getState();
    if (payload === 0) {
      return patchState({ loading: false, selected: Object.assign({}, this.rowData) });
    }
    if (state.items.length > 0) {
      const selected = state.items.find(({ id }) => id === payload);
      return setState({ ...state, selected, loading: false });
    } else {
      return this.prjSrv.get(payload).pipe(
        tap((result) => {
          setState({ ...state, selected: result, loading: false });
        }),
        catchError((err) => throwError(() => err)),
        finalize(() => patchState({ loading: false })),
      );
    }
  }

  @Action(AddItem)
  public addItem({ getState, setState }: StateContext<ProjectStateModel>, { payload }: AddItem) {
    return this.prjSrv.create(payload).pipe(
      tap((result) => {
        const state = getState();
        const maps = clone(state.maps);
        maps.set(result.id, result.name);
        const shortItem: Partial<Project> = { id: result.id, name: result.name };
        setState({
          ...state,
          items: [result, ...state.items],
          shortItems: [shortItem, ...state.shortItems],
          selected: result,
          maps,
        });
      }),
      catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
    );
  }

  @Action(EditItem)
  public editItem({ getState, setState }: StateContext<ProjectStateModel>, { payload }: EditItem) {
    const { id } = payload;
    delete payload.id;
    const state = getState();
    return this.prjSrv.save(id, payload).pipe(
      tap((selected: Project) => {
        const items = [...state.items.map((el) => (el.id === selected.id ? selected : el))];
        const maps = clone(state.maps);
        maps.set(selected.id, selected.name);
        const shortItem: Partial<Project> = { id: selected.id, name: selected.name };
        setState({
          ...state,
          items,
          shortItems: [shortItem, ...state.shortItems],
          selected,
          maps,
        });
      }),
      catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteItem)
  public deleteItem(
    { getState, setState }: StateContext<ProjectStateModel>,
    { payload }: DeleteItem,
  ) {
    return this.prjSrv.delete(payload).pipe(
      tap(() => {
        const state = getState();
        const maps = clone(state.maps);
        maps.delete(payload);
        setState({
          ...state,
          items: [...state.items.filter((el) => el.id !== payload)],
          shortItems: [...state.shortItems.filter((el) => el.id !== payload)],
          maps,
        });
      }),
      catchError((err) => {
        console.error(err.message);
        return throwError(() => err);
      }),
    );
  }
}
