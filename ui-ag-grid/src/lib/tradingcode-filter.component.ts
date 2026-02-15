import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BidcodeService } from '@sotbi/data-access';
import type { SimpleEditModel, TradingCode } from '@sotbi/models';
import type { IFilterParams } from 'ag-grid-community';
import type { Observable } from 'rxjs';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AgGridFilterType } from './ag-grid.common';

interface TradingCodeFilterModel {
  values: string[];
  filterType: AgGridFilterType;
}

@Component({
  template: `
    <div class="container">
      <ng-select
        class="clr multiselect payments-top-ctrls__labels"
        [multiple]="true"
        [clearable]="true"
        name="tc"
        id="tc"
        [items]="(value$ | async) ?? []"
        bindLabel="name"
        bindValue="id"
        notFoundText="Не найдено"
        placeholder="Выберите код торгов"
        [closeOnSelect]="true"
        (change)="onChange($event)"
        [trackByFn]="trackByFn"
        [minTermLength]="2"
        typeToSearchText="мин. 2 символа для поиска"
        [typeahead]="textInput$"
      ></ng-select>
    </div>
  `,
  styles: [
    `
      .container {
        height: 11rem;
        width: 16rem;
        max-width: 16rem;
        overflow: hidden;
      }
      /* увеличиваем инпут поля 'выберите код торгов' */
      ::ng-deep
        .ng-select.ng-select-multiple
        .ng-select-container
        .ng-value-container {
        padding: 3px;
      }
    `,
  ],
  imports: [NgSelectComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingCodeFilterComponent {
  private readonly tcSvr = inject(BidcodeService);

  protected readonly textInput$ = new Subject<string>();
  protected value$: Observable<TradingCode[]> = of([] as TradingCode[]);
  private params: IFilterParams | null = null;
  private result: number[] = [];

  protected readonly trackByFn = (item: SimpleEditModel) => item.id;

  public agInit(params: IFilterParams) {
    this.params = params;
    this.value$ = concat(
      of([] as TradingCode[]), // default items
      this.textInput$.pipe(
        distinctUntilChanged(),
        switchMap((term: string) => {
          if (!(term === '' || term === null)) {
            return this.tcSvr.GetAll(term, { limit: 25 }).pipe(
              catchError(() => of([] as TradingCode[])), // empty list on error
            );
          }
          return of([] as TradingCode[]);
        }),
      ),
    );
  }

  public isFilterActive(): boolean {
    return this.result.length > 0;
  }

  public doesFilterPass(): boolean {
    return true;
  }

  protected onChange(items: TradingCode[]) {
    this.result = items.map((el) => el.id);
    if (this.params) {
      this.params.filterChangedCallback();
    }
  }

  public setModel(model: TradingCodeFilterModel) {
    this.result = model ? model.values.map((el) => Number(el)) : [];
  }

  public getModel(): TradingCodeFilterModel | null {
    if (this.result.length > 0) {
      return {
        values: this.result.map((el) => el + ''),
        filterType: AgGridFilterType.SET,
      };
    }
    return null;
  }
}
