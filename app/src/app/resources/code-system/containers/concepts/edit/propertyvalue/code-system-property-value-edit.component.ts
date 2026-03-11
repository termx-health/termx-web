import {Component, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, isDefined, remove, validateForm, ApplyPipe, FilterPipe, SortPipe } from '@kodality-web/core-util';
import {EntityPropertyValueInputComponent} from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import {EntityProperty, EntityPropertyValue} from 'term-web/resources/_lib';
import {v4 as uuid} from "uuid";

import { MuiNoDataModule, MuiFormModule, MuiIconModule, MuiPopconfirmModule } from '@kodality-web/marina-ui';
import { EntityPropertyValueInputComponent as EntityPropertyValueInputComponent_1 } from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import { CodeSystemCodingReferenceComponent } from 'term-web/resources/code-system/components/code-system-coding-reference.component';

type ExtendedEntityPropertyValue = EntityPropertyValue & {_key?: string};

@Component({
    selector: 'tw-code-system-property-value-edit',
    templateUrl: 'code-system-property-value-edit.component.html',
    styles: [`
    .prop-grid {
      display: grid;
      gap: 0.5rem 1rem;
      align-items: start;
    }

    .prop-grid--edit {
      grid-template-columns: max-content minmax(0, 1fr) max-content auto;
    }

    .prop-grid--view {
      grid-template-columns: max-content minmax(0, 1fr) max-content;
    }

    .prop-cell {
      display: flex;
      align-items: flex-start;
      min-width: 0;
    }

    .prop-cell--value {
      align-items: stretch;
    }

    .prop-cell--action {
      align-items: center;
    }

    .prop-name {
      white-space: nowrap;
      margin-top: 0.35rem;
    }
  `],
    imports: [MuiNoDataModule, FormsModule, MuiFormModule, EntityPropertyValueInputComponent_1, MuiIconModule, MuiPopconfirmModule, ApplyPipe, FilterPipe, SortPipe, CodeSystemCodingReferenceComponent]
})
export class CodeSystemPropertyValueEditComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() @BooleanInput() public showCodingReference: boolean | string = false;
  @Input() @BooleanInput() public compact: boolean | string = false;
  @Input() public propertyValues?: ExtendedEntityPropertyValue[];
  @Input() public properties?: EntityProperty[];
  @Input() public codeSystemId?: string;

  @ViewChild("form") public form?: NgForm;
  @ViewChildren(EntityPropertyValueInputComponent) public propertyValueInputs?: QueryList<EntityPropertyValueInputComponent>;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyValues']) {
      this.propertyValues?.forEach(pv => pv._key = uuid());
    }
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

  protected filterPropertyValue = (v: ExtendedEntityPropertyValue): boolean => {
    return !['status', 'is-a', 'parent', 'child', 'partOf', 'groupedBy', 'classifiedWith'].includes(v?.entityProperty);
  };

  private addDefProperties(): void {
    const properties = this.properties.filter(p => p.kind === 'property');
    properties
      .filter(p => !this.propertyValues?.find(pv => pv.entityProperty === p.name))
      .forEach(p => {
        const pv = {entityPropertyId: p.id, entityProperty: p.name, value: p.type === 'Coding' ? {} : undefined};
        this.propertyValues = [...this.propertyValues || [], pv];
        this.propertyValues?.forEach(pv => pv._key = uuid());
      });
  }

  protected isRequired = (key: string, properties: EntityProperty[]): boolean => {
    const epValue = this.propertyValues.find(v => v._key === key);
    const isEpValueRequired = properties?.find(p => p.id === epValue.entityPropertyId)?.required;

    const sameEpValues = this.propertyValues.filter(pv => pv.entityPropertyId === epValue.entityPropertyId);
    const isEpValueFirst = sameEpValues.indexOf(epValue) === 0;

    return isEpValueRequired && isEpValueFirst;
  };

  protected deleteProperty(propertyValue: ExtendedEntityPropertyValue): void {
    this.propertyValues = remove(this.propertyValues, propertyValue);
  }
}
