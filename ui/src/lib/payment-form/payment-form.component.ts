import { CommonModule } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PaymentDocument } from '@sotbi/models';
import { amountToWords } from '@sotbi/utils';

// Angular всегда выпиливает стили и вставляет их в head
// Такое его поведение делает невозможной задачу напечатать
// элемент через новый document, так как стилей у элемента нет.
// Поэтому workaround хранить стили в виде строки и 'ручками' применять
const STYLE = `
.payments-dialog__table {
    border: none;
}
  :where(.payments-dialog__table) code {
    white-space: pre;
  }
  :where(.payments-dialog__table) .code {
    white-space: pre;
  }
:where(.payments-dialog__table) .w-180{
  width: 180mm;
}
:where(.payments-dialog__table) .table-style{
  width: 100%;
  table-layout: fixed;
}
:where(.payments-dialog__table) .w-35{
  width: 35mm;
}
:where(.payments-dialog__table) .payment-form__spacer-15{
  width: 15mm;
}
:where(.payments-dialog__table) .h-7-fs-10{
  height: 7mm;
  font-size: 10pt;
}
:where(.payments-dialog__table) .mt-3{
  margin-top: 3mm;
}
:where(.payments-dialog__table) .w-82-bottom{
  width: 82mm;
  vertical-align: bottom;
}
:where(.payments-dialog__table) .w-35-bottom{
  width: 35mm;
  vertical-align: bottom;
}
:where(.payments-dialog__table) .w-5{
 width: 5mm;
}
:where(.payments-dialog__table) .h-5{
  width: 5mm;
}
:where(.payments-dialog__table) .center{
  text-align: center;
}
:where(.payments-dialog__table) .payment-form__spacer-11{
  width: 11mm;
}
:where(.payments-dialog__table) .w-8h-8{
  width: 8mm;
  height: 8mm;
}
:where(.payments-dialog__table) .w-20h-15{
  width: 20mm;
  height: 15mm;
}
:where(.payments-dialog__table) .w-27{
  width: 27%;
}
:where(.payments-dialog__table) .w-8{
  width: 8%;
}
:where(.payments-dialog__table) .w-36{
  width: 36%;
}
:where(.payments-dialog__table) .h-10{
  height: 10mm;
}
:where(.payments-dialog__table) .w-30{
  width: 30%;
}
:where(.payments-dialog__table) .w-38{
 width: 38%;
}
:where(.payments-dialog__table) .w-24ls-004{
  width: 24%;
  letter-spacing: -0.04em;
}
:where(.payments-dialog__table) .w-15per{
  width: 15%;
}
:where(.payments-dialog__table) .w-5per{
  width: 5%;
  }
:where(.payments-dialog__table) .w-12per{
  width: 12%;
}
:where(.payments-dialog__table) .w-18per{
  width: 18%;
}
:where(.payments-dialog__table) .h-25{
  height: 25mm;
}
:where(.payments-dialog__table) .h-15{
  height: 15mm;
}
:where(.payments-dialog__table) .w-60{
  width: 60mm;
}
:where(.payments-dialog__table) .bottom{
  vertical-align: bottom;
  }
  :where(.payments-dialog__table) .nowr {
    white-space: nowrap;
  }
  :where(.payments-dialog__table) td {
    padding: 0;
    border: 0;
  }
  :where(.payments-dialog__table) table {
    border: none;
  }
  :where(.payments-dialog__table) img {
    border: none;
  }
  :where(.payments-dialog__table) form {
    margin: 0px;
    padding: 0px;
  }
  :where(.payments-dialog__table) sup {
    font-size: 66%;
    line-height: 0.5;
  }
  :where(.payments-dialog__table) li {
    list-style: square outside;
    padding: 0px;
    margin: 0px;
  }
  :where(.payments-dialog__table) ul {
    list-style: square outside;
    padding: 0em 0em 0em 0em;
    margin: 0em 0em 0em 1.5em;
  }
  :where(.payments-dialog__table) .fakelink {
    cursor: pointer;
  }
  :where(.payments-dialog__table) .centered {
    margin-left: auto;
    margin-right: auto;
  }
  :where(.payments-dialog__table) .zerosize {
    font-size: 1px;
  }
  :where(.payments-dialog__table) .underlined {
    text-decoration: underline;
  }
  :where(.payments-dialog__table) .bolded {
    font-weight: bold;
  }
  :where(.payments-dialog__table) .vbottom {
    vertical-align: bottom;
  }
  :where(.payments-dialog__table) .vsub {
    vertical-align: sub;
  }
  :where(.payments-dialog__table) .h_left {
    text-align: left;
  }
  :where(.payments-dialog__table) .h_right {
    text-align: right;
  }
  :where(.payments-dialog__table) .h_center {
    text-align: center;
  }
  :where(.payments-dialog__table) .v_top {
    vertical-align: top;
  }
  :where(.payments-dialog__table) .v_bottom {
    vertical-align: bottom;
  }
  :where(.payments-dialog__table) .v_middle {
    vertical-align: middle;
  }
  :where(.payments-dialog__table) .w100,
  :where(.payments-dialog__table) .full_w,
  :where(.payments-dialog__table) .full {
    width: 100%;
  }
  :where(.payments-dialog__table) .h100,
  :where(.payments-dialog__table) .full_h,
  :where(.payments-dialog__table) .full {
    height: 100%;
  }
  :where(.payments-dialog__table) .cramp,
  :where(.payments-dialog__table) .cramp_w {
    width: 1px;
  }
  :where(.payments-dialog__table) .cramp,
  :where(.payments-dialog__table) .cramp_h {
    height: 1px;
  }
  :where(.payments-dialog__table) .ucfirst:first-letter {
    text-transform: uppercase;
  }
  :where(.payments-dialog__table) .clean {
    clear: both;
  }
  :where(.payments-dialog__table) .rectangle {
    border: black 1pt solid;
  }
  :where(.payments-dialog__table) .linetop {
    border-top: black 1pt solid;
  }
  :where(.payments-dialog__table) .linebottom {
    border-bottom: black 1pt solid;
  }
  :where(.payments-dialog__table) .lineleft {
    border-left: black 1pt solid;
    padding-left: 1mm;
  }
  :where(.payments-dialog__table) .accent {
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 11pt;
    line-height: 1;
  }
  :where(.payments-dialog__table) .data {
    font-size: 11pt;
    vertical-align: top;
    word-break: break-word;
  }
  :where(.payments-dialog__table) .field {
    font-size: 9pt;
    line-height: 1.4;
    height: 5mm;
    vertical-align: top;
  }
  :where(.payments-dialog__table) .field--bottom {
    vertical-align: bottom;
  }
  table:where(.payments-dialog__table).itbl tr {
   font-family: "Times New Roman", Times, serif;
   font-size: 11pt;
    /*width: 190mm;*/
    /*margin: 12mm 0 12mm 10mm;*/
  }
  :where(.payments-dialog__table) p {
    margin: 2pt 0 2pt 0;
  }
  :where(.payments-dialog__table) .payment-form__full-width { width: 100%; }
`;

