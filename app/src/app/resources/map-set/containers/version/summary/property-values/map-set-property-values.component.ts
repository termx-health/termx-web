import {Component, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import {MapSetProperty, MapSetPropertyValue} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {MapSetPropertyValueInputComponent} from 'term-web/resources/map-set/containers/version/summary/property-values/map-set-property-value-input.component';

@Component({
  selector: 'tw-map-set-property-values',
  templateUrl: 'map-set-property-values.component.html',
})
export class MapSetPropertyValuesComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public propertyValues?: MapSetPropertyValue[];
  @Input() public properties?: MapSetProperty[];

  @ViewChild("form") public form?: NgForm;
  @ViewChildren(MapSetPropertyValueInputComponent) public propertyValueInputs?: QueryList<MapSetPropertyValueInputComponent>;

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['properties'] || changes['propertyValues'])
      && this.properties && this.propertyValues
      && !this.viewMode) {
      this.addDefProperties();
    }
  }

  public checkPropertyType = (type: string, propertyValue: MapSetPropertyValue): boolean => {
    return !!this.properties.find(p => propertyValue.mapSetPropertyId === p.id && p.type && type.split(',').includes(p.type));
  };

  public getPropertyValues(): MapSetPropertyValue[] | undefined {
    return this.propertyValues?.filter(pv => isDefined(pv.value) && pv.value !== '' && (!this.checkPropertyType('Coding', pv) || pv.value.code && pv.value.codeSystem));
  }

  public valid(): boolean {
    return validateForm(this.form) && (!this.propertyValueInputs || !this.propertyValueInputs.find(i => !i.valid()));
  }

  public getProperty = (id: number, properties: MapSetProperty[]): MapSetPropertyValue => {
    return properties?.find(p => p.id === id);
  };

  private addDefProperties(): void {
    const defProperties = this.properties
      .filter(p => !this.propertyValues?.find(pv => pv.mapSetPropertyId === p.id))
      .map(p => ({mapSetPropertyId: p.id, mapSetPropertyName: p.name, value: p.type === 'Coding' ? {} : undefined}));
    this.propertyValues = [...this.propertyValues || [], ...defProperties];
  }

  protected isRequired = (i: number, properties: MapSetProperty[]): boolean => {
    const val = this.propertyValues[i];
    const requiredProperty = properties?.find(p => p.id === val.mapSetPropertyId)?.required;
    const samePropertyValue = this.propertyValues.find(p => p.mapSetPropertyId === val.mapSetPropertyId && this.propertyValues.indexOf(p) < i);
    return requiredProperty && !samePropertyValue;
  };
}
