import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {saveAs} from 'file-saver';
import {LoadingManager} from '@termx-health/core-util';
import {
  MarinPageLayoutModule,
  MuiAlertModule,
  MuiButtonModule,
  MuiCardModule,
  MuiCoreModule,
  MuiFormModule,
  MuiNotificationService,
  MuiSpinnerModule,
  MuiTableModule
} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {NzProgressComponent} from 'ng-zorro-antd/progress';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {BobLibService, BobObject, LorqueLibService} from 'term-web/sys/_lib';
import {of} from 'rxjs';
import {catchError} from 'rxjs/operators';

interface ScanDesignation {
  descriptionId?: string;
  term?: string;
  type?: string;
  language?: string;
  acceptability?: string;
  active?: boolean;
}

interface ScanAttribute {
  relationshipId?: string;
  typeId?: string;
  destinationId?: string;
  relationshipGroup?: number;
  active?: boolean;
}

interface ScanNewConcept {
  conceptId: string;
  effectiveTime?: string;
  moduleId?: string;
  definitionStatusId?: string;
  designations?: ScanDesignation[];
  attributes?: ScanAttribute[];
}

interface ScanModifiedConcept {
  conceptId: string;
  addedDesignations?: ScanDesignation[];
  removedDesignations?: ScanDesignation[];
  addedAttributes?: ScanAttribute[];
  removedAttributes?: ScanAttribute[];
}

interface ScanInvalidatedConcept {
  conceptId: string;
  effectiveTime?: string;
  moduleId?: string;
  designations?: ScanDesignation[];
}

interface ScanResultJson {
  branchPath?: string;
  rf2Type?: string;
  releaseEffectiveTime?: string;
  scannedAt?: string;
  uploadCacheId?: number;
  stats?: {
    conceptsAdded?: number;
    conceptsModified?: number;
    conceptsInvalidated?: number;
    descriptionsAdded?: number;
    descriptionsInvalidated?: number;
    relationshipsAdded?: number;
    relationshipsInvalidated?: number;
  };
  newConcepts?: ScanNewConcept[];
  modifiedConcepts?: ScanModifiedConcept[];
  invalidatedConcepts?: ScanInvalidatedConcept[];
}

interface ScanEnvelope {
  json: ScanResultJson;
  markdown: string;
}

