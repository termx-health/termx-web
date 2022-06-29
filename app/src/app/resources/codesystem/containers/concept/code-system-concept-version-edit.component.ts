import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConceptLibService, CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {Location} from '@angular/common';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  templateUrl: './code-system-concept-version-edit.component.html',
})
export class CodeSystemConceptVersionEditComponent implements OnInit {
  public codeSystemId?: string | null;
  private conceptId?: string | null;
  public conceptVersion?: CodeSystemEntityVersion;

  private loading: {[key: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("conceptVersionForm") public conceptVersionForm?: NgForm;

  public constructor(
    public codeSystemService: CodeSystemService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.conceptId = this.route.snapshot.paramMap.get('conceptId');
    const conceptVersionId = this.route.snapshot.paramMap.get('conceptVersionId');
    this.mode = conceptVersionId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadConceptVersion(Number(conceptVersionId));
    } else {
      this.conceptVersion = new CodeSystemEntityVersion();
      this.conceptVersion.status = 'draft';
      this.conceptVersion.codeSystem = this.codeSystemId!;
      this.loading['code'] = true;
      this.codeSystemConceptLibService.load(Number(this.conceptId)).subscribe(c => this.conceptVersion!.code = c.code).add(() => this.loading['code'] = false);
    }
  }

  public save(): void {
    if (!validateForm(this.conceptVersionForm) || !this.conceptVersion) {
      return;
    }
    this.conceptVersion.status = 'draft';
    this.loading['save'] = true;
    this.codeSystemService.saveEntityVersion(this.codeSystemId!, Number(this.conceptId), this.conceptVersion)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  private loadConceptVersion(conceptVersionId: number): void {
    this.loading['load'] = true;
    this.codeSystemEntityVersionService.load(conceptVersionId).subscribe(v => this.conceptVersion = v).add(() => this.loading['load'] = false);
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

}
