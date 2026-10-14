import { SIDE_PANEL_DATA } from '../side-panel/side-panel-config';
import { SidePanelRef } from '../side-panel/side-panel-ref';
import { SidePanelFrameComponent } from '../side-panel/side-panel-frame';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
  imports: [SidePanelFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCanDeactivateComponent {
  protected readonly inputData =
    inject<DialogCanDeactivateInputDataModel>(SIDE_PANEL_DATA);
  private readonly dialogRef =
    inject<SidePanelRef<DialogCanDeactivateComponent>>(SidePanelRef);

  protected save() {
    this.dialogRef.complete({
      res: true,
      action: DialogCanDeactivateActionType.SAVE,
    });
  }

  protected cancelSave() {
    this.dialogRef.complete({
      res: true,
      action: DialogCanDeactivateActionType.CANCEL,
    });
  }

  protected close() {
    this.dialogRef.complete({ res: false });
  }
}
