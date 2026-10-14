import {
  applicationConfig,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SIDE_PANEL_DATA } from '../side-panel/side-panel-config';
import { SidePanelRef } from '../side-panel/side-panel-ref';
import { DialogCanDeactivateComponent } from './dialog-can-deactivate.component';
import { expect } from 'storybook/test';

const meta: Meta<DialogCanDeactivateComponent> = {
  component: DialogCanDeactivateComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        { provide: SIDE_PANEL_DATA, useValue: { canBeSaved: true } },
        { provide: SidePanelRef, useFactory: () => new SidePanelRef() },
      ],
    }),
  ],
  title: 'DialogCanDeactivateComponent',
};
export default meta;

type Story = StoryObj<DialogCanDeactivateComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async () => {
    await expect(document.body.textContent).toContain(
      'Продолжить редактирование',
    );
  },
};
