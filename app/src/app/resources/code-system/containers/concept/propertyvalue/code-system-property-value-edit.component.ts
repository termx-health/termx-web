import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {EntityProperty, EntityPropertyValue} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';
import {finalize, Observable} from 'rxjs';

@Component({
  selector: 'tw-code-system-property-value-edit',
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
    if ((changes['codeSystemId'] || changes['propertyValues'] || changes['viewMode']) && this.codeSystemId && this.propertyValues) {
      this.loadProperties(this.codeSystemId).subscribe(result => {
        this.entityProperties = result.data;
        if (!this.viewMode) {
          this.addDefProperties(this.entityProperties);
        }
      });
    }
  }

  private loadProperties(codeSystem: string): Observable<any> {
    this.loading['properties'] = true;
    return this.codeSystemService.searchProperties(codeSystem, {limit: -1}).pipe(finalize(() => this.loading['properties'] = false));
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

  public getPropertyValues(): EntityPropertyValue[] | undefined {
    return this.propertyValues?.filter(pv => isDefined(pv.value) && (!this.checkPropertyType('Coding', pv) || pv.value.code && pv.value.codeSystem));
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  public getPropertyName = (id: number, properties: EntityProperty[]): string | number => {
    return properties?.find(p => p.id === id)?.name || id;
  };

  private addDefProperties(entityProperties: EntityProperty[]): void {
    entityProperties.filter(p => !['display', 'definition', 'alias'].includes(p.name!))
      .filter(p => !this.propertyValues?.find(pv => pv.entityPropertyId === p.id))
      .forEach(p => {
        const pv: EntityPropertyValue = {entityPropertyId: p.id};
        pv.value = this.checkPropertyType('Coding', pv) ? {} : undefined;
        this.propertyValues = [...this.propertyValues || [], pv];
      });
  }
}