import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemEntityVersion, ConceptLibService, Designation, EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';
import {ActivatedRoute} from '@angular/router';
import {collect, group, isDefined, validateForm} from '@kodality-web/core-util';
import {EntityPropertyLibService} from 'terminology-lib/resources/codesystem/services/entity-property-lib.service';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';
import {CodeSystemEntityService} from '../../services/code-system-entity.service';
import {Location} from '@angular/common';

@Component({
  selector: 'twa-code-system-concept-version-edit',
  templateUrl: './code-system-concept-version-edit.component.html',
})
export class CodeSystemConceptVersionEditComponent implements OnInit {
  private conceptId?: number;
  public entityVersion?: CodeSystemEntityVersion;
  public designations?: {[id: string]: Designation[]} = {};
  public propertyValues?: {[id: number]: EntityPropertyValue[]} = {};
  public properties?: {[id: number]: EntityProperty} = {};

  public propertyModalData: {
    visible?: boolean;
    propertyId?: number;
    value?: string;
    editKey?: number;
    editIndex?: number;
  } = {};

  public designationModalData: {
    visible?: boolean;
    propertyId?: number;
    name?: string;
    language?: string;
    kind?: string;
    preferred?: boolean;
    caseSig?: string;
    description?: string;
    editKey?: string;
    editIndex?: number;
  } = {};

  private loading: {[key: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("propertyForm") public propertyForm?: NgForm;
  @ViewChild("designationForm") public designationForm?: NgForm;
  @ViewChild("entityVersionForm") public entityVersionForm?: NgForm;

  public constructor(
    public entityPropertyService: EntityPropertyLibService,
    public codeSystemEntityService: CodeSystemEntityService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    public conceptService: ConceptLibService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  public ngOnInit(): void {
    const versionId = parseInt(<string>this.route.snapshot.paramMap.get('entityVersion'));
    const codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = Number(this.route.snapshot.paramMap.get('concept'));
    this.mode = versionId ? 'edit' : 'add';
    if (codeSystemId) {
      this.loadProperties(codeSystemId);
    }

    if (this.mode === 'edit') {
      this.loadVersion(versionId);
    } else {
      this.entityVersion = new CodeSystemEntityVersion();
      this.entityVersion.status = 'draft';
      this.entityVersion.codeSystem = codeSystemId!;
      this.loading['code'] = true;
      this.conceptService.load(this.conceptId).subscribe(c => this.entityVersion!.code = c.code).add(() => this.loading['code'] = false);
    }
  }

  private loadProperties(codeSystem: string): void {
    const q = new EntityPropertySearchParams();
    q.codeSystem = codeSystem;
    this.loading['load'] = true;
    this.entityPropertyService.search(q).subscribe(ep => this.properties = group(ep.data, p => p.id!)).add(() => this.loading['load'] = false);
  }

  private loadVersion(versionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(versionId).subscribe(v => {
      this.entityVersion = v;
      if (v.designations) {
        this.designations = collect(v.designations, d => d.designationTypeId!);
      }
      if (v.propertyValues) {
        this.propertyValues = collect(v.propertyValues, pv => pv.entityPropertyId!);
      }
    }).add(() => this.loading['load'] = false);
  }

  public deletePropertyValue(key: number, index: number): void {
    this.propertyValues![key].splice(index, 1);
    this.propertyValues = {...this.propertyValues};
  }

  public savePropertyValue(): void {
    if (!validateForm(this.propertyForm)) {
      return;
    }
    const propertyValue = {value: this.propertyModalData.value, entityPropertyId: this.propertyModalData.propertyId};

    if (isDefined(this.propertyModalData.editKey) && isDefined(this.propertyModalData.editIndex)) {
      this.deletePropertyValue(this.propertyModalData.editKey, this.propertyModalData.editIndex);
    }

    if (this.propertyValues![this.propertyModalData.propertyId!]) {
      this.propertyValues![this.propertyModalData.propertyId!] = [...this.propertyValues![this.propertyModalData.propertyId!],
        propertyValue];
    } else {
      this.propertyValues![this.propertyModalData.propertyId!] = [propertyValue];
    }
    this.propertyModalData = {visible: false};

    this.propertyValues = {...this.propertyValues};
  }

  public loadPropertyModal(key: number, index: number): void {
    const propertyValue = this.propertyValues![key][index];
    this.propertyModalData = {
      visible: true,
      value: propertyValue.value,
      propertyId: propertyValue.entityPropertyId,
      editKey: key,
      editIndex: index,
    };
  }

  public deleteDesignation(key: string, index: number): void {
    this.designations![key].splice(index, 1);
    this.designations = {...this.designations};
  }
  public activateDesignation(key: string, index: number): void {
    this.designations![key][index!].status = 'active';
    this.designations = {...this.designations};
  }

  public saveDesignation(): void {
    if (!validateForm(this.designationForm)) {
      return;
    }
    const designation = {
      designationTypeId: this.designationModalData.propertyId,
      name: this.designationModalData.name,
      language: this.designationModalData.language,
      caseSignificance: this.designationModalData.caseSig,
      designationKind: this.designationModalData.kind,
      description: this.designationModalData.description,
      status: 'draft',
      preferred: this.designationModalData.preferred || false,
    };

    if (isDefined(this.designationModalData.editKey) && isDefined(this.designationModalData.editIndex)) {
      this.deleteDesignation(this.designationModalData.editKey, this.designationModalData.editIndex);
    }

    if (this.designations![this.designationModalData.propertyId!]) {
      this.designations![this.designationModalData.propertyId!] = [...this.designations![this.designationModalData.propertyId!], designation];
    } else {
      this.designations![this.designationModalData.propertyId!] = [designation];
    }
    this.designationModalData = {visible: false};
    this.designations = {...this.designations};

  }

  public loadDesignationModal(key: string, index: number): void {
    const designation = this.designations![key][index];
    this.designationModalData = {
      visible: true,
      propertyId: designation.designationTypeId,
      name: designation.name,
      language: designation.language,
      caseSig: designation.caseSignificance,
      kind: designation.designationKind!,
      description: designation.description,
      preferred: designation.preferred,
      editKey: key,
      editIndex: index
    };
  }

  public save(): void {
    if (!validateForm(this.entityVersionForm) || !this.entityVersion) {
      return;
    }
    if (this.designations) {
      this.entityVersion.designations = Object.values(this.designations).flat();
    }
    if (this.propertyValues) {
      this.entityVersion.propertyValues = Object.values(this.propertyValues!).flat();
    }
    this.entityVersion.status = 'draft';
    this.loading['save'] = true;
    this.codeSystemEntityService.saveVersion(this.conceptId!, this.entityVersion).subscribe(() => this.location.back()).add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
