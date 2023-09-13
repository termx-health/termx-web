import {Component, Input} from '@angular/core';
import {BooleanInput, isDefined} from '@kodality-web/core-util';
import {CodeSystemAssociation} from 'app/src/app/resources/_lib';

@Component({
  selector: 'tw-code-system-association-edit',
  templateUrl: './code-system-association-edit.component.html',
  styles: [`
    .col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-self: stretch;
    }
    .row {
      flex: 1;
      display: flex;
      align-items: center;
    }
    .m-subtitle {
      white-space: nowrap;
    }
  `]
})
export class CodeSystemAssociationEditComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public associations?: CodeSystemAssociation[];
  @Input() public codeSystemId?: string;
  @Input() public code?: string;

  public getAssociations(): CodeSystemAssociation[] | undefined {
    return this.associations?.filter(a => isDefined(a.targetId));
  }

  protected deleteAssociation(association: CodeSystemAssociation): void {
    this.associations = [...this.associations.filter(a => a !== association)];
  }
}
