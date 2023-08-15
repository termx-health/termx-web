import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DefinedEntityProperty, EntityProperty, EntityPropertyRule, EntityPropertyRuleFilter} from 'app/src/app/resources/_lib';
import {BooleanInput, copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';
import {DefinedEntityPropertyLibService} from 'term-web/resources/_lib/definedentityproperty/services/defined-entity-property-lib.service';

@Component({
  selector: 'tw-cs-properties',
  templateUrl: './code-system-properties.component.html',
})
export class CodeSystemPropertiesComponent implements OnInit, OnChanges {
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

  protected definedEntityProperties: DefinedEntityProperty[];


  public constructor(private codeSystemService: CodeSystemService, private definedEntityPropertyService: DefinedEntityPropertyLibService) {}

  public ngOnInit(): void {
    this.definedEntityPropertyService.search({limit: -1}).subscribe(r => this.definedEntityProperties = r.data);
  }

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

  protected filterDefinedProperties = (p: DefinedEntityProperty, kind: 'designation' | 'property'): boolean => {
    return p.kind === kind;
  };

  public addDefinedProperty(dp: DefinedEntityProperty): void {
    const p: EntityProperty = copyDeep(dp);
    p.definedEntityPropertyId = p.id;
    p.id = undefined;
    p.status = 'active';

    if (dp.kind === 'designation' && !this.designationProperties.find(d => d.name === dp.name)) {
      this.designationProperties = [...this.designationProperties, p];
    }
    if (dp.kind === 'property' && !this.basicProperties.find(d => d.name === dp.name)) {
      this.basicProperties = [...this.basicProperties, p];
    }
  }
}
