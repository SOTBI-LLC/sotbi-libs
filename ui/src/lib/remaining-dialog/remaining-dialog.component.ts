import { CurrencyPipe, DatePipe, formatDate } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ClrAlertModule,
  ClrCommonFormsModule,
  ClrIcon,
  ClrLoadingState,
  ClrModalModule,
} from '@clr/angular';
import { Remaining } from '@sotbi/models';
import { NativeDateValueAccessorDirective } from '../native-date/native-date.directive';
import { FileSystemFileEntry, NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { Observable, Subscription } from 'rxjs';

export type RemainingDialogData = {
  row: Remaining;
  caption: string;
  /** Ссылка на файл выписки; по умолчанию — /download/payment/<id>. */
  statementUrl?: string;
} & (
  | { isEdit: true; uploadStatement: (data: FormData) => Observable<Remaining | string> }
  | { isEdit: false }
);

@Component({
  templateUrl: './remaining-dialog.component.html',
  imports: [
    ClrModalModule,
    ClrAlertModule,
    ClrCommonFormsModule,
    FormsModule,
    ReactiveFormsModule,
    NativeDateValueAccessorDirective,
    NgxFileDropModule,
    ClrIcon,
    CurrencyPipe,
    DatePipe,
  ],
})
export class RemainingDialogComponent implements OnInit {
  private readonly dialogData = inject<RemainingDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<RemainingDialogComponent>>(MatDialogRef);
  private readonly formBuilder = inject(UntypedFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly uploadBtnState = signal<ClrLoadingState>(ClrLoadingState.DEFAULT);
  protected fg!: FormGroup;
  protected readonly data = signal<Remaining>({} as Remaining);
  protected isEdit = false;
  protected readonly alerts = signal<string[]>([]);
  protected caption = '';
  protected statementLink = '';

  public ngOnInit(): void {
    this.caption = this.dialogData.caption;
    this.isEdit = this.dialogData.isEdit;
    if (this.isEdit) {
      this.fg = this.formBuilder.group({
        account: [this.dialogData.row.account],
        startDate: [this.dialogData.row.start_date, Validators.required],
        endDate: [this.dialogData.row.end_date, Validators.required],
        file: [null, Validators.required],
      });
    } else {
      this.data.set(this.dialogData.row);
      this.statementLink =
        this.dialogData.statementUrl ?? `/download/payment/${this.dialogData.row.id}`;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onUpload(fg: FormGroup): Subscription | undefined {
    if (!this.dialogData.isEdit) return;
    const formData = new FormData();
    formData.append('account', fg.controls['account'].value);
    formData.append('start_date', formatDate(fg.controls['startDate'].value, 'yyyy-MM-dd', 'ru-Ru'));
    formData.append('end_date', formatDate(fg.controls['endDate'].value, 'yyyy-MM-dd', 'ru-Ru'));
    formData.append('files', fg.controls['file'].value, fg.controls['file'].value.name);
    return this.dialogData
      .uploadStatement(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error(err);
          this.alerts.update((alerts) => [...alerts, err.error]);
          this.uploadBtnState.set(ClrLoadingState.ERROR);
        },
      });
  }

  onCloseAlert(alert: string) {
    this.alerts.update((alerts) => alerts.filter((el) => el !== alert));
  }

  dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (file.type === 'application/pdf') {
            this.fg.controls['file'].setValue(file);
          }
        });
      }
    }
  }
}
