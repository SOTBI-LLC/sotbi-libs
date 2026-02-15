import type { AfterViewInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrSelectModule } from '@clr/angular';
import type { itemMap } from '@sotbi/state';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';

@Component({
  template: `
    <div class="select">
      <select
        clrSelect
        id="select"
        [(ngModel)]="value"
        name="select"
        #select="ngModel"
        (change)="onSelect()"
      >
        @for (item of item$; track $index) {
          <option [ngValue]="item[0]">
            {{ item[1] }}
          </option>
        }
      </select>
    </div>
  `,
  styleUrls: ['./select-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ClrSelectModule],
})
export class SelectEditorComponent
  implements ICellEditorAngularComp, AfterViewInit
{
  protected item$: itemMap | Map<string, string> = new Map();
  protected value = 0;
  protected readonly input = viewChild.required('select', {
    read: ViewContainerRef,
  });
  private params: ICellEditorParams | null = null;

  public agInit(params: ICellEditorParams): void {
    this.params = params;
    if (params['items']) {
      this.item$ = params['items'];
    }
    this.value = this.params.value;
  }

  public getValue(): number {
    return this.value;
  }

  public onSelect() {
    this.params?.api?.stopEditing();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.input().element.nativeElement.focus();
    });
  }
}
