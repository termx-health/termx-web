import {CommonModule, Location} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {DestroyService, LoadingManager, LocalDateTimePipe} from '@termx-health/core-util';
import {
  MarinPageLayoutModule,
  MuiAlertModule,
  MuiButtonModule,
  MuiCardModule,
  MuiCoreModule,
  MuiFormModule,
  MuiNotificationService,
  MuiSelectModule,
  MuiSpinnerModule,
  MuiTableModule,
} from '@termx-health/ui';
import {forkJoin, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SnomedRF2FileStats} from 'term-web/integration/snomed/services/snomed-rf2-file-stats';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {BobLibService, BobObject, LorqueLibService} from 'term-web/sys/_lib';

/**
 * Per-archive detail page. Route:
 *
 *     /integration/snomed/codesystems/:shortName/archives/:uuid
 *
 * Reached either from the "Stored archives" card (link on the filename) or after the
 * "Import from RF2" modal finishes uploading. Always shows:
 *
 *   - **Header**: filename, content type, branchPath / rf2Type from meta, upload time
 *   - **Files panel**: row count per zip entry (GET /snomed/archives/{uuid}/file-stats)
 *   - **Diff section**: select listing other archives with the same branchPath, plus a
 *     "Calculate Delta" button that triggers the delta-generator run server-side
 *
 * For delta archives ({@code meta.kind === 'delta'}) the page also shows a provenance banner
 * and an **Upload to Snowstorm** button that reuses the existing /snomed/imports/from-archive
 * endpoint with {@code type=DELTA}. The Calculate Delta + Upload buttons stay disabled with a
 * "coming soon" toast until the Phase 2b backend lands (it provides the delta endpoint).
 */
