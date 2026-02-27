import {Component, EventEmitter, Input, Output} from '@angular/core';
import { BooleanInput, JoinPipe, MapPipe, ToBooleanPipe } from '@kodality-web/core-util';
import {ValueSetVersionRule, ValueSetVersionRuleSet} from 'term-web/resources/_lib';

import { MuiNoDataModule, MuiFormModule, MuiCheckboxModule, MuiListModule, MuiIconModule, MuiDividerModule, MuiAbbreviateModule } from '@kodality-web/marina-ui';
import { FormsModule } from '@angular/forms';
import { EntityPropertyValueInputComponent } from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-value-set-version-rule-set-widget',
    templateUrl: 'value-set-version-rule-set-widget.component.html',
    imports: [MuiNoDataModule, MuiFormModule, MuiCheckboxModule, FormsModule, MuiListModule, MuiIconModule, MuiDividerModule, MuiAbbreviateModule, EntityPropertyValueInputComponent, TranslatePipe, JoinPipe, MapPipe, ToBooleanPipe, PrivilegedPipe]
})
export class ValueSetVersionRuleSetWidgetComponent{
  @Input() public ruleSet: ValueSetVersionRuleSet;
  @Input() @BooleanInput() public clickable: boolean | string = false;
  @Output() public ruleSetChanged: EventEmitter<void> = new EventEmitter();
  @Output() public ruleSelected: EventEmitter<{index: number, rule: ValueSetVersionRule}> = new EventEmitter();
}
