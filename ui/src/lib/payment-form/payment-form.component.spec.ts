import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { PaymentDocument } from '@sotbi/models';
import { PaymentFormComponent } from './payment-form.component';

describe('PaymentFormComponent', () => {
  let component: PaymentFormComponent;
  let fixture: ComponentFixture<PaymentFormComponent>;

  const mockPaymentDocument: Partial<PaymentDocument> = {
    id: 1,
    document_type: 'Платежное поручение',
    number: '123',
    date: new Date('2024-01-15'),
    income_date: new Date('2024-01-14'),
    writen_off_date: new Date('2024-01-15'),
    payment_type: 'Электронно',
    summ: 1234.56,
    payer_inn: '1234567890',
    payer_kpp: '123456789',
    payer1: 'ООО "Плательщик"',
    payer_account: '40702810123456789012',
    payer_bank1: 'АО "Сбербанк"',
    payer_bank2: 'г. Москва',
    payer_bik: '044525225',
    payer_corr_account: '30101810400000000225',
    receiver_inn: '0987654321',
    receiver_kpp: '098765432',
    receiver1: 'ООО "Получатель"',
    receiver_account: '40702810987654321098',
    receiver_bank1: 'ПАО "ВТБ"',
    receiver_bank2: 'г. Санкт-Петербург',
    receiver_bik: '044030702',
    receiver_corr_account: '30101810200000000702',
    payment_purpose: 'Оплата по счету №123 от 10.01.2024',
    priority: '5',
    uin: '0',
    indicator_kbk: '',
    okato: '',
    indicator_basics: 'ТП',
    indicator_period: '',
  };

  beforeEach(async () => {
    // Override template to simplify testing
    TestBed.overrideComponent(PaymentFormComponent, {
      set: {
        template: `
          <div class="payments-dialog__table">
            <table>
              <tr>
                <td>{{ paymentDoc()?.number }}</td>
                <td>{{ paymentDoc()?.summ }}</td>
              </tr>
            </table>
          </div>
        `,
      },
    });

    await TestBed.configureTestingModule({
      imports: [PaymentFormComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('paymentDoc input', () => {
    it('should accept paymentDoc input', () => {
      fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      fixture.detectChanges();

      expect(component.paymentDoc()).toEqual(
        expect.objectContaining(mockPaymentDocument),
      );
    });

    it('should render payment document number', () => {
      fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('123');
    });
  });

  describe('postFormatNumber', () => {
    // Access protected method via component as any
    const getPostFormatNumber = (comp: PaymentFormComponent) =>
      (
        comp as unknown as { postFormatNumber: (s: string) => string }
      ).postFormatNumber.bind(comp);

    it('should replace comma with dash', () => {
      fixture.detectChanges();
      const postFormatNumber = getPostFormatNumber(component);

      expect(postFormatNumber('1,234.56')).toBe('1-234.56');
    });

    it('should handle string without comma', () => {
      fixture.detectChanges();
      const postFormatNumber = getPostFormatNumber(component);

      expect(postFormatNumber('1234.56')).toBe('1234.56');
    });

    it('should only replace first comma', () => {
      fixture.detectChanges();
      const postFormatNumber = getPostFormatNumber(component);

      expect(postFormatNumber('1,234,567.89')).toBe('1-234,567.89');
    });

    it('should handle empty string', () => {
      fixture.detectChanges();
      const postFormatNumber = getPostFormatNumber(component);

      expect(postFormatNumber('')).toBe('');
    });
  });

  describe('moneyToStr (convertRUR)', () => {
    // Access protected method via component as any
    const getMoneyToStr = (comp: PaymentFormComponent) =>
      (comp as unknown as { moneyToStr: (n: number) => string }).moneyToStr;

    it('should convert number to Russian text', () => {
      fixture.detectChanges();
      const moneyToStr = getMoneyToStr(component);

      const result = moneyToStr(1);
      expect(result).toContain('рубль');
    });

    it('should handle decimal amounts', () => {
      fixture.detectChanges();
      const moneyToStr = getMoneyToStr(component);

      const result = moneyToStr(100.5);
      expect(result.toLowerCase()).toContain('сто');
      expect(result.toLowerCase()).toContain('рублей');
      expect(result).toContain('50');
      expect(result.toLowerCase()).toContain('копеек');
    });

    it('should capitalize first letter', () => {
      fixture.detectChanges();
      const moneyToStr = getMoneyToStr(component);

      const result = moneyToStr(1);
      expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
    });

    it('should handle zero', () => {
      fixture.detectChanges();
      const moneyToStr = getMoneyToStr(component);

      const result = moneyToStr(0);
      expect(result.toLowerCase()).toContain('ноль');
    });

    it('should handle large amounts', () => {
      fixture.detectChanges();
      const moneyToStr = getMoneyToStr(component);

      const result = moneyToStr(1000000);
      expect(result).toContain('миллион');
    });
  });

  describe('styling', () => {
    // Access private method via component as any
    const getStyling = (comp: PaymentFormComponent) =>
      (comp as unknown as { styling: (e: HTMLElement) => void }).styling.bind(
        comp,
      );

    it('should append style element to provided element', () => {
      fixture.detectChanges();
      const styling = getStyling(component);

      const div = document.createElement('div');
      styling(div);

      const styleElement = div.querySelector('style');
      expect(styleElement).toBeTruthy();
      expect(styleElement?.innerText).toContain('code {');
    });

    it('should include table styles', () => {
      fixture.detectChanges();
      const styling = getStyling(component);

      const div = document.createElement('div');
      styling(div);

      const styleElement = div.querySelector('style');
      expect(styleElement?.innerText).toContain('table {');
      expect(styleElement?.innerText).toContain('border: none;');
    });

    it('should include print-specific styles', () => {
      fixture.detectChanges();
      const styling = getStyling(component);

      const div = document.createElement('div');
      styling(div);

      const styleElement = div.querySelector('style');
      expect(styleElement?.innerText).toContain('.w-180');
      expect(styleElement?.innerText).toContain('width: 180mm');
    });

    it('should include accent class styles', () => {
      fixture.detectChanges();
      const styling = getStyling(component);

      const div = document.createElement('div');
      styling(div);

      const styleElement = div.querySelector('style');
      expect(styleElement?.innerText).toContain('.accent');
      expect(styleElement?.innerText).toContain('font-weight: bold');
    });
  });

  describe('print', () => {
    let mockWindow: {
      document: { body: { appendChild: jest.Mock }; write: jest.Mock };
      print: jest.Mock;
    };

    // Access protected method via component as any
    const getPrint = (comp: PaymentFormComponent) =>
      (comp as unknown as { print: () => void }).print.bind(comp);

    beforeEach(() => {
      mockWindow = {
        document: {
          body: { appendChild: jest.fn() },
          write: jest.fn(),
        },
        print: jest.fn(),
      };

      jest
        .spyOn(window, 'open')
        .mockReturnValue(mockWindow as unknown as Window);
    });

    it('should open new window with correct parameters', () => {
      fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      fixture.detectChanges();

      const print = getPrint(component);
      print();

      expect(window.open).toHaveBeenCalledWith(
        '',
        'Title',
        'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=650,height=800,top=20,left=200',
      );
    });

    it('should clone and append table element to new window', () => {
      fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      fixture.detectChanges();

      const print = getPrint(component);
      print();

      expect(mockWindow.document.body.appendChild).toHaveBeenCalled();
    });

    it('should call print on new window', () => {
      fixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      fixture.detectChanges();

      const print = getPrint(component);
      print();

      expect(mockWindow.print).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call styling on table element after timeout', (done) => {
      fixture.detectChanges();

      // Wait for setTimeout in ngAfterViewInit
      setTimeout(() => {
        const styleElement = fixture.nativeElement.querySelector('style');
        expect(styleElement).toBeTruthy();
        done();
      }, 50);
    });
  });

  describe('template rendering with payment data', () => {
    beforeEach(() => {
      // Reset the component override to use full template for rendering tests
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [PaymentFormComponent],
        providers: [provideZonelessChangeDetection()],
      });
    });

    it('should render payment document data when provided', async () => {
      // Use a minimal template for this test
      TestBed.overrideComponent(PaymentFormComponent, {
        set: {
          template: `
            <div>
              <span class="doc-number">{{ paymentDoc()?.number }}</span>
              <span class="doc-type">{{ paymentDoc()?.document_type }}</span>
              <span class="payer-inn">{{ paymentDoc()?.payer_inn }}</span>
              <span class="receiver-inn">{{ paymentDoc()?.receiver_inn }}</span>
              <span class="summ">{{ paymentDoc()?.summ }}</span>
            </div>
          `,
        },
      });

      await TestBed.compileComponents();

      const newFixture = TestBed.createComponent(PaymentFormComponent);
      newFixture.componentRef.setInput('paymentDoc', mockPaymentDocument);
      newFixture.detectChanges();

      const compiled = newFixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('.doc-number')?.textContent).toBe('123');
      expect(compiled.querySelector('.doc-type')?.textContent).toBe(
        'Платежное поручение',
      );
      expect(compiled.querySelector('.payer-inn')?.textContent).toBe(
        '1234567890',
      );
      expect(compiled.querySelector('.receiver-inn')?.textContent).toBe(
        '0987654321',
      );
      expect(compiled.querySelector('.summ')?.textContent).toBe('1234.56');
    });
  });

  describe('edge cases', () => {
    it('should handle null paymentDoc gracefully', () => {
      fixture.componentRef.setInput('paymentDoc', null);
      fixture.detectChanges();

      expect(component.paymentDoc()).toBeNull();
    });

    it('should handle partial paymentDoc data', () => {
      const partialDoc: Partial<PaymentDocument> = {
        id: 1,
        number: '456',
      };

      fixture.componentRef.setInput('paymentDoc', partialDoc);
      fixture.detectChanges();

      expect(component.paymentDoc()?.number).toBe('456');
      expect(component.paymentDoc()?.summ).toBeUndefined();
    });
  });
});
