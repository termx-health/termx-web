import {Component, Input} from '@angular/core';
import {BooleanInput, isDefined} from '@termx-health/core-util';
import {CodeSystemAssociation} from 'term-web/resources/_lib';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { MuiNoDataModule, MuiNumberInputModule, MuiIconModule, MuiPopconfirmModule } from '@termx-health/ui';
import { AssociationTypeSearchComponent } from 'term-web/resources/_lib/association/containers/association-type-search.component';
import { FormsModule } from '@angular/forms';
import { CodeSystemEntityVersionSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-entity-version-search.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-code-system-association-edit',
    templateUrl: './code-system-association-edit.component.html',
    styles: [`
    .association-col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-self: stretch;
    }
    .association-row {
      flex: 1;
      display: flex;
      align-items: center;
    }
    .m-subtitle {
      white-space: nowrap;
    }
  `],
    imports: [MuiNoDataModule, AssociationTypeSearchComponent, FormsModule, CodeSystemEntityVersionSearchComponent, ValueSetConceptSelectComponent, MuiNumberInputModule, MuiIconModule, MuiPopconfirmModule, AsyncPipe, UpperCasePipe, LocalizedConceptNamePipe]
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
