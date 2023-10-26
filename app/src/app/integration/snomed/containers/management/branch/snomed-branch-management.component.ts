import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {DestroyService, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {SnomedAuthoringStatsItem, SnomedBranch, SnomedTranslation} from 'app/src/app/integration/_lib';
import {forkJoin} from 'rxjs';
import {SnomedService} from 'app/src/app/integration/snomed/services/snomed-service';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {saveAs} from 'file-saver';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';
import moment from 'moment';

@Component({
  templateUrl: 'snomed-branch-management.component.html',
  providers: [DestroyService]
})
export class SnomedBranchManagementComponent implements OnInit {
  protected snomedBranch?: SnomedBranch;
  protected type: 'daily-build' | 'working' | any = 'working';

  protected loader = new LoadingManager();

  protected changedFsn: SnomedAuthoringStatsItem[];
  protected newDescriptions: SnomedAuthoringStatsItem[];
  protected newSynonyms: SnomedAuthoringStatsItem[];
  protected inactivatedSynonyms: SnomedAuthoringStatsItem[];
  protected reactivatedSynonyms: SnomedAuthoringStatsItem[];

  protected unlinkedTranslations: SnomedTranslation[];

  protected lockModalData: {visible?: boolean, message?: string} = {};
  protected exportModalData: {visible?: boolean, type?: string} = {};
  protected importModalData: {visible?: boolean, type?: string, file?: any} = {type: 'SNAPSHOT'};
  protected csVersionModalData: {visible?: boolean, shortName?: string, effectiveDate?: number} = {};
  protected synonymDeactivationModalData: {visible?: boolean, descriptionId?: string} = {};
  protected synonymReactivationModalData: {visible?: boolean, descriptionId?: string} = {};

  @ViewChild("lockModalForm") public lockModalForm?: NgForm;
  @ViewChild("exportModalForm") public exportModalForm?: NgForm;
  @ViewChild("importModalForm") public importModalForm?: NgForm;
  @ViewChild("csVersionModalForm") public csVersionModalForm?: NgForm;
  @ViewChild("synonymDeactivationModalForm") public synonymDeactivationModalForm?: NgForm;
  @ViewChild("synonymReactivationModalForm") public synonymReactivationModalForm?: NgForm;
  @ViewChild('fileInput') public fileInput?: ElementRef<HTMLInputElement>;

  public constructor(
    private snomedService: SnomedService,
    private snomedTranslationService: SnomedTranslationService,
    private notificationService: MuiNotificationService,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    const path = this.route.snapshot.paramMap.get('path');
    this.type = this.route.snapshot.queryParamMap.get('type') || 'working';
    this.loadBranch(path);
    this.loadAuthoringStats(path);
  }

  private loadBranch(path: string): void {
    this.loader.wrap('load', this.snomedService.loadBranch(path)).subscribe(b => this.snomedBranch = this.writeBranch(b));
  }

  private loadAuthoringStats(path: string): void {
    this.loader.wrap('load', forkJoin([
      this.snomedService.loadBranchChangedFsn(path),
      this.snomedService.loadBranchNewDescriptions(path),
      this.snomedService.loadBranchNewSynonyms(path),
      this.snomedService.loadBranchInactivatedSynonyms(path),
      this.snomedService.loadBranchReactivatedSynonyms(path),
      this.snomedTranslationService.loadTranslations({active: true, unlinked: true, branch: path.split('--').join('/')})
    ])).subscribe(([changedFsn, newDescriptions, newSynonyms, inactivatedSynonyms, reactivatedSynonyms,
      translations]
    ) => {
      this.changedFsn = changedFsn;
      this.newDescriptions = newDescriptions;
      this.newSynonyms = newSynonyms;
      this.inactivatedSynonyms = inactivatedSynonyms;
      this.reactivatedSynonyms = reactivatedSynonyms;
      this.unlinkedTranslations = translations;
    });
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
      createCodeSystemVersion: false
    }, file)).subscribe(resp => {
      this.pollJobStatus(resp.jobId);
    });
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

  protected getAuthoringStatsData = (type: string): SnomedAuthoringStatsItem[] => {
    switch (type) {
      case 'changed-fsn':
        return this.changedFsn;
      case 'new-descriptions':
        return this.newDescriptions;
      case 'new-synonyms':
        return this.newSynonyms;
      case 'inactivated-synonyms':
        return this.inactivatedSynonyms;
      case 'reactivated-synonyms':
        return this.reactivatedSynonyms;
      default:
        return [];
    }
  };

  private getRF2File(jobId: string): void {
    this.loader.wrap('export', this.snomedService.getRF2File(jobId)).subscribe(res => {
      this.exportModalData = {};
      saveAs(res, `SnomedCT_Export.zip`);
    });
  }

  private pollJobStatus(jobId: string): void {
    this.loader.wrap('import', this.snomedService.pollJob(jobId, this.destroy$)).subscribe(jobResp => {
      this.importModalData = {type: 'SNAPSHOT'};
      if (jobResp.status === 'FAILED') {
        this.notificationService.error(jobResp.errorMessage || 'web.snomed.branch.management.import-failed');
      }
      if (jobResp.status === 'COMPLETED') {
        this.notificationService.success('web.snomed.branch.management.import-succeeded');
      }
    });
  }

  protected deleteDescription(id: string): void {
    this.loader.wrap('delete-description', this.snomedService.deleteDescription(this.snomedBranch.path, id))
      .subscribe(() => this.loadAuthoringStats(this.snomedBranch.path));
  }

  protected addTranslationToBranch(id: number): void {
    this.loader.wrap('add-translation', this.snomedTranslationService.addToBranch(id))
      .subscribe(() => this.loadAuthoringStats(this.snomedBranch.path));
  }

  protected openCsVersionModal(): void {
    const shortName = this.snomedBranch.path.split('/')[this.snomedBranch.path.split('/').length - 1];
    const date = Number(moment().format('YYYYMMDD').toString());
    this.csVersionModalData = {visible: true, shortName: shortName, effectiveDate: date};
  }

  protected createCodeSystemVersion(): void {
    if (!validateForm(this.csVersionModalForm)) {
      return;
    }
    this.loader.wrap('add-cs-version', this.snomedService.createCodeSystemVersion(this.csVersionModalData.shortName, this.csVersionModalData.effectiveDate))
      .subscribe(() => this.csVersionModalData = {});
  }

  protected deactivateSynonym(): void {
    if (!validateForm(this.synonymDeactivationModalForm)) {
      return;
    }
    this.loader.wrap('deactivate-description', this.snomedService.deactivateDescription(this.snomedBranch.path, this.synonymDeactivationModalData.descriptionId))
      .subscribe(() => {
        this.loadAuthoringStats(this.snomedBranch.path);
        this.synonymDeactivationModalData = {};
      });
  }

  protected reactivateSynonym(): void {
    if (!validateForm(this.synonymReactivationModalForm)) {
      return;
    }
    this.loader.wrap('reactivate-description', this.snomedService.reactivateDescription(this.snomedBranch.path, this.synonymReactivationModalData.descriptionId))
      .subscribe(() => {
        this.loadAuthoringStats(this.snomedBranch.path);
        this.synonymReactivationModalData = {};
      });
  }
}
