import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

export enum DialogCanDeactivateActionType {
  SAVE = 'save',
  CANCEL = 'cancel',
}

export interface DialogCanDeactivateInputDataModel {
  canBeSaved: boolean;
}

export interface DialogCanDeactivateResultDataModel {
  res: boolean;
  action: DialogCanDeactivateActionType;
}

@Component({
  templateUrl: './dialog-can-deactivate.component.html',
  styleUrls: ['./dialog-can-deactivate.component.scss'],
  imports: [MatDialogContent, MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCanDeactivateComponent {
  protected readonly inputData =
    inject<DialogCanDeactivateInputDataModel>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<DialogCanDeactivateComponent>>(MatDialogRef);

  protected save() {
    this.dialogRef.close({
      res: true,
      action: DialogCanDeactivateActionType.SAVE,
    });
  }

  protected cancelSave() {
    this.dialogRef.close({
      res: true,
      action: DialogCanDeactivateActionType.CANCEL,
    });
  }

  protected close() {
    this.dialogRef.close({ res: false });
  }
}
