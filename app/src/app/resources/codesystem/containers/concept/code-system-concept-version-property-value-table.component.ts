import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, collect, copyDeep, group, isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemLibService, EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';

@Component({
  selector: 'twa-code-system-concept-version-property-value-table',
  templateUrl: './code-system-concept-version-property-value-table.component.html',
})
export class CodeSystemConceptVersionPropertyValueTableComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode?: string | boolean = false;
  @Input() public codeSystemId?: string;
  @Input() public propertyValues?: EntityPropertyValue[];
  @Output() public propertyValuesChange = new EventEmitter<EntityPropertyValue[]>();

  private loading: {[key: string]: boolean} = {};
  public propertyValuesMap?: {[id: number]: EntityPropertyValue[]} = {};
  public entityProperties?: {[id: number]: EntityProperty};

  public propertyValueModalData: {
    visible?: boolean;
    editKey?: number;
    editIndex?: number;
    propertyValue?: EntityPropertyValue
  } = {};

  @ViewChild("propertyForm") public propertyForm?: NgForm;

  public constructor(
    public codeSystemService: CodeSystemLibService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId']) {
      this.entityProperties = {};
      if (this.codeSystemId) {
        this.loadProperties(this.codeSystemId);
      }
    }
    if (changes['propertyValues']) {
      this.propertyValuesMap = collect(this.propertyValues || [], pv => pv.entityPropertyId!);
    }

  }

  public savePropertyValue(): void {
    if (!validateForm(this.propertyForm)) {
      return;
    }
    const propertyValue = this.propertyValueModalData.propertyValue;

    if (isDefined(this.propertyValueModalData.editKey) && isDefined(this.propertyValueModalData.editIndex)) {
      this.deletePropertyValue(this.propertyValueModalData.editKey, this.propertyValueModalData.editIndex);
    }

    this.propertyValuesMap![propertyValue!.entityPropertyId!] = [...(this.propertyValuesMap![propertyValue?.entityPropertyId!] || []), propertyValue!];
    this.propertyValuesMap = {...this.propertyValuesMap};
    this.fireOnChange();
    this.propertyValueModalData.visible = false;
  }

  public deletePropertyValue(key: number, index: number): void {
    this.propertyValuesMap![key].splice(index, 1);
    this.propertyValuesMap = {...this.propertyValuesMap};
    this.fireOnChange();
  }

  public openPropertyValueModal(options: {key?: number, index?: number} = {}): void {
    const {key, index} = options;
    this.propertyValueModalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      propertyValue: (isDefined(key) && isDefined(index)) ? copyDeep(this.propertyValuesMap![key][index]) : new EntityPropertyValue()
    };
  }

  private loadProperties(codeSystem: string): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    q.limit = 1000;
    this.loading['load'] = true;
    this.codeSystemService.searchProperties(codeSystem, q).subscribe(ep => this.entityProperties = group(ep.data, p => p.id!)).add(() => this.loading['load'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  private fireOnChange(): void {
    this.propertyValues = Object.values(this.propertyValuesMap || []).flat();
    this.propertyValuesChange.emit(this.propertyValues);
  }
}
