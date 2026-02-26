import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ClarityModule } from '@clr/angular';

@Component({
  selector: 'filter-search',
  imports: [ClarityModule],
  template: `
    <div class="search-wrapper">
      <clr-checkbox-wrapper class="checkbox-wrapper">
        <input
          name="all"
          id="all"
          clrCheckbox
          type="checkbox"
          [checked]="checked()"
          [indeterminate]="indeterminate()"
          (change)="toggleSelect(checked())"
        />
        <label for="all" class="checkbox">Всё</label>
      </clr-checkbox-wrapper>
      <clr-input-container class="m-0"
        ><input
          placeholder="Найти"
          #searchinput
          type="search"
          clrInput
          (keyup)="onKeyUp(searchinput.value)"
      /></clr-input-container>
      <cds-icon class="search" shape="search"></cds-icon>
    </div>
  `,
  styleUrls: ['./filter-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
  public readonly checked = input(false);
  public readonly indeterminate = input(false);

  public readonly check = output<boolean>();
  public readonly searchEvent = output<string>();

  protected toggleSelect(value: boolean) {
    this.check.emit(value);
  }

  protected onKeyUp(value: string) {
    this.searchEvent.emit(value);
  }
}
