import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@termx-health/core-util';
import {ObservationDefinitionMember} from 'term-web/observation-definition/_lib';
import { MuiEditableTableModule, MuiNumberInputModule, MuiCoreModule } from '@termx-health/ui';
import { ObservationDefinitionSearchComponent } from 'term-web/observation-definition/_lib/components/observation-definition-search.component';
import { RouterLink } from '@angular/router';
import { MarinaUtilModule } from '@termx-health/util';

@Component({
    selector: 'tw-obs-def-member-list',
    templateUrl: './observation-definition-member-list.component.html',
    imports: [
        FormsModule,
        MuiEditableTableModule,
        MuiNumberInputModule,
        ObservationDefinitionSearchComponent,
        MuiCoreModule,
        RouterLink,
        MarinaUtilModule,
    ],
})
export class ObservationDefinitionMemberListComponent implements OnChanges{
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public members!: ObservationDefinitionMember[];
  @Input() public observationDefinitionId: number;

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionMember = {cardinality: {}};

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['members'] && this.members) {
      this.members.forEach(m => m.cardinality ??= {});
    }
  }
}
