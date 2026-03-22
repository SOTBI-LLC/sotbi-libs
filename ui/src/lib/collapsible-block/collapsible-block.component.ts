import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import type { FormGroup } from '@angular/forms';

export class CollapsibleBlockModel {
  public id = '';
  public title = '';
  public visible = true;
  public editMode = false;
  constructor(data: Partial<CollapsibleBlockModel> = {}) {
    Object.assign(this, data);
  }
}

@Component({
  selector: 'app-collapsible-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collapsible-block.component.html',
  styleUrls: ['./collapsible-block.component.scss'],
  animations: [
    trigger('visible', [
      state('false', style({ height: 0, display: 'none', opacity: 0 })),
      transition('false => true', [
        animate('0s ease-out', style({ height: '*', display: '*' })),
        animate('0s ease-out', style({ opacity: '*' })),
      ]),
      transition('true => false', [
        style({ height: '*', display: '*', opacity: '*' }),
        animate('0s ease-in'),
      ]),
    ]),
  ],
})
export class CollapsibleBlockComponent {
  public readonly isChanged = input<boolean>(false);
  public readonly fg = input<FormGroup>();
  public readonly canBeEdited = input<boolean>(true);
  public readonly canBeSaved = input<boolean>(false);
  public readonly showCustomBtn = input<boolean>(false);
  public readonly showDeleteBtn = input<boolean>(false);
  public readonly customBtnTitle = input<string | null>(null);
  public readonly customBtnSvgId = input<string | null>(null);
  public readonly additionalBtn = input<string | null>(null);
  public readonly isNew = input<boolean>(false);
  public readonly canBeDeleted = input<boolean>(false);
  public readonly deleteInfo = input<string>();
  public readonly edit = output<CollapsibleBlockModel>();
  public readonly saveBtnClick = output();
  public readonly customBtnClick = output();
  public readonly cancelBtnClick = output();
  public readonly additionalBtnClick = output();
  public readonly mouseOver = output();
  public readonly deleteBtnClick = output();
  public readonly block = input.required<CollapsibleBlockModel>();
  public readonly currentlyEditedBlock = input<CollapsibleBlockModel | null>(
    null,
  );

  protected readonly title = computed<string>(() => this._block()?.title ?? '');
  protected readonly _block = signal<CollapsibleBlockModel>(
    new CollapsibleBlockModel(),
  );
  protected readonly isValid = signal(false);

  protected get isThisCurrentlyEditedBlock() {
    return this.currentlyEditedBlock()?.id === this.block()?.id;
  }

  protected get isSaveBtnActive() {
    if (this.isChanged()) {
      return this.isValid() && this.canBeSaved();
    } else {
      return false;
    }
  }

  constructor() {
    effect(() => {
      this._block.set({
        ...this.block(),
        editMode: this.isThisCurrentlyEditedBlock,
      });
    });
    // Update formValidSignal whenever fg changes
    effect((onCleanup) => {
      const formGroup = this.fg();

      if (formGroup) {
        // Set initial value
        this.isValid.set(formGroup.valid);

        // Subscribe to changes
        const subscription = formGroup.statusChanges.subscribe(() => {
          this.isValid.set(formGroup.valid);
        });

        // Cleanup subscription when effect reruns or destroys
        onCleanup(() => subscription.unsubscribe());
      } else {
        this.isValid.set(false);
      }
    });
  }

  protected changeBlockEditMode() {
    if (this.block().editMode) {
      // редактирование -> просмотр
      // если объект изменен, то нельзя перейти в режим просмотра
      if (!this.isChanged && this._block()) {
        this._block.set({ ...this._block(), editMode: false });
      }
    } else {
      // просмотр -> редактирование
      // перейти в режим редактирования можно только если вообще нет изменений
      if (this.canBeEdited() && !this.isChanged()) {
        this._block.set({ ...this._block(), editMode: true });
        this.edit.emit(this._block());
      }
    }
  }

  protected changeBlockVisible() {
    this._block.set({ ...this.block(), visible: !this._block().visible });
  }

  protected clickToggleEdit(event: Event) {
    event.stopPropagation();
    this.changeBlockEditMode();
  }

  protected clickCustomBtn(event: Event) {
    event.stopPropagation();
    this.customBtnClick.emit();
  }
}
