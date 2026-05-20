import {CommonModule, Location} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DestroyService, LoadingManager} from '@termx-health/core-util';
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
  /** Provenance archives for delta detail. Loaded only when the current archive has
   *  meta.kind === 'delta', so the page can show the source / baseline filenames as clickable
   *  links instead of raw uuids. */
  protected sourceArchive?: BobObject;
  protected baselineArchive?: BobObject;

  /** Form bound to the "Import to Snowstorm" panel for source archives. Defaults are seeded
   *  from the archive's meta on load so the admin doesn't have to re-pick the RF2 type.
   *  DELTA is intentionally not offered — that flow lives under the Diff section + the
   *  generated delta archive's own page. */
  protected importForm: {type: 'SNAPSHOT' | 'FULL'; createCodeSystemVersion: boolean} = {
    type: 'SNAPSHOT',
    createCodeSystemVersion: true,
  };

  protected loader = new LoadingManager();
  protected deltaProgress?: number;
  protected deltaError?: string;
  /** Last delta uuid produced from THIS source archive's Calculate Delta run, used to
   *  render a "Go to Delta view" link as a fallback when the redirect didn't catch (e.g.
   *  the user navigated back to this page after the lorque completed). */
  protected lastGeneratedDeltaUuid?: string;
  /** Progress / error state for the legacy SnomedRF2ScanService run triggered by the
   *  "Analyze concepts" button on delta archives. The actual scan result is rendered on
   *  the existing SnomedRF2ScanResultComponent route. */
  protected scanProgress?: number;
  protected scanError?: string;

  public ngOnInit(): void {
    // Subscribe to paramMap so navigating between sibling archive detail pages (source
    // → delta after Calculate Delta completes, or any other deep link) actually refreshes
    // the page. Without this, Angular Router reuses the component instance, ngOnInit fires
    // only once, and we keep rendering the first uuid's data — which is why the
    // "redirect to Delta view after Calculate Delta" appeared to do nothing. The router
    // *did* navigate; the page just didn't re-render because nothing re-read paramMap.
    this.route.paramMap.subscribe(p => {
      this.shortName = p.get('shortName') ?? undefined;
      this.uuid = p.get('uuid') ?? undefined;
      this.lastGeneratedDeltaUuid = undefined; // stale once we switch archives
      if (!this.uuid) {
        return;
      }
      this.refresh();
    });
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
        this.sourceArchive = undefined;
        this.baselineArchive = undefined;
        // For a delta archive, resolve the source + baseline uuids to their BobObjects so the
        // provenance panel can render filenames + clickable links rather than opaque uuids.
        // Best-effort: if either lookup 404s the panel falls back to showing the uuid.
        if (this.isDelta) {
          const src = this.sourceUuid;
          const base = this.baselineUuid;
          if (src) {
            this.bobService.load(src).pipe(catchError(() => of(undefined))).subscribe(o => this.sourceArchive = o);
          }
          if (base) {
            this.bobService.load(base).pipe(catchError(() => of(undefined))).subscribe(o => this.baselineArchive = o);
          }
        } else {
          // Seed the import-to-Snowstorm form from whatever rf2Type the modal tagged at upload.
          // Falls back to SNAPSHOT (the most common case). DELTA is not offered here — the
          // delta flow lives under the Diff section.
          const rf2Type = this.rf2Type;
          this.importForm.type = rf2Type === 'FULL' ? 'FULL' : 'SNAPSHOT';
          this.importForm.createCodeSystemVersion = true;
        }
      });
  }

  /** Open another archive in the same per-CS detail route. */
  protected openArchive(uuid: string | undefined): void {
    if (!uuid || !this.shortName) {
      return;
    }
    this.router.navigate(['/integration/snomed/codesystems', this.shortName, 'archives', uuid]);
  }

  // ─── Delta summary (read from archive.meta, set by SnomedDeltaCalculateService) ──────

  protected get rowsExported(): number | undefined {
    const v = this.archive?.meta?.['rowsExported'];
    return typeof v === 'number' ? v : undefined;
  }

  protected get generatedAt(): string | undefined {
    return this.archive?.meta?.['generatedAt'];
  }

  protected get latestStateMode(): boolean | undefined {
    const v = this.archive?.meta?.['latestState'];
    return typeof v === 'boolean' ? v : undefined;
  }

  /** Formats large counts with thousand separators for the headline tiles. */
  protected formatNumber(n: number | undefined): string {
    if (n == null) {
      return '—';
    }
    return n.toLocaleString();
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
            // Stash the uuid so the Diff section renders a "Go to Delta view" link if the
            // user navigates back here later — defensive fallback for the redirect.
            this.lastGeneratedDeltaUuid = payload.deltaUuid;
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

  /** Source-archive path: imports the current archive into Snowstorm using the rf2Type +
   *  createCodeSystemVersion the admin picked in the form. */
  protected uploadToSnowstorm(): void {
    this.runSnowstormImport(this.importForm.type, this.importForm.createCodeSystemVersion, 'upload');
  }

  /** Delta-archive path: always DELTA, no CodeSystem version (deltas don't bump versions —
   *  they merge into the existing branch state). */
  protected uploadDeltaToSnowstorm(): void {
    this.runSnowstormImport('DELTA', false, 'upload-delta');
  }

  /**
   * Shared import flow: POST /snomed/imports/from-archive, poll the Lorque process until the
   * Bob→Snowstorm streaming finishes, pull the Snowstorm jobId out of the result, then chain
   * into Snowstorm-side polling so the admin sees a real "import succeeded" notification —
   * not just "the file got forwarded".
   */
  private runSnowstormImport(
    type: 'SNAPSHOT' | 'DELTA' | 'FULL',
    createCodeSystemVersion: boolean,
    loaderKey: 'upload' | 'upload-delta',
  ): void {
    if (!this.uuid || !this.branchPath) {
      this.notificationService.error('Archive is missing a branchPath — re-upload it from the CodeSystem edit page.');
      return;
    }
    this.loader
      .wrap(
        loaderKey,
        this.snomedService.createImportJobFromArchive({
          archiveUuid: this.uuid,
          branchPath: this.branchPath,
          type,
          createCodeSystemVersion,
        }),
      )
      .subscribe({
        next: lorque => {
          this.notificationService.success(`${type} upload to Snowstorm started`);
          this.lorqueService.pollProcessProgress(lorque.id, this.destroy$).subscribe(p => {
            if (!p?.status || p.status === 'running') {
              return;
            }
            if (p.status === 'failed') {
              this.lorqueService
                .load(lorque.id)
                .subscribe(loaded => this.notificationService.error(loaded.resultText || `${type} upload failed`));
              return;
            }
            // status === 'completed' — pull the {jobId} out of the lorque result and start
            // polling Snowstorm directly. Same pattern the legacy modal flow used.
            this.lorqueService.load(lorque.id).subscribe(loaded => {
              try {
                const payload = JSON.parse(loaded.resultText || '{}');
                if (payload.jobId) {
                  this.pollSnowstormImport(payload.jobId);
                  return;
                }
              } catch {
                /* fall through */
              }
              this.notificationService.success(`${type} archive forwarded to Snowstorm`);
            });
          });
        },
        error: err => this.notificationService.error(this.extractErrorMessage(err)),
      });
  }

  /** Polls Snowstorm's own import-job state via the existing snomedService.pollImportJob
   *  helper (same one snomed-codesystem-edit.component used pre-refactor). */
  private pollSnowstormImport(jobId: string): void {
    this.snomedService.pollImportJob(jobId, this.destroy$).subscribe({
      next: jobResp => {
        if (jobResp?.status === 'FAILED') {
          this.notificationService.error(jobResp.errorMessage || 'Snowstorm import failed');
        } else if (jobResp?.status === 'COMPLETED') {
          this.notificationService.success('Snowstorm import completed');
        }
      },
      error: err => this.notificationService.error(this.extractErrorMessage(err)),
    });
  }

  /**
   * Trigger the legacy in-Java RF2 scan against this archive (typically a delta) and route
   * to the existing /rf2-scan-result page when it finishes. That page renders the added /
   * modified / invalidated concept tables and has its own "Find usages" button into the
   * concept-usage analysis page — i.e. we reuse the dry-run UI on delta archives per the
   * Phase 2 user spec.
   *
   * The endpoint POST /snomed/imports/scan/from-archive already accepts any Bob archive uuid
   * and produces a SnomedRF2ScanEnvelope, so this is pure wiring — no new backend.
   */
  protected analyzeConcepts(): void {
    if (!this.uuid || !this.branchPath || !this.shortName) {
      return;
    }
    this.scanError = undefined;
    this.scanProgress = 0;
    this.loader.wrap(
      'scan',
      this.snomedService.scanRF2FromArchive({
        archiveUuid: this.uuid,
        branchPath: this.branchPath,
        // For a delta the RF2 layout under /Delta/* uses delta filenames; reuse the same
        // SnomedImportRequest.type the legacy /imports/scan flow used (the scan parser keys
        // off filename prefixes, not the type tag, so DELTA is safe here).
        type: this.isDelta ? 'DELTA' : (this.rf2Type as 'SNAPSHOT' | 'FULL') ?? 'SNAPSHOT',
        // 'full' mode populates relationships + language refset so the result has acceptability
        // and attribute coverage. Summary mode hides those — and on a delta they're already
        // small enough that the full pass costs no real time.
        mode: 'full',
      }),
    ).subscribe({
      next: lorque => this.pollScanProgress(lorque.id),
      error: err => this.handleScanError(err),
    });
  }

  private pollScanProgress(lorqueId: number): void {
    this.lorqueService.pollProcessProgress(lorqueId, this.destroy$).subscribe(p => {
      if (p?.progressPercent != null) {
        this.scanProgress = p.progressPercent;
      }
      if (!p?.status || p.status === 'running') {
        return;
      }
      this.scanProgress = undefined;
      if (p.status === 'failed') {
        this.lorqueService.load(lorqueId).subscribe(loaded => this.scanError = loaded.resultText ?? 'Scan failed');
        return;
      }
      // Hand off to the existing scan-result component — it has the added/modified/
      // invalidated tables already, plus the "Find usages" button into the concept-usage
      // analysis page (which is the answer to "how do I see which CS/VS are affected").
      this.snomedService.loadScanResult(lorqueId).subscribe(envelope => {
        if (!this.shortName || !this.uuid) {
          return;
        }
        // archiveUuid in the URL so the scan-result page knows which archive's results
        // these are (fixes the "always show same data" stale-component bug), AND so it can
        // render the filename in its header. Envelope still travels via router state to
        // avoid re-fetching from the server on the destination.
        this.router.navigate(
          ['/integration/snomed/codesystems', this.shortName, 'rf2-scan-result', this.uuid],
          {state: {envelope, shortName: this.shortName}},
        );
      });
    });
  }

  private handleScanError(err: any): void {
    this.scanProgress = undefined;
    this.scanError = this.extractErrorMessage(err);
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
