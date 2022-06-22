import {NgForm} from '@angular/forms';
import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystemSupplement} from 'terminology-lib/resources/codesystem/model/code-system-supplement';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {Location} from '@angular/common';
import {EntityProperty} from 'terminology-lib/resources';


@Component({
  templateUrl: './code-system-supplement-form.component.html',
})
export class CodeSystemSupplementFormComponent implements OnInit {
  public loading = false;
  public supplement?: CodeSystemSupplement;
  public codeSystemId?: string | null;
  public mode?: 'edit' | 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    const supplementId = this.route.snapshot.paramMap.get('supplementId');
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = supplementId ? 'edit' : 'add';
    if (this.mode === 'add') {
      this.supplement = new CodeSystemSupplement();
      this.route.queryParamMap.subscribe(queryParam => {
        this.supplement!.targetType = queryParam.get('targetType')!;
        this.setTarget();
      });
    } else {
      this.loadSupplement(Number(supplementId));
    }
  }

  public loadSupplement(supplementId: number): void {
    this.loading = true;
    this.codeSystemService.loadSupplement(this.codeSystemId!, supplementId).subscribe(s => this.supplement = s).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveSupplement(this.codeSystemId!, this.supplement!).subscribe(() => this.location.back()).add(() => this.loading = false);
  }

  public setTarget(): void {
    if (this.supplement?.targetType === 'EntityProperty') {
      this.supplement.target = new EntityProperty();
    }
  }
}