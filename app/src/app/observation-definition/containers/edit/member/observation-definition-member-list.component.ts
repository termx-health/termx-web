import {Component, Input, ViewChild} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ObservationDefinitionMember} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-member-list',
  templateUrl: './observation-definition-member-list.component.html',
})
export class ObservationDefinitionMemberListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public members!: ObservationDefinitionMember[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionMember = {cardinality: {}};

}
