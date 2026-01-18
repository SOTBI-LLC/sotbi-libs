import { AfterViewInit, Component, ViewContainerRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrSelectModule } from '@clr/angular';
import { itemMap } from '@root/store/simple-edit.state.model';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

@Component({
  selector: 'select-cell',
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
  imports: [FormsModule, ClrSelectModule],
})
export class SelectEditor implements ICellEditorAngularComp, AfterViewInit {
  protected item$: itemMap | Map<string, string>;
  protected value: number;
  readonly input = viewChild('select', { read: ViewContainerRef });
  private params: ICellEditorParams;

  agInit(params: ICellEditorParams): void {
    this.params = params;
    if (params['items']) {
      this.item$ = params['items'];
    }
    this.value = this.params.value;
  }

  getValue(): number {
    return this.value;
  }

  onSelect() {
    this.params.api.stopEditing();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input().element.nativeElement.focus();
    });
  }
}
