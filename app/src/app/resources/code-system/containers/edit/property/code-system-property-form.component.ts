import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, EntityProperty, EntityPropertyRuleFilter} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-code-system-property-form',
  templateUrl: './code-system-property-form.component.html',
})
export class CodeSystemPropertyFormComponent implements OnChanges{
  @Input() public codeSystem?: string;
  @Input() public property?: EntityProperty;
  @ViewChild("form") public form?: NgForm;

  protected filterRowInstance: EntityPropertyRuleFilter = {type: 'entity-property'};
  protected properties: EntityProperty[] = [];

  public constructor(private codeSystemService: CodeSystemLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.property.rule ??= {};
      this.property.rule.filters ??= [];
    }

    if (changes['codeSystem'] && this.codeSystem) {
      this.codeSystemService.load(this.codeSystem, true).subscribe(cs => this.properties = cs.properties);
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected filterTypeChanged(type: string, f: EntityPropertyRuleFilter): void {
    if (type === 'association') {
      f.property = undefined;
      f.value = undefined;
    }
    if (type === 'property') {
      f.association = undefined;
      f.value = undefined;
    }
  }
}
