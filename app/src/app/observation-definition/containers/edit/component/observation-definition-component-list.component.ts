import {Component, Input, ViewChild} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ObservationDefinitionComponent} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-component-list',
  templateUrl: './observation-definition-component-list.component.html',
})
export class ObservationDefinitionComponentListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public components!: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionComponent = {cardinality: {}, unit: {}};

}
