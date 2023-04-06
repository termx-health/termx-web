import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ObservationDefinitionComponent} from 'term-web/observation-definition/_lib';

@Component({
  selector: 'tw-obs-def-component-list',
  templateUrl: './observation-definition-component-list.component.html',
})
export class ObservationDefinitionComponentListComponent implements OnChanges{
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public components!: ObservationDefinitionComponent[];

  @ViewChild("form") public form?: NgForm;

  protected rowInstance: ObservationDefinitionComponent = {cardinality: {}, unit: {}};

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['components'] && this.components) {
      this.components.forEach(c => {
        c.cardinality ??= {};
        c.unit ??= {};
      });
    }
  }

  protected clearBinding(component: ObservationDefinitionComponent): void {
    component.unit = {};
    component.valueSet = undefined;
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
