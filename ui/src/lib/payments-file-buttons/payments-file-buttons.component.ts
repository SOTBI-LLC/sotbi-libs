import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ClrIcon, ClrLoadingState } from '@clr/angular';

@Component({
  selector: 'pauments-file-buttons',
  imports: [LoadingButtonComponent, ClrIcon],
  templateUrl: './payments-file-buttons.component.html',
  styleUrl: './payments-file-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsFileButtonsComponent {
  public readonly filesSelected = output<File[]>();
  public readonly exportRequested = output<void>();

  public readonly uploadState = input<ClrLoadingState>(ClrLoadingState.DEFAULT);
  protected readonly loadingState = ClrLoadingState;

  public upload(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.filesSelected.emit(files);
    input.value = '';
  }

  public download(): void {
    this.exportRequested.emit();
  }
}
