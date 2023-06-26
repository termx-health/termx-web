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

  protected designationProperties: EntityProperty[] = [];
  protected basicProperties: EntityProperty[];

  protected designationRowInstance: EntityProperty = {kind: 'designation', type: 'string', rule: {filters: []}, status: 'active'};
  protected propertyRowInstance: EntityProperty = {kind: 'property', rule: {filters: []}, status: 'active'};
  protected filterRowInstance: EntityPropertyRuleFilter = {type: 'entity-property'};
  protected loader = new LoadingManager();

  @ViewChild("designationForm") public designationForm?: NgForm;
  @ViewChild("propertyForm") public propertyForm?: NgForm;

  protected defDesignations: {[key: string]: {selected: boolean, property: EntityProperty}} = {
    "display": {selected: false, property: {kind: 'designation', name: "display", type: "string", status: "active"}},
    "definition": {selected: false, property: {kind: 'designation', name: "definition", type: "string", status: "active"}},
    "alias": {selected: false, property: {kind: 'designation', name: "alias", type: "string", status: "active"}},
    "label": {selected: false, property: {kind: 'designation', name: "label", type: "string", status: "active"}}
  };

  protected defProperties: {[key: string]: {selected: boolean, property: EntityProperty}} = {
    "order": {selected: false, property: {kind: 'property', name: "order", type: "integer", status: "active"}},
    "synonym": {selected: false, property: {kind: 'property', name: "synonym", type: "code", status: "active"}},
    "valid-from": {selected: false, property: {kind: 'property', name: "valid-from", type: "dateTime", status: "active"}},
    "valid-to": {selected: false, property: {kind: 'property', name: "valid-to", type: "dateTime", status: "active"}}
  };

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties) {
      this.properties.forEach(p => {
        p.rule ??= new EntityPropertyRule();
        p.rule.filters ??= [];
      });
      this.designationProperties = this.properties.filter(p => p.kind === 'designation');
      this.basicProperties = this.properties.filter(p => p.kind === 'property');
    }
  }

  protected defPropertySelectionChange(selected: boolean, p: string, kind: 'designation' | 'property'): void {
    let defProp = kind === 'designation' ? this.defDesignations : this.defProperties;
    if (selected) {
      this.addProperty(defProp[p].property, kind);
    } else {
      this.removeProperty(p, kind);
    }
  }

  private addProperty(property: EntityProperty, kind: 'designation' | 'property'): void {
    if (kind === 'designation') {
      const p = this.designationProperties.find(prop => prop.name === property.name);
      this.designationProperties = p ? this.designationProperties : [...(this.designationProperties || []), property];
    }
    if (kind === 'property') {
      const p = this.basicProperties.find(prop => prop.name === property.name);
      this.basicProperties = p ? this.basicProperties : [...(this.basicProperties || []), property];
    }
  }

  private removeProperty(p: string, kind: 'designation' | 'property'): void {
    if (kind === 'designation') {
      const property = this.designationProperties.find(prop => prop.name === p);
      const index = property ? this.designationProperties.indexOf(property) : undefined;
      if (index) {
        this.designationProperties.splice(index, 1);
        this.designationProperties = [...this.designationProperties];
      }
    }
    if (kind === 'property') {
      const property = this.basicProperties.find(prop => prop.name === p);
      const index = property ? this.basicProperties.indexOf(property) : undefined;
      if (index) {
        this.basicProperties.splice(index, 1);
        this.basicProperties = [...this.basicProperties];
      }
    }
  }

  public getProperties(): EntityProperty[] {
    return [...this.designationProperties, ...this.basicProperties];
  }

  public valid(): boolean {
    return validateForm(this.designationForm) && validateForm(this.propertyForm);
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
