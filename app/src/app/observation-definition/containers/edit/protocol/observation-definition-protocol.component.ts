import {Component, Input, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {ObservationDefinitionProtocol, ObservationDefinitionProtocolValue} from 'term-web/observation-definition/_lib';
import {
  ObservationDefinitionComponentListComponent
} from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';

@Component({
  selector: 'tw-obs-def-protocol',
  templateUrl: './observation-definition-protocol.component.html',
})
export class ObservationDefinitionProtocolComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public protocol!: ObservationDefinitionProtocol;

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ObservationDefinitionComponentListComponent) public componentListComponent?: ObservationDefinitionComponentListComponent;


  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form) && (!isDefined(this.componentListComponent) || this.componentListComponent.validate());
  }

  public onUsageChange(val: ObservationDefinitionProtocolValue, usage: string, valueSet: string): void {
    val.values = [];
    val.valueSet = undefined;
    if (usage === 'value-set') {
      val.valueSet = valueSet;
    }
  }
}
