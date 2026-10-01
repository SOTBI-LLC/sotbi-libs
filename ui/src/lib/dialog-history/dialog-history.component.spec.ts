import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import type { AttachmentHistory } from '@sotbi/models';
import { EMPTY, Subject } from 'rxjs';
import { DialogHistoryComponent, DialogHistoryDataModel } from './dialog-history.component';

@Component({ template: '' })
class DialogHost {}

const openHistoryDialog = (data: DialogHistoryDataModel) => {
  const fixture = TestBed.createComponent(DialogHost);
  const dialog = TestBed.inject(MatDialog).open(DialogHistoryComponent, { data });
  return { fixture, dialog };
};

describe('DialogHistoryComponent', () => {
  beforeEach(() => {
    registerLocaleData(ru);
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('shows «Изменений нет» when history has no changes', async () => {
    const { fixture } = openHistoryDialog({
      title: 'История изменений',
      info: 7,
      loadHistory: () => EMPTY,
    });
    await fixture.whenStable();
    expect(document.querySelector('mat-dialog-container')!.textContent).toContain(
      'Изменений нет',
    );
  });

  it('displays supplied captions for changed fields', async () => {
    const history = new Subject<AttachmentHistory[]>();
    const { fixture } = openHistoryDialog({
      title: 'История изменений',
      info: 7,
      loadHistory: (id) => (id === 7 ? history : EMPTY),
      fieldLabels: { adNum: '№ объявления', comment: 'Комментарий' },
    });
    await fixture.whenStable();

    history.next([
      { revision: 1, adNum: 'ЧЕК-1', comment: 'старый', updated_at: new Date('2026-01-01') },
      {
        revision: 2,
        adNum: 'ЧЕК-2',
        comment: 'новый',
        updated_at: new Date('2026-01-02'),
        updated_by: 42,
      },
    ] as AttachmentHistory[]);
    await fixture.whenStable();

    const container = document.querySelector('mat-dialog-container')!;
    expect(container.textContent).toContain('История изменений');
    expect(container.textContent).toContain('№ объявления');
    expect(container.textContent).toContain('Комментарий');
    expect(container.textContent).toContain('ЧЕК-1');
    expect(container.textContent).toContain('ЧЕК-2');
    expect(container.textContent).toContain('новый');
  });

  it('falls back to the raw field key when no caption is supplied', async () => {
    const history = new Subject<AttachmentHistory[]>();
    const { fixture } = openHistoryDialog({
      title: 'История изменений',
      info: 7,
      loadHistory: () => history,
      fieldLabels: { adNum: '№ объявления' },
    });
    await fixture.whenStable();

    history.next([
      { revision: 1, mysteryKey: 'before', updated_at: new Date('2026-01-01') },
      { revision: 2, mysteryKey: 'after', updated_at: new Date('2026-01-02') },
    ] as unknown as AttachmentHistory[]);
    await fixture.whenStable();

    const container = document.querySelector('mat-dialog-container')!;
    expect(container.textContent).toContain('mysteryKey');
    expect(container.textContent).toContain('after');
  });

  it('falls back to the raw field key when the dictionary is omitted', async () => {
    const history = new Subject<AttachmentHistory[]>();
    const { fixture } = openHistoryDialog({
      title: 'История изменений',
      info: 7,
      loadHistory: () => history,
    });
    await fixture.whenStable();

    history.next([
      { revision: 1, adNum: 'ЧЕК-1', updated_at: new Date('2026-01-01') },
      { revision: 2, adNum: 'ЧЕК-2', updated_at: new Date('2026-01-02') },
    ] as AttachmentHistory[]);
    await fixture.whenStable();

    const container = document.querySelector('mat-dialog-container')!;
    expect(container.textContent).toContain('adNum');
    expect(container.textContent).toContain('ЧЕК-2');
  });
});
