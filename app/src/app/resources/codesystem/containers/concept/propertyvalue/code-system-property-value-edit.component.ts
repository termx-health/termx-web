import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EntityProperty, EntityPropertyValue} from 'lib/src/resources';
import {NgForm} from '@angular/forms';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';

@Component({
  selector: 'twa-code-system-property-value-edit',
  templateUrl: './code-system-property-value-edit.component.html',
})
export class CodeSystemPropertyValueEditComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public propertyValues?: EntityPropertyValue[];
  @Input() public codeSystemId?: string;

  @ViewChild("form") public form?: NgForm;

  public entityProperties: EntityProperty[] = [];
  public codingSystemId?: string;
  public loading: {[k: string]: boolean} = {};

  public constructor(
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties(this.codeSystemId);
    }
  }

  private loadProperties(codeSystem: string): void {
    this.loading['properties'] = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(result => this.entityProperties = result.data)
      .add(() => this.loading['properties'] = false);
  }

  public checkPropertyType = (type: string, propertyValue: EntityPropertyValue): boolean => {
    return !!this.entityProperties.find(p => propertyValue.entityPropertyId === p.id && p.type && type.split(',').includes(p.type));
  };

  public addPropertyValue(): void {
    this.propertyValues = [...this.propertyValues || [], {}];
  }

  public removePropertyValue(index: number): void {
    this.propertyValues?.splice(index, 1);
    this.propertyValues = [...this.propertyValues!];
  }

  public valid(): boolean {
    return validateForm(this.form);
  }
}
