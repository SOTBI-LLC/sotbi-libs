import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'filter-block',
  template: `
    <div class="filter-block">
      <div class="info-container top">
        <h6 class="title">{{ title() }}</h6>
      </div>
      <div class="filter-content wide">
        <ng-content></ng-content>
      </div>
      <div class="info-container bottom">
        <div class="info">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10 1.11133C5.09081 1.11133 1.11111 5.09102 1.11111 10.0002C1.11111 14.9094 5.09081 18.8891 10 18.8891C14.9092 18.8891 18.8889 14.9094 18.8889 10.0002C18.8889 7.64274 17.9524 5.38181 16.2854 3.71482C14.6184 2.04783 12.3575 1.11133 10 1.11133ZM10 17.778C5.70446 17.778 2.22223 14.2958 2.22223 10.0002C2.22223 5.70467 5.70446 2.22244 10 2.22244C14.2956 2.22244 17.7778 5.70467 17.7778 10.0002C17.7778 12.063 16.9583 14.0413 15.4997 15.4999C14.0411 16.9586 12.0628 17.778 10 17.778ZM14.7722 6.72249C14.9889 6.50709 15.3389 6.50709 15.5556 6.72249C15.6607 6.82681 15.7199 6.96881 15.7199 7.11694C15.7199 7.26507 15.6607 7.40707 15.5556 7.51138L8.60556 14.4447L4.44445 10.2947C4.23274 10.0661 4.24642 9.7092 4.475 9.49749C4.70359 9.28579 5.06052 9.29947 5.27223 9.52805L8.60556 12.8614L14.7722 6.72249Z"
              fill="#747474"
            />
          </svg>
          <span class="bold summary">{{ selectedText() }}</span>
        </div>
        @if (showClear()) {
          <button class="clear" (click)="onClick()">{{ clearText() }}</button>
        }
      </div>
    </div>
  `,
  styleUrls: ['./filter-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBlockComponent {
  public readonly selectedText = input('');
  public readonly title = input('');
  public readonly clearText = input('очистить');
  public readonly showClear = input(true);
  public readonly heightAuto = input(false);
  public readonly clear = output<void>();

  protected onClick(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.clear.emit();
  }
}
