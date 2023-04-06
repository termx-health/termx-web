import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ObservationDefinitionMember} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-member-list',
  templateUrl: './observation-definition-member-list.component.html',
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
