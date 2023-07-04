import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, LoadingManager, SearchResult, validateForm} from '@kodality-web/core-util';
import {
  SnomedBranch,
  SnomedDescription, SnomedDescriptionSearchParams,
  SnomedTranslation,
  SnomedTranslationLibService
} from 'term-web/integration/_lib';
import {forkJoin, of} from 'rxjs';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';


@Component({
  templateUrl: 'snomed-branch-management.component.html'
})
export class SnomedBranchManagementComponent implements OnInit {
  protected snomedBranch?: SnomedBranch;

  protected branches?: SnomedBranch[];

  public descriptionParams: SnomedDescriptionSearchParams = new SnomedDescriptionSearchParams();
  public descriptions: SearchResult<SnomedDescription> = SearchResult.empty();
  public translations: SnomedTranslation[] = [];

  protected loader = new LoadingManager();

  protected lockModalData: {visible?: boolean, message?: string} = {};
  protected exportModalData: {visible?: boolean, type?: string} = {};

  @ViewChild("form") public form?: NgForm;
  @ViewChild("lockModalForm") public lockModalForm?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;

  public constructor(
    private snomedService: SnomedService,
    private snomedTranslationService: SnomedTranslationLibService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    const path = this.route.snapshot.paramMap.get('path');
    this.loadBranch(path);
    this.loadData();
  }

  private loadBranch(path: string): void {
    this.loader.wrap('load', forkJoin([
      this.snomedService.loadBranch(path),
      this.snomedService.findBranchDescriptions(path, this.descriptionParams),
      this.snomedTranslationService.loadTranslations({active: true, unlinked: true})
    ])).subscribe(([b, descriptions, translations]) => {
      this.snomedBranch = this.writeBranch(b);
      this.descriptions = {data: descriptions.items || [], meta: {total: descriptions.total, offset: descriptions.offset}};
      this.translations = translations;
    });
  }

  private loadData(): void {
    this.loader.wrap('init', this.snomedService.loadBranches()).subscribe(b => this.branches = b);
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }

    const b = copyDeep(this.snomedBranch);
    this.loader.wrap('save', of()).subscribe(() => this.router.navigate(['/integration/branches', b.path, 'management']));
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected executeIntegrityCheck(): void {
    this.loader.wrap('interity-check', this.snomedService.branchIntegrityCheck(this.snomedBranch.path)).subscribe(res => console.log(res));
  }

  public lock(): void {
    if (!validateForm(this.lockModalForm)) {
      return;
    }
    this.loader.wrap('lock', this.snomedService.lockBranch(this.snomedBranch.path, this.lockModalData.message)).subscribe(() => {
      this.lockModalData = {};
      this.loadBranch(this.snomedBranch.path);
    });
  }

  protected unlock(): void {
    this.loader.wrap('unlock', this.snomedService.unlockBranch(this.snomedBranch.path)).subscribe(() => this.loadBranch(this.snomedBranch.path));
  }

  protected delete(): void {
    this.loader.wrap('delete', this.snomedService.deleteBranch(this.snomedBranch.path)).subscribe(() => this.router.navigate(['/integration/snomed/branches']));
  }x

  protected exportToRF2(): void {
    if (!validateForm(this.exportModalForm)) {
      return;
    }
  }

  protected loadDescriptions(): void {
    if (!this.snomedBranch?.path) {
      return;
    }
    this.loader.wrap('load-concepts', this.snomedService.findBranchDescriptions(this.snomedBranch.path, this.descriptionParams))
      .subscribe(c => this.descriptions = {data: c.items || [], meta: {total: c.total, offset: c.offset}});
  }

  private writeBranch(b: SnomedBranch): SnomedBranch {
    return b;
  }

  protected encodeUriComponent = (c: string): string => {
    return c.replace('/', '--');
  };
}
