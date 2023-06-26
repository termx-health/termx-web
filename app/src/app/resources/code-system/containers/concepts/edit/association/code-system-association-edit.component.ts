import {Component, Input} from '@angular/core';
import {BooleanInput, isDefined} from '@kodality-web/core-util';
import {CodeSystemAssociation} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-code-system-association-edit',
  templateUrl: './code-system-association-edit.component.html',
})
export class CodeSystemAssociationEditComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public associations?: CodeSystemAssociation[];
  @Input() public codeSystemId?: string;

  public getAssociations(): CodeSystemAssociation[] | undefined {
    return this.associations?.filter(a => isDefined(a.targetId));
  }
}
