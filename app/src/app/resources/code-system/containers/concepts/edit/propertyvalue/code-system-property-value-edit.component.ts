import {Component, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import {EntityProperty, EntityPropertyValue} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {EntityPropertyValueInputComponent} from 'app/src/app/core/ui/components/inputs/property-value-input/entity-property-value-input.component';

@Component({
  selector: 'tw-code-system-property-value-edit',
  templateUrl: 'code-system-property-value-edit.component.html',
})
export class CodeSystemPropertyValueEditComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public propertyValues?: EntityPropertyValue[];
  @Input() public properties?: EntityProperty[];
  @Input() public codeSystemId?: string;

  @ViewChild("form") public form?: NgForm;
  @ViewChildren(EntityPropertyValueInputComponent) public propertyValueInputs?: QueryList<EntityPropertyValueInputComponent>;

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['properties'] || changes['propertyValues'])
      && this.properties && this.propertyValues
      && !this.viewMode) {
      this.addDefProperties();
    }
  }

  public checkPropertyType = (type: string, propertyValue: EntityPropertyValue): boolean => {
    return !!this.properties.find(p => propertyValue.entityPropertyId === p.id && p.type && type.split(',').includes(p.type));
  };

  public getPropertyValues(): EntityPropertyValue[] | undefined {
    return this.propertyValues?.filter(pv => isDefined(pv.value) && pv.value !== '' && (!this.checkPropertyType('Coding', pv) || pv.value.code && pv.value.codeSystem));
  }

  public valid(): boolean {
    return validateForm(this.form) && (!this.propertyValueInputs || !this.propertyValueInputs.find(i => !i.valid()));
  }

  public getProperty = (id: number, properties: EntityProperty[]): EntityProperty => {
    return properties?.find(p => p.id === id);
  };

  private addDefProperties(): void {
    const properties = this.properties.filter(p => p.kind === 'property');
    properties
      .filter(p => !this.propertyValues?.find(pv => pv.entityPropertyId === p.id))
      .forEach(p => {
        const pv = {entityPropertyId: p.id, entityProperty: p.name, value: p.type === 'Coding' ? {} : undefined};
        this.propertyValues = [...this.propertyValues || [], pv];
      });
  }

  protected isRequired = (i: number, properties: EntityProperty[]): boolean => {
    const val = this.propertyValues[i];
    const requiredProperty = properties?.find(p => p.id === val.entityPropertyId)?.required;
    const samePropertyValue = this.propertyValues.find(p => p.entityPropertyId === val.entityPropertyId && this.propertyValues.indexOf(p) < i);
    return requiredProperty && !samePropertyValue;
  };
}
