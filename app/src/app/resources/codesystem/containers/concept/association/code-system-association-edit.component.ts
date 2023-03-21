import {Component, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemAssociation} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-code-system-association-edit',
  templateUrl: './code-system-association-edit.component.html',
})
export class CodeSystemAssociationEditComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public associations?: CodeSystemAssociation[];
  @Input() public codeSystemId?: string;

  @ViewChild("form") public form?: NgForm;

  public loading: {[k: string]: boolean} = {};

  public constructor() {}

  public addAssociation(): void {
    this.associations = [...this.associations || [], {status: 'active'}];
  }

  public removeAssociation(index: number): void {
    this.associations?.splice(index, 1);
    this.associations = [...this.associations!];
  }

  public valid(): boolean {
    return validateForm(this.form);
  }
}
