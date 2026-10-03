import {
  ClarityIcons,
  boltIcon,
  bugIcon,
  certificateIcon,
  sadFaceIcon,
  shieldIcon,
  userIcon,
} from '@clr/angular/icon';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import {
  LeftNavBarComponent,
  type LeftNavBarItem,
} from '@sotbi/ui';

ClarityIcons.addIcons(
  userIcon,
  boltIcon,
  sadFaceIcon,
  bugIcon,
  shieldIcon,
  certificateIcon,
);

const demoItems: LeftNavBarItem[] = [
  { label: 'Normal', icon: 'user', routerLink: './normal' },
  { label: 'Electric', icon: 'bolt', routerLink: './electric' },
  {
    label: 'Poison',
    icon: 'sad-face',
    expanded: false,
    children: [
      { label: 'Sub Poison 1', icon: 'sad-face', routerLink: './poison/1' },
      { label: 'Sub Poison 2', icon: 'sad-face', routerLink: './poison/2' },
    ],
  },
  { label: 'Grass', icon: 'bug', routerLink: './grass' },
  { label: 'Fighting', icon: 'shield', routerLink: './fighting' },
  { label: 'Credit', icon: 'certificate', routerLink: './credit' },
];

// Приложение-потребитель задаёт высоту навигации через контейнер
// (в timetable это .content-container .clr-vertical-nav { height: 100% }).
const containerTemplate = `
  <div class="main-container">
    <div class="content-container story-content-container">
      <left-nav-bar [items]="items" [colabsible]="colabsible" />
    </div>
  </div>
`;

const meta: Meta<LeftNavBarComponent> = {
  title: 'LeftNavBar',
  component: LeftNavBarComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  args: {
    colabsible: true,
    items: demoItems,
  },
  render: (args) => ({
    props: args,
    template: containerTemplate,
    styles: [
      `
        .story-content-container {
          height: 400px;
          background: #e4e7ea;
        }
        .story-content-container .clr-vertical-nav {
          height: 100%;
        }
      `,
    ],
  }),
};

export default meta;

type Story = StoryObj<LeftNavBarComponent>;

export const Default: Story = {};

export const NotCollapsible: Story = {
  args: {
    colabsible: false,
  },
};

export const WithGroups: Story = {
  args: {
    colabsible: true,
    items: [
      {
        label: 'Poison',
        icon: 'sad-face',
        expanded: true,
        children: demoItems[2].children,
      },
      ...demoItems.slice(0, 2),
    ],
  },
};
