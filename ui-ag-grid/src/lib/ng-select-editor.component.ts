import { NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgLabelTemplateDirective,
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridApi, ICellEditorParams } from 'ag-grid-community';
import { UserWithAvatarComponent } from '../user-list/user-with-avatar.component';

@Component({
  template: `
    <ng-select
      class="ng-select"
      [clearable]="clearable"
      name="ngSelect"
      id="ngSelect"
      #ngSelect="ngModel"
      [items]="values"
      [bindLabel]="bindName"
      [bindValue]="bindId"
      [(ngModel)]="value"
      notFoundText="Не найдено"
      appendTo="body"
      [searchFn]="customSearchFn"
    >
      <ng-template ng-option-tmp let-item="item">
        <span
          [ngStyle]="
            (item.name === item.project_name && {
              background: 'rgba(0,0,0,0.1',
              display: 'flex',
              padding: '0 0 0 16px',
              margin: '0 -16px',
            }) || { padding: '0 0 0 32px' }
          "
          >{{ item.name }}&nbsp;</span
        >
        @if (item.name !== item.project_name && item.project_name) {
          <span style="color: grey">({{ item.project_name }})</span>
        }
      </ng-template>
    </ng-select>
  `,
  styles: [
    `
      ::ng-deep ng-dropdown-panel.ng-dropdown-panel .ng-dropdown-panel-items div.ng-option {
        white-space: pre;
        cursor: pointer;
      }
      ::ng-deep .ng-dropdown-panel.ng-select-bottom {
        width: 20% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective, NgStyle],
})
export class ProjectAndDebtorSelectEditor<T> implements ICellEditorAngularComp, AfterViewInit {
  protected values: T[];
  protected value: number;
  protected bindId = 'id';
  protected bindName = 'name';
  protected clearable = false;
  private readonly input = viewChild.required('ngSelect', { read: ViewContainerRef });

  public agInit(params: ICellEditorParams): void {
    this.values = params['values'];
    this.bindId = params['bindId'] ?? 'id';
    this.bindName = params['bindName'] ?? 'name';
    this.clearable = params['clearable'] ?? false;
    this.value = params.value;
  }

  protected customSearchFn(term: string, item: { name: string; project_name: string }) {
    term = term.toLowerCase();
    return (
      item.name.toLowerCase().indexOf(term) > -1 ||
      item.project_name?.toLowerCase().indexOf(term) > -1
    );
  }

  public getValue(): number {
    return this.value;
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.input().element.nativeElement.focus();
    });
  }
}

@Component({
  template: `
    <ng-select
      class="ng-select"
      [clearable]="clearable"
      name="ngSelect"
      id="ngSelect"
      #ngSelect="ngModel"
      [items]="items"
      [bindLabel]="bindName"
      [bindValue]="bindId"
      [(ngModel)]="value"
      notFoundText="Не найдено"
      appendTo="body"
      [ngStyle]="{ width: wide ? 'unset' : '300px' }"
      (change)="onChange()"
    >
      @if (isUserWithAvatar; as item) {
        <ng-template ng-label-tmp let-item="item">
          <user-with-avatar [user]="item.user" [avatar]="item.avatar" size="1rem" />
        </ng-template>
      }
    </ng-select>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgSelectComponent,
    FormsModule,
    NgStyle,
    NgLabelTemplateDirective,
    UserWithAvatarComponent,
  ],
})
export class NgSelectEditor<T> implements ICellEditorAngularComp {
  protected items: T[] = [];
  protected value: number | string;
  protected bindId = 'id';
  protected bindName = 'name';
  protected clearable = false;
  protected wide = true;
  protected isUserWithAvatar = false;

  private api: GridApi | null = null;
  private readonly input = viewChild.required('ngSelect', { read: ViewContainerRef });

  public agInit(params: ICellEditorParams<T, number | string>): void {
    this.api = params.api;
    this.items = params['items'] ?? [];
    if (params['bindId']) {
      this.bindId = params['bindId'];
    }
    if (params['bindName']) {
      this.bindName = params['bindName'];
    }
    if (params['wide'] !== undefined) {
      this.wide = params['wide'] ?? true;
    }
    this.clearable = params['clearable'] ?? false;
    this.isUserWithAvatar = params['isUserWithAvatar'] ?? false;
    this.value = params.value;
  }

  public getValue(): number | string {
    return this.value;
  }

  public refresh() {
    return true;
  }
  protected onChange() {
    if (this.api) {
      this.api.stopEditing(false);
    }
  }
}
