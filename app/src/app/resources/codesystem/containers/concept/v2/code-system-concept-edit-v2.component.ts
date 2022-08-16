import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConcept, CodeSystemConceptLibService, CodeSystemEntityVersion, CodeSystemVersion} from 'lib/src/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {group, validateForm} from '@kodality-web/core-util';

@Component({
  templateUrl: './code-system-concept-edit-v2.component.html',
})
export class CodeSystemConceptEditV2Component implements OnInit {
  public codeSystemId?: string | null;
  public codeSystemVersionMap: {[version: string]: CodeSystemVersion} = {};
  public conceptId?: number | undefined;
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;


  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = this.route.snapshot.paramMap.get('conceptId') ? Number(this.route.snapshot.paramMap.get('conceptId')) : undefined;
    this.mode = this.codeSystemId && this.conceptId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadConcept(this.conceptId!);
    } else {
      this.concept = new CodeSystemConcept();
      this.conceptVersion = new CodeSystemEntityVersion();
      this.conceptVersion.status = 'draft';
    }
    if (this.conceptVersion?.status !== 'active') {
      this.loadCodeSystemVersions();
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.saveConcept(this.codeSystemId!, this.concept!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public requiredLanguages(codeSystemVersion: CodeSystemVersion): string[] {
    return [codeSystemVersion.preferredLanguage!];
  }

  private loadConcept(conceptId: number): void {
    this.loading['init'] = true;
    this.codeSystemConceptLibService.load(conceptId).subscribe(c => this.concept = c).add(() => {
      this.loading['init'] = false;
      this.conceptVersion = this.concept?.versions?.filter(v => v.status === 'active')[0];
    });
  }

  private loadCodeSystemVersions(): void {
    this.loading['csVersionLoad'] = true;
    this.codeSystemService.load(this.codeSystemId!, true).subscribe(cs => this.codeSystemVersionMap = group(cs.versions!, v => v.version!))
      .add(() => this.loading['csVersionLoad'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
