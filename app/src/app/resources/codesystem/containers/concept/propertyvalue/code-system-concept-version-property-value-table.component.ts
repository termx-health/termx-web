import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, collect, group} from '@kodality-web/core-util';
import {CodeSystemLibService, EntityProperty, EntityPropertyValue} from 'lib/src/resources';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-code-system-concept-version-property-value-table',
  templateUrl: './code-system-concept-version-property-value-table.component.html',
})
export class CodeSystemConceptVersionPropertyValueTableComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode?: string | boolean = false;
  @Input() public codeSystemId?: string;
  @Input() public conceptVersionId?: number;
  @Input() public propertyValues?: EntityPropertyValue[];
  @Output() public propertyValuesChange = new EventEmitter<EntityPropertyValue[]>();

  @ViewChild("propertyForm") public propertyForm?: NgForm;

  public entityProperties?: {[id: number]: EntityProperty};
  public propertyValuesMap?: {[id: number]: EntityPropertyValue[]} = {};
  public loading = false;

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

  public deletePropertyValue(key: number, index: number): void {
    this.propertyValuesMap![key].splice(index, 1);
    this.propertyValuesMap = {...this.propertyValuesMap};
    this.fireOnChange();
  }

  private loadProperties(codeSystem: string): void {
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(ep => this.entityProperties = group(ep.data, p => p.id!))
      .add(() => this.loading = false);
  }

  private fireOnChange(): void {
    this.propertyValues = Object.values(this.propertyValuesMap || []).flat();
    this.propertyValuesChange.emit(this.propertyValues);
  }
}
