import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import type { Remaining } from '@sotbi/models';
import type { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { Subject } from 'rxjs';
import { RemainingDialogComponent, RemainingDialogData } from './remaining-dialog.component';

@Component({ template: '' })
class DialogHost {}

class MatDialogRefStub {
  close = jest.fn();
}

/** Устойчивое ожидание результата через UI без обращения к приватным методам компонента. */
async function waitFor(assertion: () => void, timeoutMs = 5000): Promise<void> {
  const startedAt = Date.now();
  for (;;) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() - startedAt > timeoutMs) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

describe('RemainingDialogComponent', () => {
  const resizeObserverStub = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };

  beforeEach(() => {
    registerLocaleData(ru);
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = resizeObserverStub;
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it('uploads the selected PDF and dates through the supplied loader and closes with its result', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    const result = new Subject<Remaining>();
    const submitted: FormData[] = [];
    const closed: unknown[] = [];
    const dialog = TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: {
          account: '40702810900000000001',
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 31),
        } as Remaining,
        caption: 'Загрузить PDF файл',
        isEdit: true,
        uploadStatement: (data: FormData) => {
          submitted.push(data);
          return result;
        },
      } satisfies RemainingDialogData,
    });
    dialog.afterClosed().subscribe((value) => closed.push(value));
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;
    const start = container.querySelector('[formControlName="startDate"]') as HTMLInputElement;
    const end = container.querySelector('[formControlName="endDate"]') as HTMLInputElement;
    start.value = '2026-02-01';
    start.dispatchEvent(new Event('change', { bubbles: true }));
    end.value = '2026-02-28';
    end.dispatchEvent(new Event('change', { bubbles: true }));
    const file = new File(['PDF'], 'statement.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (container.querySelector('.btn-primary') as HTMLButtonElement).hasAttribute('disabled'),
      ).toBe(false),
    );

    (container.querySelector('.btn-primary') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(submitted).toHaveLength(1);
    expect(submitted[0].get('account')).toBe('40702810900000000001');
    expect(submitted[0].get('start_date')).toBe('2026-02-01');
    expect(submitted[0].get('end_date')).toBe('2026-02-28');
    expect((submitted[0].get('files') as File).name).toBe('statement.pdf');

    const uploaded = { id: 7, file: 'statement.pdf' } as Remaining;
    result.next(uploaded);
    await fixture.whenStable();
    await waitFor(() => expect(closed).toEqual([uploaded]));
  });

  it('displays a loader error and keeps the dialog open', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = TestBed.createComponent(DialogHost);
    const result = new Subject<Remaining>();
    const closed: unknown[] = [];
    const dialog = TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: {
          account: '40702810900000000001',
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 31),
        } as Remaining,
        caption: 'Загрузить PDF файл',
        isEdit: true,
        uploadStatement: () => result,
      } satisfies RemainingDialogData,
    });
    dialog.afterClosed().subscribe((value) => closed.push(value));
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [new File(['PDF'], 'statement.pdf', { type: 'application/pdf' })],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() =>
      expect(
        (container.querySelector('.btn-primary') as HTMLButtonElement).hasAttribute('disabled'),
      ).toBe(false),
    );
    (container.querySelector('.btn-primary') as HTMLButtonElement).click();
    result.error({ error: 'Выписка не распознана' });
    await fixture.whenStable();

    expect((container.querySelector('.alert-text') as HTMLElement).textContent).toContain(
      'Выписка не распознана',
    );
    expect(closed).toEqual([]);
    expect(document.querySelector('mat-dialog-container')).toBe(container);
  });

  it('closes without an upload result on cancel in edit mode', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    const closed: unknown[] = [];
    const uploadStatement = jest.fn();
    const dialog = TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: {
          account: '40702810900000000001',
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 31),
        } as Remaining,
        caption: 'Загрузить PDF файл',
        isEdit: true,
        uploadStatement,
      } satisfies RemainingDialogData,
    });
    dialog.afterClosed().subscribe((value) => closed.push(value));
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;

    (container.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await waitFor(() => expect(closed).toEqual([undefined]));
    expect(uploadStatement).not.toHaveBeenCalled();
  });

  it('previews the supplied statement without a loader, using the default link', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    const closed: unknown[] = [];
    const dialog = TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: {
          id: 42,
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 31),
          initial_balance: 1000,
          income: 200,
          write_off: 50,
          final_balance: 1150,
          file: 'statement.pdf',
          creator: { user: 'Иван Петров' } as Remaining['creator'],
          created_at: new Date(2026, 1, 2),
        } as Remaining,
        caption: 'Подробнее',
        isEdit: false,
      } satisfies RemainingDialogData,
    });
    dialog.afterClosed().subscribe((value) => closed.push(value));
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;
    const values = Array.from(
      container.querySelectorAll('.group-ctrl__preview-text'),
      (element) => element.textContent!.trim().replace(/\s/g, ' '),
    );
    expect(values).toEqual([
      '01.01.2026',
      '31.01.2026',
      '1,000.00',
      '200.00',
      '50.00',
      '1,150.00',
      'statement.pdf',
      'Иван Петров',
      '02.02.2026',
    ]);
    expect((container.querySelector('a') as HTMLAnchorElement).getAttribute('href')).toBe(
      '/download/payment/42',
    );
    expect(container.querySelector('ngx-file-drop')).toBeNull();
    (container.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    await waitFor(() => expect(closed).toEqual([undefined]));
  });

  it('uses the consumer-supplied statement link instead of the default one', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    const dialog = TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: { id: 7, file: 'statement.pdf' } as Remaining,
        caption: 'Подробнее',
        isEdit: false,
        statementUrl: '/custom/statement/7',
      } satisfies RemainingDialogData,
    });
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;
    expect((container.querySelector('a') as HTMLAnchorElement).getAttribute('href')).toBe(
      '/custom/statement/7',
    );
  });

  it('sets the file control from a pdf drop entry', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    TestBed.inject(MatDialog).open(RemainingDialogComponent, {
      data: {
        row: {
          account: '40702810900000000001',
          start_date: new Date(2026, 0, 1),
          end_date: new Date(2026, 0, 31),
        } as Remaining,
        caption: 'Загрузить PDF файл',
        isEdit: true,
        uploadStatement: () => new Subject<Remaining>(),
      } satisfies RemainingDialogData,
    });
    await fixture.whenStable();
    const container = document.querySelector('mat-dialog-container')!;
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const pdf = new File(['PDF'], 'dropped.pdf', { type: 'application/pdf' });
    const fileEntry = {
      isFile: true,
      isDirectory: false,
      file: (callback: (file: File) => void) => callback(pdf),
      name: pdf.name,
    } as unknown as FileSystemFileEntry;
    const entry = { fileEntry, relativePath: pdf.name } as NgxFileDropEntry;

    const dropZone = container.querySelector('ngx-file-drop') as HTMLElement;
    expect(dropZone).toBeTruthy();
    Object.defineProperty(input, 'files', { configurable: true, value: [pdf] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    await waitFor(() => expect(container.textContent).toContain('dropped.pdf'));
  });
});
