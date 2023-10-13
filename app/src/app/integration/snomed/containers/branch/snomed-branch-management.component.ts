import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {collect, DestroyService, isDefined, LoadingManager, SearchResult, validateForm} from '@kodality-web/core-util';
import {
  SnomedBranch,
  SnomedDescription, SnomedDescriptionSearchParams,
  SnomedTranslation,
  SnomedTranslationLibService
} from 'term-web/integration/_lib';
import {forkJoin} from 'rxjs';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {saveAs} from 'file-saver';


@Component({
  templateUrl: 'snomed-branch-management.component.html',
  providers: [DestroyService]
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
  protected importModalData: {visible?: boolean, type?: string, createCodeSystemVersion?: boolean, file?: any} = {createCodeSystemVersion: true};

  @ViewChild("lockModalForm") public lockModalForm?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;
  @ViewChild("importModalForm") public importModalForm?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private snomedService: SnomedService,
    private snomedTranslationService: SnomedTranslationLibService,
    private notificationService: MuiNotificationService,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
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
    ])).subscribe(([b, descriptions]) => {
      this.snomedBranch = this.writeBranch(b);
      this.descriptions = {data: descriptions.items || [], meta: {total: descriptions.total, offset: descriptions.offset}};
    });

    this.snomedTranslationService.loadTranslations({active: true, unlinked: true})
      .subscribe(translations => this.translations = translations);
  }

  private loadData(): void {
    this.loader.wrap('init', this.snomedService.loadBranches()).subscribe(b => this.branches = b);
  }

  protected executeIntegrityCheck(): void {
    this.loader.wrap('interity-check', this.snomedService.branchIntegrityCheck(this.snomedBranch.path)).subscribe(res => console.log(res));
  }

  protected lock(): void {
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
  };

  protected exportToRF2(): void {
    if (!validateForm(this.exportModalForm)) {
      return;
    }
    this.loader.wrap('export', this.snomedService.createExportJob({branchPath: this.snomedBranch.path, type: this.exportModalData.type})).subscribe(resp => {
      this.getRF2File(resp.jobId);
    });
  }

  protected importFromRF2(): void {
    if (!validateForm(this.importModalForm)) {
      return;
    }

    const file: Blob = this.fileInput?.nativeElement?.files?.[0];
    this.loader.wrap('import', this.snomedService.createImportJob({
      branchPath: this.snomedBranch.path,
      type: this.importModalData.type,
      createCodeSystemVersion: this.importModalData.createCodeSystemVersion
    }, file)).subscribe(resp => {
        this.pollJobStatus(resp.jobId);
      });
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
    if (!isDefined(c)) {
      return '';
    }
    return c.split('/').join('--');
  };

  private getRF2File(jobId: string): void {
    this.loader.wrap('export', this.snomedService.getRF2File(jobId)).subscribe(res => {
      this.exportModalData = {};
      saveAs(res, `SnomedCT_Export.zip`);
    });
  }

  private pollJobStatus(jobId: string): void {
    this.loader.wrap('import', this.snomedService.pollJob(jobId, this.destroy$)).subscribe(jobResp => {
      this.importModalData = {createCodeSystemVersion: true};
      if (jobResp.status === 'FAILED') {
        this.notificationService.error(jobResp.errorMessage || 'web.snomed.branch.management.import-failed');
      }
      if (jobResp.status === 'COMPLETED') {
        this.notificationService.success('web.snomed.branch.management.import-succeeded');
      }
    });
  }

  protected addDescriptions(): void {
    let translations = collect(this.translations.filter(t => !!t['checked']), t => t.conceptId);
    let concepts: {[key: string]: {translationIds: number[]}} = {};
    Object.keys(translations).forEach(conceptId => concepts[conceptId] = {translationIds: translations[conceptId].map(t => t.id)});
    this.loader.wrap('descriptions', this.snomedService.conceptTransaction(this.snomedBranch.path, {concepts: concepts}))
      .subscribe(() => this.loadBranch(this.snomedBranch.path));
  }

  protected removeDescriptions(): void {
    let descriptionIds = this.descriptions.data.filter(d => !!d['checked']).map(d => d.descriptionId);
    descriptionIds.forEach(id => {
      this.loader.wrap('descriptions', this.snomedService.deleteDescription(this.snomedBranch.path, id))
        .subscribe(() => this.loadBranch(this.snomedBranch.path));
    });
  }

  public conceptSelected(conceptId: string): void {
    this.descriptionParams.conceptId = conceptId;
    this.descriptionParams.offset = 0;
    this.loadDescriptions();
  }
}