@Component({
  templateUrl: 'snomed-archive-detail.component.html',
  providers: [DestroyService],
  imports: [
    CommonModule,
    FormsModule,
    MarinPageLayoutModule,
    MuiAlertModule,
    MuiButtonModule,
    MuiCardModule,
    MuiCoreModule,
    MuiFormModule,
    MuiSelectModule,
    MuiSpinnerModule,
    MuiTableModule,
    TranslatePipe,
    LocalDateTimePipe,
  ],
})
export class SnomedArchiveDetailComponent implements OnInit {
  private bobService = inject(BobLibService);
  private snomedService = inject(SnomedService);
  private lorqueService = inject(LorqueLibService);
  private notificationService = inject(MuiNotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private destroy$ = inject(DestroyService);

  protected shortName?: string;
  protected uuid?: string;

  protected archive?: BobObject;
  protected fileStats?: SnomedRF2FileStats;
  protected diffCandidates: BobObject[] = [];
  protected selectedBaselineUuid?: string;

  protected loader = new LoadingManager();
  protected deltaProgress?: number;
  protected deltaError?: string;

  public ngOnInit(): void {
    this.shortName = this.route.snapshot.paramMap.get('shortName') ?? undefined;
    this.uuid = this.route.snapshot.paramMap.get('uuid') ?? undefined;
    if (!this.uuid) {
      return;
    }
    this.refresh();
  }

  /** Reloads everything — used after a delta calculation, since the page can rebind to the
   *  newly-generated delta archive without leaving the route. */
  private refresh(): void {
    if (!this.uuid) {
      return;
    }
    this.loader
      .wrap(
        'load',
        forkJoin({
          archive: this.bobService.load(this.uuid),
          stats: this.snomedService.loadArchiveFileStats(this.uuid).pipe(
            // file-stats fails cleanly if the object isn't an RF2 zip — show counts as empty
            // rather than blocking the page render
            catchError(() => of(new SnomedRF2FileStats())),
          ),
          candidates: this.snomedService.loadDiffCandidates(this.uuid).pipe(
            // 2b not landed yet → swallow 404 / 501 and present an empty diff list
            catchError(() => of([] as BobObject[])),
          ),
        }),
      )
      .subscribe(({archive, stats, candidates}) => {
        this.archive = archive;
        this.fileStats = stats;
        this.diffCandidates = candidates ?? [];
        this.selectedBaselineUuid = undefined;
      });
  }

  protected get isDelta(): boolean {
    return this.archive?.meta?.['kind'] === 'delta';
  }

  protected get rf2Type(): string | undefined {
    return this.archive?.meta?.['rf2Type'];
  }

  protected get branchPath(): string | undefined {
    return this.archive?.meta?.['branchPath'];
  }

  protected get sourceUuid(): string | undefined {
    return this.archive?.meta?.['sourceUuid'];
  }

  protected get baselineUuid(): string | undefined {
    return this.archive?.meta?.['baselineUuid'];
  }

  protected goBack(): void {
    if (this.shortName) {
      this.router.navigate(['/integration/snomed/codesystems', this.shortName, 'edit']);
    } else {
      this.location.back();
    }
  }

  protected download(): void {
    if (!this.uuid) {
      return;
    }
    window.open(this.bobService.contentUrl(this.uuid), '_blank');
  }

  protected calculateDelta(): void {
    if (!this.uuid || !this.selectedBaselineUuid) {
      return;
    }
    this.deltaError = undefined;
    this.deltaProgress = 0;
    this.loader
      .wrap('delta', this.snomedService.calculateDelta(this.uuid, this.selectedBaselineUuid))
      .subscribe({
        next: lorque => this.pollDeltaProgress(lorque.id),
        error: err => this.handleDeltaError(err),
      });
  }

  private pollDeltaProgress(lorqueId: number): void {
    this.lorqueService.pollProcessProgress(lorqueId, this.destroy$).subscribe(p => {
      if (p?.progressPercent != null) {
        this.deltaProgress = p.progressPercent;
      }
      if (!p?.status || p.status === 'running') {
        return;
      }
      this.deltaProgress = undefined;
      if (p.status === 'failed') {
        this.lorqueService
          .load(lorqueId)
          .subscribe(loaded => (this.deltaError = loaded.resultText ?? 'Delta calculation failed'));
        return;
      }
      // status === 'completed' — load the produced delta uuid out of the lorque result and
      // navigate to its detail page. Server returns the new BobObject's uuid as JSON.
      this.lorqueService.load(lorqueId).subscribe(loaded => {
        try {
          const payload = JSON.parse(loaded.resultText || '{}');
          if (payload.deltaUuid && this.shortName) {
            this.notificationService.success('Delta generated');
            this.router.navigate([
              '/integration/snomed/codesystems',
              this.shortName,
              'archives',
              payload.deltaUuid,
            ]);
            return;
          }
        } catch {
          // fall through to a generic success notification + reload
        }
        this.notificationService.success('Delta generated');
        this.refresh();
      });
    });
  }

  private handleDeltaError(err: any): void {
    this.deltaProgress = undefined;
    // The 2b backend endpoint may not be deployed yet — fail soft with a coming-soon toast
    // instead of bubbling the raw 404 / 501.
    if (err?.status === 404 || err?.status === 501) {
      this.deltaError =
        'Delta calculation is not yet available — vendor the IHTSDO delta-generator-tool jar (Phase 2b).';
      return;
    }
    this.deltaError = this.extractErrorMessage(err);
  }

  protected uploadDeltaToSnowstorm(): void {
    if (!this.uuid || !this.branchPath) {
      return;
    }
    this.loader
      .wrap(
        'upload-delta',
        this.snomedService.createImportJobFromArchive({
          archiveUuid: this.uuid,
          branchPath: this.branchPath,
          type: 'DELTA',
          createCodeSystemVersion: false,
        }),
      )
      .subscribe({
        next: lorque => {
          this.notificationService.success('Delta upload to Snowstorm started');
          this.lorqueService.pollProcessProgress(lorque.id, this.destroy$).subscribe(p => {
            if (p?.status === 'failed') {
              this.lorqueService
                .load(lorque.id)
                .subscribe(loaded => this.notificationService.error(loaded.resultText));
            } else if (p?.status === 'completed') {
              this.notificationService.success('Delta forwarded to Snowstorm');
            }
          });
        },
        error: err => this.notificationService.error(this.extractErrorMessage(err)),
      });
  }

  protected baselineLabel(c: BobObject): string {
    const name = c.storage?.filename ?? c.uuid ?? '';
    const desc = c.description ? ` — ${c.description}` : '';
    return `${name}${desc}`;
  }

  protected formatSize(n?: number): string {
    if (n == null) {
      return '';
    }
    if (n < 1024) {
      return `${n} B`;
    }
    if (n < 1024 * 1024) {
      return `${(n / 1024).toFixed(1)} KB`;
    }
    if (n < 1024 * 1024 * 1024) {
      return `${(n / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  private extractErrorMessage(err: any): string {
    const body = err?.error;
    if (Array.isArray(body) && body.length > 0) {
      return body.map((i: any) => i?.message || i?.code || String(i)).join('; ');
    }
    return body?.message || err?.message || 'Request failed';
  }
}
