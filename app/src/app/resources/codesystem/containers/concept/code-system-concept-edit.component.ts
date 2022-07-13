import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConcept, CodeSystemConceptLibService, CodeSystemEntityVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {Location} from '@angular/common';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  selector: 'twa-code-system-concept-edit',
  templateUrl: './code-system-concept-edit.component.html',
})
export class CodeSystemConceptEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public conceptId?: number | undefined;
  public concept?: CodeSystemConcept;

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

  private loadConcept(conceptId: number): void {
    this.loading['init'] = true;
    this.codeSystemConceptLibService.load(conceptId).subscribe(c => this.concept = c).add(() => this.loading['init'] = false);
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

  public duplicateVersion(version: CodeSystemEntityVersion): void {
    this.loading['duplicate'] = true;
    this.codeSystemService.duplicateEntityVersion(this.codeSystemId!, this.conceptId!, version.id!).subscribe(() => {
      this.loadConcept(this.conceptId!);
    }).add(() => this.loading['duplicate'] = false);
  }

  public get isLoading():boolean{
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k])
  }
}
