import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NativeTimeValueAccessorDirective } from '../native-time';

@Component({
  selector: 'time-edit',
  imports: [NativeTimeValueAccessorDirective, FormsModule],
  template: `<input
    type="time"
    nativeTime
    [ngModel]="ngModel"
    (ngModelChange)="ngModelChange.emit($event)"
  />`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeEditComponent {
  public readonly ngModel = input<number | null>(null);
  public readonly ngModelChange = output<number | null>();
}
