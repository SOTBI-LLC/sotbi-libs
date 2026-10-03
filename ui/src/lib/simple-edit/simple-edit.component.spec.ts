import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Component, signal } from '@angular/core';
import type { SimpleEditModel } from '@sotbi/models';

import { SimpleEditComponent } from './simple-edit.component';

@Component({
  imports: [SimpleEditComponent],
  template: `
    <simple-edit
      [items]="items()"
      [allowedToDelete]="allowedToDelete()"
      (action)="actioned.set($event)"
      (delete)="deleted.set($event)"
    />
  `,
})
class HostComponent {
  public readonly items = signal<SimpleEditModel[]>([
    { id: 1, name: 'Первый' },
    { id: 2, name: 'Второй' },
  ]);
  public readonly allowedToDelete = signal(false);
  public readonly actioned = signal<SimpleEditModel | null>(null);
  public readonly deleted = signal<number | null>(null);
}

describe('SimpleEdit', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const createHost = async (setup: (host: HostComponent) => void = () => undefined): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    setup(host);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const rows = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:not(:last-child)'),
    ) as HTMLElement[];
  const nameOf = (row: HTMLElement) =>
    row.querySelector('td span')?.textContent?.trim();
  const actionButton = (row: HTMLElement) =>
    row.querySelector('.simple-edit__btn-action') as HTMLButtonElement;

  it('creates', async () => {
    await createHost();
    expect(
      fixture.nativeElement.querySelector('simple-edit table'),
    ).toBeTruthy();
  });

  it('renders the passed items with their names', async () => {
    await createHost();

    const names = rows().map(nameOf);
    expect(names).toEqual(['Первый', 'Второй']);
  });

  it('saves an edited item through action with the model', async () => {
    await createHost();
    const row = rows()[0];

    actionButton(row).querySelector('clr-icon')!.dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    fixture.detectChanges();
    const input = row.querySelector('input') as HTMLInputElement;
    input.value = 'Переименованный';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    actionButton(row)
      .querySelector('clr-icon')!
      .dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.actioned()).toEqual({ id: 1, name: 'Переименованный' });
    expect(nameOf(rows()[0])).toBe('Переименованный');
  });

  it('keeps editing when the saved name is empty', async () => {
    await createHost();
    const row = rows()[0];

    actionButton(row).querySelector('clr-icon')!.dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    fixture.detectChanges();
    const input = row.querySelector('input') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    actionButton(row)
      .querySelector('clr-icon')!
      .dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.actioned()).toBeNull();
    expect(row.querySelector('input')).toBeTruthy();
  });

  it('creates a new item through action with an empty id and clears the field', async () => {
    await createHost();
    const createRow = fixture.nativeElement.querySelector(
      'tbody tr:last-child',
    ) as HTMLElement;
    const input = createRow.querySelector('input') as HTMLInputElement;
    input.value = 'Новый раздел';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    createRow
      .querySelector('.simple-edit__btn-action clr-icon')!
      .dispatchEvent(new Event('click', { bubbles: true }));
    await fixture.whenStable();

    expect(host.actioned()).toEqual({ id: 0, name: 'Новый раздел' });
    expect(
      (createRow.querySelector('input') as HTMLInputElement).value,
    ).toBe('');
  });

  it('does not create when the new name is empty', async () => {
    await createHost();
    const createRow = fixture.nativeElement.querySelector(
      'tbody tr:last-child',
    ) as HTMLElement;

    createRow
      .querySelector('.simple-edit__btn-action clr-icon')!
      .dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.actioned()).toBeNull();
  });

  it('hides the delete column when allowedToDelete is false', async () => {
    await createHost();

    const headerCells = Array.from(
      fixture.nativeElement.querySelectorAll('thead th'),
    ) as HTMLElement[];
    expect(headerCells.length).toBe(2);
    expect(fixture.nativeElement.querySelector('[title="Delete"]')).toBeNull();
  });

  it('deletes an item through delete with its id when allowedToDelete', async () => {
    await createHost((h) => h.allowedToDelete.set(true));
     

    const row = rows()[1];
    const deleteButton = row.querySelector(
      '[title="Delete"]',
    ) as HTMLButtonElement;
    deleteButton.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(host.deleted()).toBe(2);
  });
});
