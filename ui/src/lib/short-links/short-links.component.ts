import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClarityModule } from '@clr/angular';

type shortLinksForm = FormGroup<{
  name: FormControl<string | null>;
  url: FormControl<string | null>;
}>;

@Component({
  selector: 'app-short-links-wrap',
  imports: [FormsModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './short-links.component.html',
  styleUrls: ['./short-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortLinksComponent {
  public readonly shortLinks = input<FormArray<shortLinksForm>>(
    new FormArray<shortLinksForm>([]),
  );

  protected createLink() {
    const fg = new FormGroup({
      name: new FormControl<string | null>(null),
      url: new FormControl<string | null>(null, [Validators.required]),
    });
    this.shortLinks().push(fg, { emitEvent: false });
  }

  protected onRemoveLink(index: number) {
    this.shortLinks().removeAt(index);
  }
}
