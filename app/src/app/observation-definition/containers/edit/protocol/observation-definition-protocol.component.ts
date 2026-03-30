import {Component, Input, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@termx-health/core-util';
import {ObservationDefinitionProtocol, ObservationDefinitionProtocolValue} from 'term-web/observation-definition/_lib';
import {
  ObservationDefinitionComponentListComponent
} from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';

import { MuiFormModule, MuiSelectModule } from '@termx-health/ui';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { ObservationDefinitionValueSelectComponent } from 'term-web/observation-definition/_lib/components/observation-definition-value-select.component';
import { ObservationDefinitionComponentListComponent as ObservationDefinitionComponentListComponent_1 } from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-obs-def-protocol',
    templateUrl: './observation-definition-protocol.component.html',
    imports: [
    FormsModule,
    MuiFormModule,
    MuiSelectModule,
    ValueSetSearchComponent,
    ObservationDefinitionValueSelectComponent,
    ObservationDefinitionComponentListComponent_1,
    TranslatePipe
],
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
