import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { InsurancePolicy } from '@sotbi/models';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import type { Observable } from 'rxjs';

export interface DownloadAllParams extends ICellRendererParams<InsurancePolicy> {
  downloadAll: (id: number) => Observable<Blob>;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- селектор сохранён для совместимости
  selector: 'app-download-all',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a href="javascript:void(0);" (click)="onDownload(id)">Скачать все</a>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DownloadAllComponent implements ICellRendererAngularComp {
  private readonly destroyRef = inject(DestroyRef);
  private downloadAll!: DownloadAllParams['downloadAll'];

  public id!: number;

  public agInit({ data, downloadAll }: DownloadAllParams): void {
    this.downloadAll = downloadAll;
    this.id = data!.id;
    this.refresh();
  }

  public refresh(): boolean {
    return true;
  }

  public onDownload(id: number): void {
    this.downloadAll(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(data);
        link.download = String(id);
        link.click();
        link.remove();
      });
  }
}
