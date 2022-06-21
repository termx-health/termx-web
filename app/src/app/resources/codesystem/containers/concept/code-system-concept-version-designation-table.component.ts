import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, Designation, EntityProperty} from 'terminology-lib/resources';
import {BooleanInput, collect, copyDeep, group, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';

@Component({
  selector: 'twa-code-system-concept-version-designation-table',
  templateUrl: './code-system-concept-version-designation-table.component.html',
})
export class CodeSystemConceptVersionDesignationTableComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: string | boolean = false;

  @Input() public codeSystemId?: string;
  @Input() public designations?: Designation[] = [];
  @Output() public designationsChange = new EventEmitter<Designation[]>();

  @ViewChild("designationForm") public designationForm?: NgForm;

  public entityProperties?: {[id: number]: EntityProperty};
  public designationMap?: {[id: string]: Designation[]} = {};
  private loading: {[key: string]: boolean} = {};

  public designationModalData: {
    visible?: boolean;
    editKey?: string;
    editIndex?: number;
    designation?: Designation
  } = {};

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

  public saveDesignation(): void {
    if (!validateForm(this.designationForm)) {
      return;
    }
    const designation = this.designationModalData.designation!;
    designation.preferred = designation.preferred || false;
    if (isDefined(this.designationModalData.editKey) && isDefined(this.designationModalData.editIndex)) {
      this.deleteDesignation(this.designationModalData.editKey, this.designationModalData.editIndex);
    }
    this.designationMap![designation.designationTypeId!] = [...(this.designationMap![designation.designationTypeId!] || []), designation];
    this.designationMap = {...this.designationMap};
    this.fireOnChange();
    this.designationModalData.visible = false;
  }

  public deleteDesignation(key: string, index: number): void {
    this.designationMap![key].splice(index, 1);
    this.designationMap = {...this.designationMap};
    this.fireOnChange();
  }

  public openDesignationModal(options: {key?: string, index?: number} = {}): void {
    const {key, index} = options;
    this.designationModalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      designation: (key && isDefined(index)) ? copyDeep(this.designationMap![key][index]) : new Designation()
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
    this.designations = Object.values(this.designationMap || []).flat();
    this.designationsChange.emit(this.designations);
  }
}
