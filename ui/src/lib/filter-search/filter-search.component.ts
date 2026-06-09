import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'filter-search',
  template: `
    <div class="search-wrapper">
      <div class="checkbox-wrapper">
        <input
          name="all"
          id="all"
          class="checkbox-input"
          type="checkbox"
          [checked]="checked()"
          [indeterminate]="indeterminate()"
          (change)="toggleSelect(checked())"
        />
        <label for="all" class="checkbox">Всё</label>
      </div>
      <div class="search-field m-0">
        <input
          class="search-input"
          placeholder="Найти"
          #searchinput
          type="search"
          (keyup)="onKeyUp(searchinput.value)"
        />
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
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
