import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConceptLibService, CodeSystemEntityVersion, Designation, EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';
import {ActivatedRoute} from '@angular/router';
import {collect, copyDeep, group, isDefined, validateForm} from '@kodality-web/core-util';
import {EntityPropertyLibService} from 'terminology-lib/resources/codesystem/services/entity-property-lib.service';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';
import {CodeSystemEntityService} from '../../services/code-system-entity.service';
import {Location} from '@angular/common';

@Component({
  selector: 'twa-code-system-concept-version-edit',
  templateUrl: './code-system-concept-version-edit.component.html',
})
export class CodeSystemConceptVersionEditComponent implements OnInit {
  private conceptId?: string | null;
  public conceptVersion?: CodeSystemEntityVersion;
  public designations?: {[id: string]: Designation[]} = {};
  public propertyValues?: {[id: number]: EntityPropertyValue[]} = {};
  public entityProperties?: {[id: number]: EntityProperty} = {};

  public propertyValueModalData: {
    visible?: boolean;
    editKey?: number;
    editIndex?: number;
    propertyValue?: EntityPropertyValue
  } = {};
  public designationModalData: {
    visible?: boolean;
    editKey?: string;
    editIndex?: number;
    designation?: Designation
  } = {};

  private loading: {[key: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("propertyForm") public propertyForm?: NgForm;
  @ViewChild("designationForm") public designationForm?: NgForm;
  @ViewChild("conceptVersionForm") public conceptVersionForm?: NgForm;

  public constructor(
    public entityPropertyService: EntityPropertyLibService,
    public codeSystemEntityService: CodeSystemEntityService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  public ngOnInit(): void {
    const codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = this.route.snapshot.paramMap.get('concept');
    const versionId = this.route.snapshot.paramMap.get('conceptVersion');
    this.mode = versionId ? 'edit' : 'add';
    if (codeSystemId) {
      this.loadProperties(codeSystemId);
    }

    if (this.mode === 'edit') {
      this.loadVersion(Number(versionId));
    } else {
      this.conceptVersion = new CodeSystemEntityVersion();
      this.conceptVersion.status = 'draft';
      this.conceptVersion.codeSystem = codeSystemId!;
      this.loading['code'] = true;
      this.codeSystemConceptLibService.load(Number(this.conceptId)).subscribe(c => this.conceptVersion!.code = c.code).add(() => this.loading['code'] = false);
    }
  }

  public save(): void {
    if (!validateForm(this.conceptVersionForm) || !this.conceptVersion) {
      return;
    }
    this.conceptVersion.designations = Object.values(this.designations || []).flat();
    this.conceptVersion.propertyValues = Object.values(this.propertyValues || []).flat();
    this.conceptVersion.status = 'draft';
    this.loading['save'] = true;
    this.codeSystemEntityService.saveVersion(Number(this.conceptId), this.conceptVersion)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  private loadVersion(versionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(versionId).subscribe(v => {
      this.conceptVersion = v;
      this.designations = collect(v.designations || [], d => d.designationTypeId!);
      this.propertyValues = collect(v.propertyValues || [], pv => pv.entityPropertyId!);
    }).add(() => this.loading['load'] = false);
  }

  private loadProperties(codeSystem: string): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    q.limit = 10000;
    this.loading['load'] = true;
    this.entityPropertyService.search(q).subscribe(ep => this.entityProperties = group(ep.data, p => p.id!)).add(() => this.loading['load'] = false);
  }

  public savePropertyValue(): void {
    if (!validateForm(this.propertyForm)) {
      return;
    }
    const propertyValue = this.propertyValueModalData.propertyValue;

    if (isDefined(this.propertyValueModalData.editKey) && isDefined(this.propertyValueModalData.editIndex)) {
      this.deletePropertyValue(this.propertyValueModalData.editKey, this.propertyValueModalData.editIndex);
    }

    this.propertyValues![propertyValue!.entityPropertyId!] = [...(this.propertyValues![propertyValue?.entityPropertyId!] || []), propertyValue!];
    this.propertyValues = {...this.propertyValues};
    this.propertyValueModalData.visible = false;
  }

  public deletePropertyValue(key: number, index: number): void {
    this.propertyValues![key].splice(index, 1);
    this.propertyValues = {...this.propertyValues};
  }

  public openPropertyValueModal(options: {key?: number, index?: number} = {}): void {
    const {key, index} = options;
    this.propertyValueModalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      propertyValue: (isDefined(key) && isDefined(index)) ? copyDeep(this.propertyValues![key][index]) : new EntityPropertyValue()
    };
  }

  public saveDesignation(): void {
    if (!validateForm(this.designationForm)) {
      return;
    }
    const designation = this.designationModalData.designation;
    designation!.preferred = this.designationModalData!.designation?.preferred || false;
    if (isDefined(this.designationModalData.editKey) && isDefined(this.designationModalData.editIndex)) {
      this.deleteDesignation(this.designationModalData.editKey, this.designationModalData.editIndex);
    }
    this.designations![designation!.designationTypeId!] = [...(this.designations![designation?.designationTypeId!] || []), designation!];
    this.designations = {...this.designations};
    this.designationModalData.visible = false;
  }

  public deleteDesignation(key: string, index: number): void {
    this.designations![key].splice(index, 1);
    this.designations = {...this.designations};
  }

  public openDesignationModal(options: {key?: string, index?: number} = {}): void {
    const {key, index} = options;
    this.designationModalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      designation: (key && isDefined(index)) ? copyDeep(this.designations![key][index]) : new Designation()
    };
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