@Component({
  templateUrl: 'snomed-rf2-scan-result.component.html',
  imports: [
    MarinPageLayoutModule,
    MuiAlertModule,
    MuiButtonModule,
    MuiCardModule,
    MuiCoreModule,
    MuiFormModule,
    MuiSpinnerModule,
    MuiTableModule,
    NzProgressComponent,
    PrivilegedDirective,
    TranslatePipe
  ]
})
export class SnomedRF2ScanResultComponent implements OnInit {
  private snomedService = inject(SnomedService);
  private lorqueService = inject(LorqueLibService);
  private bobService = inject(BobLibService);
  private notificationService = inject(MuiNotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected envelope?: ScanEnvelope;
  protected shortName?: string;
  protected archiveUuid?: string;
  protected archive?: BobObject;
  protected loader = new LoadingManager();
  protected proceeding = false;

  public ngOnInit(): void {
    // Subscribe to paramMap so navigating between different archives' scan results within
    // the same CodeSystem refreshes the page. Each paramMap emission re-fetches the latest
    // scan envelope server-side, keyed by archive uuid — this is the canonical "same URL ⇒
    // same data" path. Router state is consulted only as a fast-path for the Analyze
    // concepts → router.navigate handoff (so we don't re-fetch what the just-completed
    // server call already returned to us).
    this.route.paramMap.subscribe(p => {
      this.shortName = p.get('shortName') ?? undefined;
      this.archiveUuid = p.get('archiveUuid') ?? undefined;
      this.envelope = undefined;
      this.archive = undefined;

      if (!this.archiveUuid) {
        this.router.navigate(['/integration/snomed/management']);
        return;
      }

      // Fast path: envelope arrived via router state on the Analyze-concepts navigation.
      // Skip the server round-trip in that case.
      const state = (this.router.lastSuccessfulNavigation()?.extras?.state ?? history.state) as
        {envelope?: ScanEnvelope, shortName?: string} | undefined;
      if (state?.envelope) {
        this.envelope = state.envelope;
      } else {
        // Refresh / paste / back-forward / no state — fetch the latest scan keyed by archive
        // uuid. The server resolves to the most-recent scan_lorque_id for this Bob uuid and
        // returns the envelope. Null body means "never scanned" → route the admin back to
        // the archive page so they can hit Analyze.
        this.loader
          .wrap('load-envelope', this.snomedService.loadLatestScanResult(this.archiveUuid))
          .subscribe({
            next: env => {
              if (env && env.json) {
                this.envelope = env as ScanEnvelope;
              } else {
                this.notificationService.warning('No cached scan result — re-run "Analyze concepts" on the archive page.');
                if (this.shortName && this.archiveUuid) {
                  this.router.navigate(['/integration/snomed/codesystems', this.shortName, 'archives', this.archiveUuid]);
                }
              }
            },
            error: () => {
              this.notificationService.error('Failed to load the latest scan result for this archive.');
            },
          });
      }

      // Always fetch the BobObject so the header can show filename + DELTA badge regardless
      // of which code path filled the envelope.
      this.bobService.load(this.archiveUuid).pipe(catchError(() => of(undefined))).subscribe(o => this.archive = o);
    });
  }

  protected get scan(): ScanResultJson | undefined {
    return this.envelope?.json;
  }

  protected downloadJson(): void {
    if (!this.envelope) {
      return;
    }
    const blob = new Blob([JSON.stringify(this.envelope.json, null, 2)], {type: 'application/json'});
    saveAs(blob, this.fileBaseName() + '.json');
  }

  protected downloadMarkdown(): void {
    if (!this.envelope) {
      return;
    }
    const blob = new Blob([this.envelope.markdown ?? ''], {type: 'text/markdown'});
    saveAs(blob, this.fileBaseName() + '.md');
  }

  protected checkUsage(): void {
    const codes = (this.scan?.invalidatedConcepts ?? []).map(c => c.conceptId).filter(Boolean);
    this.router.navigate(['/integration/snomed/concept-usage'], {state: {codes}});
  }

  protected proceedImport(): void {
    if (!this.scan?.uploadCacheId || this.proceeding) {
      return;
    }
    this.proceeding = true;
    this.loader.wrap('proceed', this.snomedService.proceedScanImport(this.scan.uploadCacheId)).subscribe({
      next: resp => {
        this.notificationService.success('web.snomed.scan-result.proceed-started');
        this.snomedService.pollImportJob(resp.jobId).subscribe(jobResp => {
          this.proceeding = false;
          if (jobResp?.status === 'COMPLETED') {
            this.notificationService.success('web.snomed.branch.management.import-succeeded');
          }
          if (jobResp?.status === 'FAILED') {
            this.notificationService.error(jobResp.errorMessage || 'web.snomed.branch.management.import-failed');
          }
        });
      },
      error: () => this.proceeding = false
    });
  }

  protected attributeLabel(attr: ScanAttribute): string {
    const dest = attr?.destinationId ?? '';
    const grp = attr?.relationshipGroup != null ? ' [g' + attr.relationshipGroup + ']' : '';
    return (attr?.typeId ?? '') + ' → ' + dest + grp;
  }

  protected designationLabel(d: ScanDesignation): string {
    const meta = [d?.type, d?.language, d?.acceptability].filter(Boolean).join(', ');
    return (d?.term ?? '') + (meta ? ' (' + meta + ')' : '');
  }

  private fileBaseName(): string {
    const ts = (this.scan?.scannedAt ?? new Date().toISOString()).replace(/[:.]/g, '-');
    return 'snomed-rf2-scan-' + ts;
  }
}
