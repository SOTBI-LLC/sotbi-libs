import { CommonModule } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PaymentDocument } from '@sotbi/models';
import { convert } from 'number-to-words-ru';

// Angular всегда выпиливает стили и вставляет их в head
// Такое его поведение делает невозможной задачу напечатать
// элемент через новый document, так как стилей у элемента нет.
// Поэтому workaround хранить стили в виде строки и 'ручками' применять
const STYLE = `
code {
    white-space: pre;
  }
  .code {
    white-space: pre;
  }
clr-icon{
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
.w-180{
  width: 180mm;
}
.table-style{
  width: 100%;
  table-layout: fixed;
}
.w-35{
  width: 35mm;
}
.w-15{
  width: 15mm;
}
.h-7-fs-10{
  height: 7mm;
  font-size: 10pt;
}
.mt-3{
  margin-top: 3mm;
}
.w-82-bottom{
  width: 82mm;
  vertical-align: bottom;
}
.w-35-bottom{
  width: 35mm;
  vertical-align: bottom;
}
.w-5{
 width: 5mm;
}
.h-5{
  width: 5mm;
}
.center{
  text-align: center;
}
.w-11{
  width: 11mm;
}
.w-8h-8{
  width: 8mm;
  height: 8mm;
}
.w-20h-15{
  width: 20mm;
  height: 15mm;
}
.w-27{
  width: 27%;
}
.w-8{
  width: 8%;
}
.w-36{
  width: 36%;
}
.h-10{
  height: 10mm;
}
.w-30{
  width: 30%;
}
.w-38{
 width: 38%;
}
.w-24ls-004{
  width: 24%;
  letter-spacing: -0.04em;
}
.w-15per{
  width: 15%;
}
.w-5per{
  width: 5%;
  }
.w-12per{
  width: 12%;
}
.w-18per{
  width: 18%;
}
.h-25{
  height: 25mm;
}
.h-15{
  height: 15mm;
}
.w-60{
  width: 60mm;
}
.bottom{
  vertical-align: bottom;
  }
  .nowr {
    white-space: nowrap;
  }
  td {
    padding: 0;
    border: 0;
  }
  table {
    border: none;
  }
  img {
    border: none;
  }
  form {
    margin: 0px;
    padding: 0px;
  }
  sup {
    font-size: 66%;
    line-height: 0.5;
  }
  li {
    list-style: square outside;
    padding: 0px;
    margin: 0px;
  }
  ul {
    list-style: square outside;
    padding: 0em 0em 0em 0em;
    margin: 0em 0em 0em 1.5em;
  }
  .fakelink {
    cursor: pointer;
  }
  .centered {
    margin-left: auto;
    margin-right: auto;
  }
  .zerosize {
    font-size: 1px;
  }
  .underlined {
    text-decoration: underline;
  }
  .bolded {
    font-weight: bold;
  }
  .vbottom {
    vertical-align: bottom;
  }
  .vsub {
    vertical-align: sub;
  }
  .h_left {
    text-align: left;
  }
  .h_right {
    text-align: right;
  }
  .h_center {
    text-align: center;
  }
  .v_top {
    vertical-align: top;
  }
  .v_bottom {
    vertical-align: bottom;
  }
  .v_middle {
    vertical-align: middle;
  }
  .w100,
  .full_w,
  .full {
    width: 100%;
  }
  .h100,
  .full_h,
  .full {
    height: 100%;
  }
  .cramp,
  .cramp_w {
    width: 1px;
  }
  .cramp,
  .cramp_h {
    height: 1px;
  }
  .ucfirst:first-letter {
    text-transform: uppercase;
  }
  .clean {
    clear: both;
  }
  .rectangle {
    border: black 1pt solid;
  }
  .linetop {
    border-top: black 1pt solid;
  }
  .linebottom {
    border-bottom: black 1pt solid;
  }
  .lineleft {
    border-left: black 1pt solid;
    padding-left: 1mm;
  }
  .accent {
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 11pt;
    line-height: 1;
  }
  .data {
    font-size: 11pt;
    vertical-align: top;
    word-break: break-word;
  }
  .field {
    font-size: 9pt;
    line-height: 1.4;
    height: 5mm;
    vertical-align: top;
  }
  .field--bottom {
    vertical-align: bottom;
  }
  table.itbl tr {
   font-family: "Times New Roman", Times, serif;
   font-size: 11pt;
    /*width: 190mm;*/
    /*margin: 12mm 0 12mm 10mm;*/
  }
  p {
    margin: 2pt 0 2pt 0;
  }`;

@Component({
  selector: 'payment-form',
  imports: [CommonModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFormComponent implements AfterViewInit {
  public readonly paymentDoc = input.required<PaymentDocument>();
  protected readonly moneyToStr = convert;
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
