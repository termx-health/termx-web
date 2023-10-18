import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {SnomedBranch} from 'app/src/app/integration/_lib';
import {SnomedService} from 'app/src/app/integration/snomed/services/snomed-service';


@Component({
  templateUrl: 'snomed-branch-edit.component.html'
})
export class SnomedBranchEditComponent implements OnInit {
  protected snomedBranch?: SnomedBranch;
  protected branches?: SnomedBranch[];
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  protected formData: {parentBranch?: string, name?: string, metadata?: string} = {metadata: '{}'};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private snomedService: SnomedService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

      let pathParts = path.split('/');
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
