import type { Meta, StoryObj } from '@storybook/angular';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { ShortLinksComponent } from './short-links.component';

type ShortLinksForm = FormGroup<{
  name: FormControl<string | null>;
  url: FormControl<string | null>;
}>;

function createShortLinkForm(name: string | null, url: string | null): ShortLinksForm {
  return new FormGroup({
    name: new FormControl(name),
    url: new FormControl(url, [Validators.required]),
  });
}

function createShortLinksFormArray(
  links: Array<{ name: string | null; url: string | null }>,
): FormArray<ShortLinksForm> {
  const formArray = new FormArray<ShortLinksForm>([]);
  for (const link of links) {
    formArray.push(createShortLinkForm(link.name, link.url));
  }
  return formArray;
}

const meta: Meta<ShortLinksComponent> = {
  title: 'ShortLinks',
  component: ShortLinksComponent,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ShortLinksComponent>;

export const Empty: Story = {
  args: {
    shortLinks: createShortLinksFormArray([]),
  },
};

export const Default: Story = {
  args: {
    shortLinks: createShortLinksFormArray([
      { name: 'Документация', url: 'https://example.com/docs' },
      { name: 'Портал', url: 'https://portal.sotbi.local' },
    ]),
  },
};

export const SingleLink: Story = {
  args: {
    shortLinks: createShortLinksFormArray([{ name: 'Сайт', url: 'https://sotbi.ru' }]),
  },
};

export const WithEmptyUrl: Story = {
  args: {
    shortLinks: createShortLinksFormArray([
      { name: 'Без URL', url: null },
      { name: 'Валидная', url: 'https://example.com' },
    ]),
  },
};
