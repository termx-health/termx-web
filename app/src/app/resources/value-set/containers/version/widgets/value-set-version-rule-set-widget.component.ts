import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {ValueSetVersionRule, ValueSetVersionRuleSet} from '../../../../_lib';

@Component({
  selector: 'tw-value-set-version-rule-set-widget',
  templateUrl: 'value-set-version-rule-set-widget.component.html'
})
export class ValueSetVersionRuleSetWidgetComponent{
  @Input() public ruleSet: ValueSetVersionRuleSet;
  @Input() @BooleanInput() public clickable: boolean | string = false;
  @Output() public ruleSetChanged: EventEmitter<void> = new EventEmitter();
  @Output() public ruleSelected: EventEmitter<{index: number, rule: ValueSetVersionRule}> = new EventEmitter();
}
