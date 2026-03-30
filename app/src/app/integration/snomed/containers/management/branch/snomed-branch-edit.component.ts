import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { isDefined, LoadingManager, validateForm, ApplyPipe } from '@termx-health/core-util';
import {SnomedBranch} from 'term-web/integration/_lib';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MarinPageLayoutModule, MuiSelectModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule } from '@termx-health/ui';

import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'snomed-branch-edit.component.html',
    imports: [MuiFormModule, MuiSpinnerModule, FormsModule, MuiCardModule, MarinPageLayoutModule, MuiSelectModule, MuiTextareaModule, MuiCheckboxModule, MuiButtonModule, TranslatePipe, ApplyPipe]
})
export class SnomedBranchEditComponent implements OnInit {
  private snomedService = inject(SnomedService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected snomedBranch?: SnomedBranch;
  protected branches?: SnomedBranch[];
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  protected formData: {parentBranch?: string, name?: string, metadata?: string} = {metadata: '{}'};

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const path = this.route.snapshot.paramMap.get('path');

    if (isDefined(path)) {
      this.mode = 'edit';
      this.loadBranch(path);
    }
    this.snomedBranch = this.writeBranch(new SnomedBranch());

    this.loadData();
  }

  private loadBranch(path: string): void {
    this.loader.wrap('load', this.snomedService.loadBranch(path)).subscribe(b => {
      this.snomedBranch = this.writeBranch(b);

      const pathParts = path.split('/');
      this.formData.parentBranch = pathParts.slice(0, (pathParts.length - 1) > 0 ? (pathParts.length - 1) : 0).join('/');
      this.formData.metadata = JSON.stringify(b.metadata);
    });
  }

  private loadData(): void {
    this.loader.wrap('init', this.snomedService.loadBranches()).subscribe(b => this.branches = b);
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }

    const request: {parent?: string, name?: string, metadata?: any} = {};
    if (this.mode === 'add') {
      request.name = this.formData.name;
      request.parent = this.formData.parentBranch;
    }
    request.metadata = JSON.parse(this.formData.metadata);
    const path = this.snomedBranch?.path || [request.parent, request.name].join('/');
    this.loader.wrap('save', this.mode === 'add' ? this.snomedService.createdBranch(request) : this.snomedService.updateBranch(path, request))
      .subscribe(() => this.router.navigate(['/integration/snomed/branches', path.split('/').join('--'), 'management'], {replaceUrl: true}));
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected findBase = (branches: SnomedBranch[]):string => {
    return branches.find(b => new Date(b.creation).toDateString() === new Date(this.snomedBranch.base).toDateString())?.path;
  };


  private writeBranch(b: SnomedBranch): SnomedBranch {
    return b;
  }
}
