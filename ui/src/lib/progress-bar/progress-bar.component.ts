import { Component, input } from '@angular/core';
import type { Progress } from '@sotbi/models';

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {
  public readonly progress = input.required<Progress>();
  public readonly showProgress = input.required<boolean>();
}