@Component({
  selector: 'payment-form',
  imports: [CommonModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent implements AfterViewInit {
  public readonly paymentDoc = input.required<PaymentDocument>();
  protected readonly moneyToStr = amountToWords;
  private readonly targetElementSelectorName = '.payments-dialog__table';

  public ngAfterViewInit(): void {
    setTimeout(() => {
      const table = document.querySelector(
        this.targetElementSelectorName,
      ) as HTMLTableElement;
      if (table) {
        this.styling(table);
      }
    });
  }

  protected postFormatNumber(numStr: string) {
    return numStr.replace(',', '-');
  }

  protected print() {
    const win = window.open(
      '',
      'Title',
      'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=650,height=800,top=20,left=200',
    );
    // важно: если не клонировать, физически удаляет тег из документа!!
    const elem = document
      ?.querySelector(this.targetElementSelectorName)
      ?.cloneNode(true);
    // win.document.write(elem.innerHTML); // <-- не подходит из-за существующей конвертации тегов при рендеренге
    win?.document.body.appendChild(elem ?? new Node());
    // this.styling(win.document.getElementsByTagName('head')[0]);
    win?.print();
  }

  private styling(element: HTMLElement) {
    const styleElement = document.createElement('style') as HTMLStyleElement;
    styleElement.innerText = STYLE;
    element.appendChild(styleElement);
  }
}
