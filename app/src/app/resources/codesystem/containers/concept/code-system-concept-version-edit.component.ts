import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemEntityVersion, Designation, EntityProperty, EntityPropertyValue} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';
import {ActivatedRoute} from '@angular/router';
import {collect, group} from '@kodality-web/core-util';
import {EntityPropertyLibService} from 'terminology-lib/resources/codesystem/services/entity-property-lib.service';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';

@Component({
  selector: 'twa-code-system-concept-version-edit',
  templateUrl: './code-system-concept-version-edit.component.html',
})
export class CodeSystemConceptVersionEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public entityVerison?: CodeSystemEntityVersion;
  public designations?: {[id: string]: Designation[]} = {};
  public propertyValues?: {[id: number]: EntityPropertyValue[]} = {};
  public properties?: {[id: number]: EntityProperty} = {};

  public propertyModalData: {
    visible?: boolean;
    propertyId?: number;
    value?: string;
  } = {};

  public designationModalData: {
    visible?: boolean;
    propertyId?: number;
    name?: string;
    language?: string;
    kind?: 'text' | 'blob';
    caseSig?: 'ics' | 'cs' | 'ci'
    description?: string;
  } = {};

  private loading: {[key: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    public entityPropertyService: EntityPropertyLibService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    private route: ActivatedRoute,
  ) { }

  public ngOnInit(): void {
    const versionId = parseInt(<string>this.route.snapshot.paramMap.get('entityVersion'));
    const codeSystem = this.route.snapshot.paramMap.get('id');
    this.mode = versionId ? 'edit' : 'add';
    if (codeSystem) {
      this.loadProperties(codeSystem);
    }

    if (this.mode === 'edit') {
      this.loadVersion(versionId);
    } else {
      this.entityVerison = new CodeSystemEntityVersion();
      this.entityVerison.status = 'draft';
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
      this.entityVerison = v;
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
    if (!this.propertyModalData.propertyId || !this.propertyModalData.value) {
      return;
    }
    const propertyValue = {value: this.propertyModalData.value, entityPropertyId: this.propertyModalData.propertyId};

    if (this.propertyValues![this.propertyModalData.propertyId!]) {
      this.propertyValues![this.propertyModalData.propertyId!] = [...this.propertyValues![this.propertyModalData.propertyId!],
        propertyValue];
    } else {
      this.propertyValues![this.propertyModalData.propertyId!] = [propertyValue];
    }
    this.propertyModalData = {visible: false};

    this.propertyValues = {...this.propertyValues};
  }

  public saveDesignation(): void {
    if (!this.designationModalData.propertyId || !this.designationModalData.name || !this.designationModalData.language) {
      return;
    }
    const designation = {
      designationTypeId: this.designationModalData.propertyId,
      name: this.designationModalData.name,
      language: this.designationModalData.language,
      caseSignificance: this.designationModalData.caseSig,
      designationKind: this.designationModalData.kind,
      description: this.designationModalData.description,
      status: 'draft'
    };

    if (this.designations![this.designationModalData.propertyId!]) {
      this.designations![this.designationModalData.propertyId!] = [...this.designations![this.designationModalData.propertyId!], designation];
    } else {
      this.designations![this.designationModalData.propertyId!] = [designation];
    }
    this.designationModalData = {visible: false};
    this.designations = {...this.designations};

  }

  public save(): void {
    return;
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
