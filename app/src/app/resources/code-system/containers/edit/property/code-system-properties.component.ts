import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EntityProperty, EntityPropertyRule, EntityPropertyRuleFilter} from 'app/src/app/resources/_lib';
import {BooleanInput, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';

@Component({
  selector: 'tw-cs-properties',
  templateUrl: './code-system-properties.component.html',
})
export class CodeSystemPropertiesComponent implements OnChanges {
  @Input() public codeSystemId?: string | null;
  @Input() public properties: EntityProperty[] = [];
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  protected rowInstance: EntityProperty = {rule: {filters: []}, status: 'active'};
  protected filterRowInstance: EntityPropertyRuleFilter = {type: 'entity-property'};
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  protected defProperties: {[key: string]: {selected: boolean, property: EntityProperty}} = {
    "display": {selected: false, property: {name: "display", type: "string", status: "active"}},
    "definition": {selected: false, property: {name: "definition", type: "string", status: "active"}},
    "alias": {selected: false, property: {name: "alias", type: "string", status: "active"}},
    "order": {selected: false, property: {name: "order", type: "integer", status: "active"}},
    "synonym": {selected: false, property: {name: "synonym", type: "code", status: "active"}},
    "valid-from": {selected: false, property: {name: "valid-from", type: "dateTime", status: "active"}},
    "valid-to": {selected: false, property: {name: "valid-to", type: "dateTime", status: "active"}}
  };

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties) {
      this.properties.forEach(p => {
        p.rule ??= new EntityPropertyRule();
        p.rule.filters ??= [];
      });
    }
  }

  protected defPropertySelectionChange(selected: boolean, p: string): void {
    if (selected) {
      this.addProperty(this.defProperties[p].property);
    } else {
      const property = this.properties.find(prop => prop.name === p);
      const index = property ? this.properties.indexOf(property) : undefined;
      if (isDefined(index)) {
        this.removeProperty(index);
      }
    }
  }

  private addProperty(property?: EntityProperty): void {
    this.properties = [...(this.properties || []), property || {status: 'active'}];
  }

  private removeProperty(index: number): void {
    this.properties!.splice(index, 1);
    this.properties = [...this.properties];
  }

  public getProperties(): EntityProperty[] {
    return this.properties || [];
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  protected filterProperties = (properties: EntityProperty[]): EntityProperty[] => {
    return properties?.filter(p => isDefined(p.id));
  };

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

  public deletePropertyUsages(propertyId: number): void {
    this.loader.wrap('load', this.codeSystemService.deleteEntityPropertyUsages(this.codeSystemId, propertyId)).subscribe();
  }
}
