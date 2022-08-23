import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion} from 'lib/src/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {CodeSystemDesignationEditComponent} from './designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './propertyvalue/code-system-property-value-edit.component';
import {CodeSystemAssociationEditComponent} from './association/code-system-association-edit.component';

@Component({
  templateUrl: './code-system-concept-edit.component.html',
})
export class CodeSystemConceptEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptCode?: string | null;
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
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptCode = this.route.snapshot.paramMap.get('conceptCode') ? this.route.snapshot.paramMap.get('conceptCode') : undefined;
    this.mode = this.codeSystemId && this.conceptCode ? 'edit' : 'add';

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

    this.conceptVersion!.designations = this.designationEdit?.getDesignations();
    this.conceptVersion!.propertyValues = this.propertyValueEdit?.propertyValues;
    this.conceptVersion!.associations = this.associationEdit?.associations;
    this.concept!.versions = [...(this.concept!.versions || [])?.filter(v => v.id !== this.conceptVersion!.id), this.conceptVersion!];
    this.concept!.versions.forEach(v => v.code = this.concept!.code);
    this.codeSystemService.saveConcept(this.codeSystemId!, this.concept!, true)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public requiredLanguages(codeSystemVersion: CodeSystemVersion): string[] {
    return [codeSystemVersion.preferredLanguage!];
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
    this.conceptVersion = version;
  }

  public addVersion(): void {
    const newVersion : CodeSystemEntityVersion = {status: 'draft', associations: [], designations: [], propertyValues: []};
    this.concept!.versions = [...this.concept!.versions || [], newVersion];
    this.conceptVersion = newVersion;
  }

  public removeVersion(index: number): void {
    this.concept!.versions?.splice(index, 1);
    this.concept!.versions = [...this.concept?.versions!];
    if (!this.concept!.versions.includes(this.conceptVersion!)) {
      this.conceptVersion = this.concept!.versions[this.concept!.versions.length - 1];
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
}
