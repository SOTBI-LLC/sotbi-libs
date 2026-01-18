import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { StaffService } from '@root/service/staff.service';
import { Staff, StaffFlat, StaffGroupType } from '@sotbi/models';
import { throwError } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, tap } from 'rxjs/operators';
import { itemMap } from './simple-edit.state.model';
import {
  AddStaff,
  DeleteStaff,
  EditStaff,
  FetchFlatStaff,
  FetchRPG,
  FetchStaffs,
  GetStaff,
  LoadTree,
} from './staffs.actions';
import { FetchUsers } from './users.actions';

export class StaffStateModel {
  public items: Staff[];
  public tree: Staff[];
  public maps: Map<number, itemMap>;
  public flatItems: StaffFlat[];
  public selectedItem: Staff;
  public loading?: boolean;
}

@State<StaffStateModel>({
  name: 'staff',
  defaults: {
    items: [],
    tree: [],
    maps: new Map(),
    flatItems: [],
    selectedItem: null,
    loading: false,
  },
})
@Injectable()
export class StaffsState {
  private readonly staffService = inject(StaffService);

  @Selector()
  public static getItems(state: StaffStateModel) {
    return state.items;
  }

  @Selector()
  public static getTree(state: StaffStateModel) {
    return state.tree;
  }

  @Selector()
  public static getMaps(state: StaffStateModel) {
    return state.maps;
  }

  @Selector()
  public static getFlatItems(state: StaffStateModel) {
    return state.flatItems;
  }

  @Selector()
  public static selected(state: StaffStateModel) {
    return state.selectedItem;
  }

  @Selector()
  public static getLoading(state: StaffStateModel): boolean {
    return state.loading;
  }

  @Action(FetchStaffs, { cancelUncompleted: true })
  public fetchItems(
    { getState, setState, patchState }: StateContext<StaffStateModel>,
    { payload },
  ) {
    // console.log('StaffsState::FetchStaffs', payload);
    const state = getState();
    patchState({ loading: true });
    let param = {};
    if (payload && payload.length > 0) {
      param = { staff: payload.join(',') };
    }
    return this.staffService.getAll$(param).pipe(
      tap({
        next: (items: Staff[]) => {
          let res = new Map(
            items.map((i): [number, string] => [
              i.id,
              `${i.name ? i.name : ''} ${i.user?.user || ''}`,
            ]),
          );
          const maps = new Map();
          maps.set(0, res);
          let filtered = items.filter((el) => el.type === StaffGroupType.WORKGROUP);
          res = new Map(filtered.map((i): [number, string] => [i.id, i.user?.user]));
          maps.set(StaffGroupType.WORKGROUP, res);
          filtered = items.filter((el) => el.type === StaffGroupType.DEPARTMENT);
          res = new Map(filtered.map((i): [number, string] => [i.id, i.user?.user]));
          maps.set(StaffGroupType.DEPARTMENT, res);
          setState({
            ...state,
            items,
            maps,
          });
        },
        error: (error) => {
          console.error(error.message);
        },
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(FetchRPG, { cancelUncompleted: true })
  public fetchRPGs({ getState, setState, patchState }: StateContext<StaffStateModel>) {
    console.log('StaffsState::FetchRPG');
    const state = getState();
    patchState({ loading: true });
    return this.staffService.getRPG$().pipe(
      distinctUntilChanged(),
      tap((items) => {
        const maps = new Map();
        let filtered = items.filter((el) => el.type === StaffGroupType.WORKGROUP);
        let res = new Map(filtered.map((i): [number, string] => [i.id, i.user?.user]));
        maps.set(StaffGroupType.WORKGROUP, res);
        filtered = items.filter((el) => el.type === StaffGroupType.DEPARTMENT);
        res = new Map(filtered.map((i): [number, string] => [i.id, i.user?.user]));
        maps.set(StaffGroupType.DEPARTMENT, res);
        setState({
          ...state,
          items,
          maps,
        });
      }),
      catchError((err) => {
        return throwError(err);
      }),
    );
  }

  @Action(LoadTree)
  public loadTree({ patchState }: StateContext<StaffStateModel>) {
    // console.log('StaffsState::LoadTree');
    patchState({ loading: true });
    return this.staffService.getTree().pipe(
      distinctUntilChanged(),
      tap((tree) => {
        patchState({ tree });
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(FetchFlatStaff)
  public fetchFlatStaff({ patchState }: StateContext<StaffStateModel>) {
    // console.log('StaffsState::LoadFlatStaff');
    patchState({ loading: true });
    return this.staffService.getSortUnits().pipe(
      distinctUntilChanged(),
      tap((items) => {
        patchState({ flatItems: items });
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(GetStaff, { cancelUncompleted: true })
  public getItem({ getState, patchState }: StateContext<StaffStateModel>, { payload }) {
    patchState({ loading: true });
    if (payload === 0) {
      const staff = { id: 0, parent_id: 0, name: '', active: true } as Staff;
      return patchState({ selectedItem: staff, loading: false });
    }
    const state = getState();
    let selected: Staff;
    if (state.items.length > 0) {
      selected = state.items.find(({ id }) => id === payload);
      return patchState({ selectedItem: selected, loading: false });
    } else {
      return this.staffService.get$(payload).pipe(
        tap((item) => {
          patchState({ selectedItem: item });
        }),
        finalize(() => patchState({ loading: false })),
        catchError((err) => throwError(err)),
      );
    }
  }

  @Action(AddStaff)
  public addStaff({ dispatch, patchState }: StateContext<StaffStateModel>, { payload }) {
    console.log('StaffsState::AddStaff', payload);
    patchState({ loading: true });
    return this.staffService.create(payload).pipe(
      tap((selectedItem) => {
        dispatch(new LoadTree());
        patchState({ selectedItem });
      }),
      finalize(() => {
        patchState({ loading: false });
      }),
    );
  }

  @Action(EditStaff)
  public editStaff({ dispatch, patchState }: StateContext<StaffStateModel>, { payload }) {
    console.log('StaffsState::EditStaff', payload);
    patchState({ loading: true });
    return this.staffService.save$(payload).pipe(
      tap((selectedItem) => {
        dispatch(new LoadTree());
        patchState({ selectedItem });
      }),
      finalize(() => {
        dispatch(new FetchUsers({ loadFired: true, refresh: true }));
        patchState({ loading: false });
      }),
      catchError((err) => throwError(err)),
    );
  }

  @Action(DeleteStaff)
  public deleteStaff({ dispatch, patchState }: StateContext<StaffStateModel>, { payload }) {
    console.log('StaffsState::DeleteStaff', payload);
    patchState({ loading: true });
    return this.staffService.delete(payload).pipe(
      tap(() => {
        dispatch(new LoadTree());
        patchState({ loading: false, selectedItem: null });
      }),
      catchError((err) => {
        patchState({ loading: false });
        return throwError(err);
      }),
    );
  }
}
