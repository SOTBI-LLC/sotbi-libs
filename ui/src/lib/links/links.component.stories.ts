import type { Meta, StoryObj } from '@storybook/angular';
import type { SimpleEditModel } from '@sotbi/models';
import { Link } from '@sotbi/models';
import { fn } from 'storybook/test';

import { LinksComponent } from './links.component';

const linkTypes: SimpleEditModel[] = [
  { id: 1, name: 'Документация' },
  { id: 2, name: 'Портал' },
  { id: 3, name: 'Отчёт' },
];

const debtorId = 123;

function createSampleLinkRefs(): Link[] {
  return [
    new Link({
      id: 1,
      uri: 'https://example.com/docs',
      debtor_id: debtorId,
      type_id: 1,
      type: linkTypes[0],
    }),
    new Link({
      id: 2,
      uri: 'https://portal.sotbi.local',
      debtor_id: debtorId,
      type_id: 2,
      type: linkTypes[1],
    }),
  ];
}

const meta: Meta<LinksComponent> = {
  title: 'Links',
  component: LinksComponent,
  tags: ['autodocs'],
  args: {
    links: linkTypes,
    debtorId,
    isDisabled: false,
    showAsTable: true,
    isEditMode: false,
    isChanged: fn(),
  },
};

export default meta;

type Story = StoryObj<LinksComponent>;

export const Default: Story = {
  args: {
    linkRefs: createSampleLinkRefs(),
  },
};

export const Empty: Story = {
  args: {
    linkRefs: [],
  },
};

export const EditMode: Story = {
  args: {
    linkRefs: createSampleLinkRefs(),
    isEditMode: true,
  },
};

export const Disabled: Story = {
  args: {
    linkRefs: createSampleLinkRefs(),
    isDisabled: true,
  },
};

export const AsLabels: Story = {
  args: {
    linkRefs: createSampleLinkRefs(),
    showAsTable: false,
  },
};

export const SingleLink: Story = {
  args: {
    linkRefs: [createSampleLinkRefs()[0]],
  },
};
