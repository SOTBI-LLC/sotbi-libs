import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ClarityModule, ClrLoadingState } from '@clr/angular';

@Component({
  selector: 'pauments-file-buttons',
  imports: [ClarityModule],
  templateUrl: './payments-file-buttons.component.html',
  styleUrl: './payments-file-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsFileButtonsComponent {
  public readonly filesSelected = output<File[]>();
  public readonly exportRequested = output<void>();

  public readonly uploadState = input<ClrLoadingState>(ClrLoadingState.DEFAULT);
  protected readonly loadingState = ClrLoadingState;

  upload(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.filesSelected.emit(files);
    input.value = '';
  }

  download(): void {
    this.exportRequested.emit();
  }
}
