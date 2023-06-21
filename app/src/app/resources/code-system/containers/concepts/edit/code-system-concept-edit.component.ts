import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystem, CodeSystemConcept, CodeSystemEntityVersion} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {compareValues, copyDeep, validateForm} from '@kodality-web/core-util';
import {CodeSystemDesignationEditComponent} from './designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './propertyvalue/code-system-property-value-edit.component';
import {CodeSystemAssociationEditComponent} from './association/code-system-association-edit.component';
import {of} from 'rxjs';

@Component({
  templateUrl: './code-system-concept-edit.component.html',
  styles: [`
    .version-sidebar {
      height: min-content;
      margin-bottom: 1rem
    }

    .padded {
      display: block;
      margin-top: 1rem
    }
  `]
})
export class CodeSystemConceptEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptCode?: string | null;
  public versionCode?: string | null;
  public parent?: string | null;
  public codeSystem?: CodeSystem;
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';
  public conceptEdit: boolean = true;

  public statusColorMap: {[status: string]: 'red' | 'green' | 'gray'} = {
    'active': 'green',
    'draft': 'gray',
    'retired': 'red'
  };

  @ViewChild("form") public form?: NgForm;
  @ViewChild("designationEdit") public designationEdit?: CodeSystemDesignationEditComponent;
  @ViewChild("propertyValueEdit") public propertyValueEdit?: CodeSystemPropertyValueEditComponent;
  @ViewChild("associationEdit") public associationEdit?: CodeSystemAssociationEditComponent;

  public constructor(
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptCode = this.route.snapshot.paramMap.get('conceptCode');
    this.versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.parent = this.route.snapshot.queryParamMap.get('parent');
    this.mode = this.codeSystemId && this.conceptCode ? 'edit' : 'add';

    if (this.codeSystemId) {
      this.codeSystemService.load(this.codeSystemId).subscribe(cs => this.codeSystem = cs);
    }
    if (this.mode === 'edit') {
      this.loadConcept(this.conceptCode!);
    } else {
      this.concept = new CodeSystemConcept();
      this.addVersion();
    }
  }

  public save(): void {
    if (!(validateForm(this.form) &&
      (!this.designationEdit || this.designationEdit.valid()) &&
      (!this.propertyValueEdit || this.propertyValueEdit.valid()) &&
      (!this.associationEdit || this.associationEdit.valid())
    )) {
      return;
    }
    this.loading['save'] = true;

    const request = {concept: copyDeep(this.concept), entityVersion: copyDeep(this.conceptVersion)};
    request.entityVersion.code = this.concept.code;
    request.entityVersion.designations = this.designationEdit?.getDesignations();
    request.entityVersion.propertyValues = this.propertyValueEdit?.getPropertyValues();
    request.entityVersion.associations = this.associationEdit?.associations;
    this.codeSystemService.saveConceptTransaction(this.codeSystemId, this.versionCode, request)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  private loadConcept(conceptCode: string): void {
    this.loading['init'] = true;
    this.codeSystemService.loadConcept(this.codeSystemId!, conceptCode).subscribe(c => this.concept = c).add(() => {
      this.loading['init'] = false;
      this.selectVersion(this.concept?.versions?.[this.concept?.versions?.length - 1]);
      this.conceptEdit = !this.concept?.versions?.find(v => v.status === 'active');
    });
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  public get newVersionExists(): boolean {
    return !!this.concept!.versions?.find(v => !v.id);
  }

  public selectVersion(version?: CodeSystemEntityVersion): void {
    version.designations ??= [];
    version.propertyValues ??= [];
    version.associations ??= [];
    this.conceptVersion = version;
  }

  public addVersion(): void {
    const newVersion: CodeSystemEntityVersion = {status: 'draft', associations: [], designations: [], propertyValues: []};
    const parentReq = this.codeSystemId && this.parent ? this.codeSystemService.loadConcept(this.codeSystemId, this.parent) : of(new CodeSystemConcept());
    parentReq.subscribe(parent => {
      if (parent?.id) {
        const designations = this.getLastVersion(parent.versions!)?.designations;
        designations?.forEach(d => d.id = undefined);
        const properties = this.getLastVersion(parent.versions!)?.propertyValues;
        properties?.forEach(p => p.id = undefined);
        newVersion.designations = designations;
        newVersion.propertyValues = properties;
        newVersion.associations = [{associationType: this.codeSystem?.hierarchyMeaning || 'is-a', status: 'active', targetCode: parent.code, targetId: this.getLastVersion(parent.versions!).id}];
      }
      this.concept!.versions = [...this.concept!.versions || [], newVersion];
      this.selectVersion(newVersion);
    });

  }

  public removeVersion(index: number): void {
    this.concept!.versions?.splice(index, 1);
    this.concept!.versions = [...this.concept?.versions!];
    if (!this.concept!.versions.includes(this.conceptVersion!)) {
      this.selectVersion(this.concept!.versions[this.concept!.versions.length - 1]);
    }
  }

  public duplicateVersion(version: CodeSystemEntityVersion): void {
    this.loading['duplicate'] = true;
    this.codeSystemService.duplicateEntityVersion(this.codeSystemId!, this.concept!.id!, version.id!).subscribe(() => {
      this.loadConcept(this.conceptCode!);
    }).add(() => this.loading['duplicate'] = false);
  }

  public activateVersion(version: CodeSystemEntityVersion): void {
    this.loading['activate'] = true;
    this.codeSystemService.activateEntityVersion(this.codeSystemId!, version.id!).subscribe(() => {
      version.status = 'active';
    }).add(() => this.loading['activate'] = false);
  }

  public retireVersion(version: CodeSystemEntityVersion): void {
    this.loading['retire'] = true;
    this.codeSystemService.retireEntityVersion(this.codeSystemId!, version.id!).subscribe(() => {
      version.status = 'retired';
    }).add(() => this.loading['retire'] = false);
  }

  public saveAsDraft(version: CodeSystemEntityVersion): void {
    this.loading['draft'] = true;
    this.codeSystemService.saveEntityVersionAsDraft(this.codeSystemId!, version.id!).subscribe(() => {
      version.status = 'draft';
    }).add(() => this.loading['draft'] = false);
  }

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }
}
