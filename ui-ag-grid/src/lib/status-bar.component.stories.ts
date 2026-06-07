import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import type { IStatusPanelParams } from 'ag-grid-community';

import { AddRowsStatusBarComponent } from './status-bar.component';

@Component({
  selector: 'lib-add-rows-status-bar-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container #host />`,
})
class AddRowsStatusBarStoryHost implements AfterViewInit {
  @Input()
  public editable = true;

  @ViewChild('host', { read: ViewContainerRef })
  private host!: ViewContainerRef;

  public ngAfterViewInit(): void {
    const ref = this.host.createComponent(AddRowsStatusBarComponent);
    ref.instance.agInit({
      key: 'addRows',
      api: {} as IStatusPanelParams['api'],
      context: undefined,
      editable: this.editable,
      onAdd: (count: number) => {
        console.log('add rows', count);
      },
    } as IStatusPanelParams & {
      editable: boolean;
      onAdd: (count: number) => void;
    });
    ref.changeDetectorRef.detectChanges();
  }
}

const meta: Meta<AddRowsStatusBarStoryHost> = {
  title: 'StatusBar/AddRows',
  component: AddRowsStatusBarStoryHost,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<AddRowsStatusBarStoryHost>;

export const Editable: Story = {
  args: {
    editable: true,
  },
};

export const ReadOnly: Story = {
  args: {
    editable: false,
  },
};
