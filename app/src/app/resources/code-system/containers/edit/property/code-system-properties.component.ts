import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { BooleanInput, copyDeep, isDefined, LoadingManager, validateForm, AutofocusDirective, ApplyPipe, FilterPipe, IncludesPipe } from '@kodality-web/core-util';
import {DefinedProperty, EntityProperty, PropertyRule, PropertyRuleFilter} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';
import { MuiCardModule, MuiDropdownModule, MuiCoreModule, MuiEditableTableModule, MuiCheckboxModule, MuiTableModule, MuiFormModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiNumberInputModule, MuiDividerModule, MuiSelectModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { AssociationTypeSearchComponent } from 'term-web/resources/_lib/association/containers/association-type-search.component';
import { EntityPropertyValueInputComponent } from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-cs-properties',
    templateUrl: './code-system-properties.component.html',
    imports: [
        MuiCardModule,
        MuiDropdownModule,
        AddButtonComponent,
        MuiCoreModule,
        FormsModule,
        MuiEditableTableModule,
        MuiCheckboxModule,
        MuiTableModule,
        MuiFormModule,
        MuiTextareaModule,
        MuiMultiLanguageInputModule,
        MuiNumberInputModule,
        ValueSetConceptSelectComponent,
        MuiDividerModule,
        CodeSystemSearchComponent,
        ValueSetSearchComponent,
        MuiSelectModule,
        AutofocusDirective,
        AssociationTypeSearchComponent,
        EntityPropertyValueInputComponent,
        TerminologyConceptSearchComponent,
        AsyncPipe,
        TranslatePipe,
        MarinaUtilModule,
        ApplyPipe,
        FilterPipe,
        IncludesPipe,
        LocalizedConceptNamePipe,
    ],
})
export class CodeSystemPropertiesComponent implements OnInit, OnChanges {
  private codeSystemService = inject(CodeSystemService);
  private definedEntityPropertyService = inject(DefinedPropertyLibService);

  @Input() public codeSystemId?: string | null;
  @Input() public properties: EntityProperty[] = [];
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  protected designationProperties: EntityProperty[] = [];
  protected basicProperties: EntityProperty[];

  protected designationRowInstance: EntityProperty = {kind: 'designation', type: 'string', showInList: true, rule: {filters: []}, status: 'active'};
  protected propertyRowInstance: EntityProperty = {kind: 'property', showInList: true, rule: {filters: []}, status: 'active'};
  protected filterRowInstance: PropertyRuleFilter = {type: 'entity-property'};
  protected loader = new LoadingManager();

  @ViewChild("designationForm") public designationForm?: NgForm;
  @ViewChild("propertyForm") public propertyForm?: NgForm;

  protected definedEntityProperties: DefinedProperty[];

  public ngOnInit(): void {
    this.definedEntityPropertyService.search({limit: -1}).subscribe(r => this.definedEntityProperties = r.data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties) {
      this.properties.forEach(p => {
        p.rule ??= new PropertyRule();
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

  protected filterTypeChanged(type: string, f: PropertyRuleFilter): void {
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

  protected filterDefinedProperties = (p: DefinedProperty, kind: 'designation' | 'property'): boolean => {
    return p.kind === kind;
  };

  public addDefinedProperty(dp: DefinedProperty): void {
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
