import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConceptLibService, CodeSystemEntityVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {CodeSystemEntityService} from '../../services/code-system-entity.service';
import {Location} from '@angular/common';

@Component({
  templateUrl: './code-system-concept-version-edit.component.html',
})
export class CodeSystemConceptVersionEditComponent implements OnInit {
  public codeSystemId?: string | null;
  private conceptId?: string | null;
  public version?: CodeSystemEntityVersion;

  private loading: {[key: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("conceptVersionForm") public conceptVersionForm?: NgForm;

  public constructor(
    public codeSystemEntityService: CodeSystemEntityService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = this.route.snapshot.paramMap.get('concept');
    const versionId = this.route.snapshot.paramMap.get('conceptVersion');
    this.mode = versionId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(Number(versionId));
    } else {
      this.version = new CodeSystemEntityVersion();
      this.version.status = 'draft';
      this.version.codeSystem = this.codeSystemId!;
      this.loading['code'] = true;
      this.codeSystemConceptLibService.load(Number(this.conceptId)).subscribe(c => this.version!.code = c.code).add(() => this.loading['code'] = false);
    }
  }

  public save(): void {
    if (!validateForm(this.conceptVersionForm) || !this.version) {
      return;
    }
    this.version.status = 'draft';
    this.loading['save'] = true;
    this.codeSystemEntityService.saveVersion(Number(this.conceptId), this.version)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  private loadVersion(versionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(versionId).subscribe(v => this.version = v).add(() => this.loading['load'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
