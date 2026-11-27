import { inject, Injectable } from '@angular/core';
import type { StateContext } from '@ngxs/store';
import { Action, Selector, State } from '@ngxs/store';
import { AppraiserService } from '@sotbi/data-access';
import type { CatalogAppraiser } from '@sotbi/models';
import { tap } from 'rxjs';
import {
  DeleteAppraiser,
  FetchAppraisers,
  SaveAppraiser,
} from './appraisers.actions';

interface AppraisersStateModel {
  items: CatalogAppraiser[];
}

@State<AppraisersStateModel>({
  name: 'catalogAppraisers',
  defaults: { items: [] },
})
@Injectable()
export class AppraisersState {
  private readonly service = inject(AppraiserService);

  @Selector()
  public static getAppraisers(state: AppraisersStateModel): CatalogAppraiser[] {
    return state.items;
  }

  @Action(FetchAppraisers)
  public fetch(ctx: StateContext<AppraisersStateModel>) {
    return this.service
      .getAll()
      .pipe(tap((items) => ctx.patchState({ items })));
  }

  @Action(SaveAppraiser)
  public save(
    ctx: StateContext<AppraisersStateModel>,
    { item, id }: SaveAppraiser,
  ) {
    const request =
      id === undefined
        ? this.service.create(item)
        : this.service.save(item, id);
    return request.pipe(
      tap((saved) => {
        const { items } = ctx.getState();
        ctx.patchState({
          items:
            id === undefined
              ? [...items, saved]
              : items.map((row) => (row.id === id ? saved : row)),
        });
      }),
    );
  }

  @Action(DeleteAppraiser)
  public delete(
    ctx: StateContext<AppraisersStateModel>,
    { id }: DeleteAppraiser,
  ) {
    return this.service.delete(id).pipe(
      tap(() => {
        ctx.patchState({
          items: ctx.getState().items.filter((item) => item.id !== id),
        });
      }),
    );
  }
}
