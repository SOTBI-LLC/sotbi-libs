import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import type { SimpleEditModel, TradingCode } from '@sotbi/models';
import { AgGridFilterType } from '../ag-grid.common';
import type { IFilterParams } from 'ag-grid-community';
import type { Observable} from 'rxjs';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';

export interface TradingCodeFilterParams extends IFilterParams {
  searchTradingCodes: (term: string) => Observable<SimpleEditModel[]>;
}

export interface TradingCodeFilterModel {
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
        [items]="(value$ | async) || []"
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
      ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value-container {
        padding: 3px;
      }
    `,
  ],
  imports: [NgSelectComponent, AsyncPipe],
})
export class TradingCodeFilterComponent {
  protected readonly textInput$ = new Subject<string>();
  protected value$!: Observable<SimpleEditModel[]>;
  private params!: TradingCodeFilterParams;
  private result: number[] = [];

  protected readonly trackByFn = (item: SimpleEditModel) => item.id;

  public agInit(params: TradingCodeFilterParams) {
    this.params = params;
    this.value$ = concat(
      of([]), // default items
      this.textInput$.pipe(
        distinctUntilChanged(),
        switchMap((term) => {
          if (!(term === '' || term === null)) {
            return this.params.searchTradingCodes(term).pipe(
              catchError(() => of([])), // empty list on error
            );
          }
          return of([]);
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
    this.params.filterChangedCallback();
  }

  public setModel(model: TradingCodeFilterModel | null) {
    this.result = model ? model.values.map((el) => Number(el)) : [];
  }

  public getModel(): TradingCodeFilterModel | null {
    if (this.result.length > 0) {
      return { values: this.result.map((el) => el + ''), filterType: AgGridFilterType.SET };
    }
    return null;
  }
}
