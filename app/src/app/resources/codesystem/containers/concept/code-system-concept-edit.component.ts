import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemConcept, CodeSystemConceptLibService, CodeSystemEntityVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {Location} from '@angular/common';
import {CodeSystemService} from '../../services/code-system.service';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';

@Component({
  selector: 'twa-code-system-concept-edit',
  templateUrl: './code-system-concept-edit.component.html',
})
export class CodeSystemConceptEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public concept?: CodeSystemConcept;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    public codeSystemConceptLibService: CodeSystemConceptLibService,
    public codeSystemService: CodeSystemService,
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const conceptId = this.route.snapshot.paramMap.get('concept');
    this.mode = this.codeSystemId && conceptId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadConcept(Number(conceptId));
    } else {
      this.concept = new CodeSystemConcept();
    }
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveConcept(this.codeSystemId!, this.concept!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  private loadConcept(conceptId: number): void {
    this.loading = true;
    this.codeSystemConceptLibService.load(conceptId).subscribe(c => this.concept = c).add(() => this.loading = false);
  }


  public activateVersion(version: CodeSystemEntityVersion): void {
    this.loading = true;
    this.codeSystemEntityVersionService.activateVersion(version.id!).subscribe(() => version.status = 'active').add(() => this.loading = false);
  }

  public retireVersion(version: CodeSystemEntityVersion): void {
    this.loading = true;
    this.codeSystemEntityVersionService.retireVersion(version.id!).subscribe(() => version.status = 'retired').add(() => this.loading = false);
  }

}
