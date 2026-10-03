import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import type { SimpleEditModel } from '@sotbi/models';

@Component({
  selector: 'simple-edit',
  imports: [FormsModule, ClarityModule],
  templateUrl: './simple-edit.component.html',
  styles: [
    `
      .simple-edit__btn-action {
        margin: 0;
        padding: 0;
        border: 0;
        background-color: transparent;
        &:not(:disabled) {
          cursor: pointer;
        }
      }
      svg {
        fill: rgb(86, 86, 86);
      }
    `,
  ],
})
export class SimpleEditComponent {
  public readonly items = input<SimpleEditModel[] | undefined>(undefined);
  public editable = -1;
  public newName = '';

  public readonly allowedToDelete = input(false);

  public readonly action = output<SimpleEditModel>();
  public readonly delete = output<number>();

  public create(): void {
    if (this.newName !== '') {
      this.action.emit({ id: 0, name: this.newName });
      this.newName = '';
    }
  }

  public save(item: SimpleEditModel): void {
    if (item.name) {
      this.action.emit(item);
      this.editable = -1;
    }
  }

  public del(id: number): void {
    this.delete.emit(id);
  }
}
