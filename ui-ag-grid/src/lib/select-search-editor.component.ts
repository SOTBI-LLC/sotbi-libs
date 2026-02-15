import { AsyncPipe } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Component, inject, viewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BidcodeService } from '@services/bidcode.service';
import type { PaymentDocument, SimpleEditModel } from '@sotbi/models';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { GridApi, ICellEditorParams } from 'ag-grid-community';
import type { Observable } from 'rxjs';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'select-cell',
  template: `
    <div class="select">
      <ng-select
        #select
        name="select"
        [items]="value$ | async"
        [multiple]="false"
        [searchable]="true"
        notFoundText="Не найдено"
        bindLabel="name"
        class="clr multiselect"
        appendTo="body"
        id="select"
        (change)="stopEditing()"
        [(ngModel)]="value"
        [closeOnSelect]="true"
        [trackByFn]="trackByFn"
        [minTermLength]="2"
        typeToSearchText="мин. 2 символа для поиска"
        [typeahead]="textInput$"
      ></ng-select>
    </div>
  `,
  styleUrls: ['select-search-editor.component.scss'],
  imports: [NgSelectComponent, FormsModule, AsyncPipe],
})
export class SelectSearchTradingCodeEditor
  implements ICellEditorAngularComp, AfterViewInit
{
  private readonly tcSvr = inject(BidcodeService);

  protected readonly textInput$ = new Subject<string>();
  protected value$: Observable<SimpleEditModel[]>;
  protected value: SimpleEditModel;
  private api: GridApi;
  private readonly select = viewChild.required('select', {
    read: ViewContainerRef,
  });

  protected trackByFn(item: SimpleEditModel) {
    return item.id;
  }

  public agInit({
    data,
    value,
    api,
  }: ICellEditorParams<PaymentDocument, number>): void {
    this.api = api;
    this.value$ = concat(
      of([]), // default items
      this.textInput$.pipe(
        distinctUntilChanged(),
        switchMap((term) => {
          if (!(term === '' || term === null)) {
            return this.tcSvr.GetAll(term, { limit: 25 }).pipe(
              // map((res) => res as any[]),
              catchError(() => of([])), // empty list on error
            );
          }
          return of([]);
        }),
      ),
    );
    if (value) {
      this.value = {
        id: value,
        name: data?.trading_code?.name,
      } as SimpleEditModel;
    }
  }

  public getValue(): number {
    return (this.value && this.value.id) || null;
  }

  public stopEditing() {
    this.api.stopEditing();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.select().element.nativeElement.focus();
    });
  }
}
