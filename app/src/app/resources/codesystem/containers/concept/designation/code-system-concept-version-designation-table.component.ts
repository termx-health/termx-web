import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, Designation, EntityProperty} from 'terminology-lib/resources';
import {BooleanInput, collect, group} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-code-system-concept-version-designation-table',
  templateUrl: './code-system-concept-version-designation-table.component.html',
})
export class CodeSystemConceptVersionDesignationTableComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: string | boolean = false;
  @Input() public codeSystemId?: string;
  @Input() public conceptVersionId?: number;
  @Input() public designations?: Designation[] = [];
  @Output() public designationsChange = new EventEmitter<Designation[]>();

  @ViewChild("designationForm") public designationForm?: NgForm;

  public entityProperties?: {[id: number]: EntityProperty};
  public designationMap?: {[id: string]: Designation[]} = {};
  public loading = false;

  public constructor(
    public codeSystemService: CodeSystemLibService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId']) {
      this.entityProperties = {};
      if (this.codeSystemId) {
        this.loadProperties(this.codeSystemId);
      }
    }
    if (changes['designations']) {
      this.designationMap = collect(this.designations || [], d => d.designationTypeId!);
    }
  }

  public deleteDesignation(key: string, index: number): void {
    this.designationMap![key].splice(index, 1);
    this.designationMap = {...this.designationMap};
    this.fireOnChange();
  }

  private loadProperties(codeSystem: string): void {
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(ep => this.entityProperties = group(ep.data, p => p.id!))
      .add(() => this.loading = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  private fireOnChange(): void {
    this.designations = Object.values(this.designationMap || []).flat();
    this.designationsChange.emit(this.designations);
  }
}
