import {
  LucideBug,
  LucideFaceSlightlyFrowning,
  LucideFileBadge,
  LucideShield,
  LucideUser,
  LucideZap,
} from '@lucide/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { LeftNavBarComponent, type LeftNavBarItem } from '@sotbi/ui';

const demoItems: LeftNavBarItem[] = [
  { label: 'Normal', icon: LucideUser.icon, routerLink: './normal' },
  { label: 'Electric', icon: LucideZap.icon, routerLink: './electric' },
  {
    label: 'Poison',
    icon: LucideFaceSlightlyFrowning.icon,
    expanded: false,
    children: [
      {
        label: 'Sub Poison 1',
        icon: LucideFaceSlightlyFrowning.icon,
        routerLink: './poison/1',
      },
      {
        label: 'Sub Poison 2',
        icon: LucideFaceSlightlyFrowning.icon,
        routerLink: './poison/2',
      },
    ],
  },
  { label: 'Grass', icon: LucideBug.icon, routerLink: './grass' },
  { label: 'Fighting', icon: LucideShield.icon, routerLink: './fighting' },
  { label: 'Credit', icon: LucideFileBadge.icon, routerLink: './credit' },
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
        icon: LucideFaceSlightlyFrowning.icon,
        expanded: true,
        children: demoItems[2].children,
      },
      ...demoItems.slice(0, 2),
    ],
  },
};
