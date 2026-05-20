import {HttpClient} from '@angular/common/http';
import {Component, TemplateRef, ViewChild, inject} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {DestroyService, LoadingManager, QueryParams} from '@termx-health/core-util';
import {
  MarinPageLayoutModule,
  MuiAlertModule,
  MuiButtonModule,
  MuiCardModule,
  MuiCoreModule,
  MuiFormModule,
  MuiInputModule,
  MuiModalModule,
  MuiNotificationService,
  MuiSelectModule,
} from '@termx-health/ui';
import {environment} from 'environments/environment';
import {BobArchivesComponent, BobLibService, BobObject, JobLibService, JobLog, JobLogResponse} from 'term-web/sys/_lib';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {ValueSetConceptSelectComponent} from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import {TranslatePipe} from '@ngx-translate/core';
import {HasAnyPrivilegePipe} from 'term-web/core/auth/privileges/has-any-privilege.pipe';

/**
 * Slot identifiers consumed by termx-server's LoincService.importLoinc — must stay in lock-
 * step with both LoincZipReader's BASENAME_TO_KEY and the {@code fileMap} keys accepted by
 * POST /loinc/import/from-archive. {@code translations} is filled in by the
 * {@code <lang>LinguisticVariant.csv} file matching the chosen language, so it doesn't carry
 * a fixed display name like the others.
 */
const SLOTS: {key: string; label: string}[] = [
  {key: 'parts', label: 'Parts'},
  {key: 'terminology', label: 'Terminology (LoincPartLink_Primary)'},
  {key: 'supplementary-properties', label: 'Supplementary properties (LoincPartLink_Supplementary)'},
  {key: 'panels', label: 'Panels and forms'},
  {key: 'answer-list', label: 'Answer list'},
  {key: 'answer-list-link', label: 'Answer list link'},
  {key: 'order-observation', label: 'Order/observation (LoincUniversalLabOrdersValueSet)'},
  {key: 'translations', label: 'Translations (<lang>LinguisticVariant)'},
];

interface ArchiveEntry {
  name?: string;
  suggestedSlot?: string | null;
}

@Component({
  templateUrl: 'loinc-import.component.html',
  providers: [DestroyService],
  imports: [
    MuiCardModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    FormsModule,
    MuiFormModule,
    MuiInputModule,
    MuiSelectModule,
    ValueSetConceptSelectComponent,
    MuiButtonModule,
    MuiAlertModule,
    MuiCoreModule,
    MuiModalModule,
    MarinPageLayoutModule,
    TranslatePipe,
    HasAnyPrivilegePipe,
    BobArchivesComponent,
  ],
})
export class LoincImportComponent {
  private http = inject(HttpClient);
  private bobService = inject(BobLibService);
  private notificationService = inject(MuiNotificationService);
  private jobService = inject(JobLibService);
  private destroy$ = inject(DestroyService);
  private router = inject(Router);

  /** Slot definitions (key + display label). */
  protected readonly slots = SLOTS;

  /** Form-bound state. */
  public data: {
    version?: string;
    language?: string;
    archiveUuid?: string;
    /** Per-slot entry-name picks. Keyed by SLOTS[].key. */
    fileMap: {[slot: string]: string | undefined};
  } = {fileMap: {}};

  /** All LOINC archives in Bob, used to (a) populate the version select and (b) resolve a
   *  picked version to the matching archive uuid. Refreshed after the user uploads via the
   *  Stored archives card. */
  protected archives: BobObject[] = [];
  /** Archives whose {@code meta.version} matches {@link data.version}. Recomputed on every
   *  version-select change so the secondary "LOINC archive" picker is bound to a stable
   *  array (avoids function-call expressions in the template that re-run every CD pass). */
  protected matchingArchives: BobObject[] = [];
  /** Entries inside the currently-selected archive (one per .csv) — populated from
   *  {@code GET /loinc/archives/{uuid}/files}. Drives the per-slot select options. */
  protected entries: ArchiveEntry[] = [];

  protected loader = new LoadingManager();
  public loading: {[k: string]: boolean} = {};
  public jobResponse: JobLog | null = null;
  protected modalData: {visible?: boolean} = {};

  @ViewChild('form') public form?: NgForm;
  @ViewChild('successNotificationContent') public successNotificationContent?: TemplateRef<any>;

  public ngOnInit(): void {
    this.loadArchives();
  }

  /** Distinct {@code meta.version} values across all LOINC archives, newest first by upload
   *  order. {@code null} / missing versions are surfaced as "(untagged)" so admins can still
   *  reach archives uploaded before meta-tagging was wired (PR #76's precursor). */
  protected get versionOptions(): {value: string; label: string}[] {
    const seen = new Set<string>();
    const out: {value: string; label: string}[] = [];
    for (const a of this.archives) {
      const v = (a.meta?.['version'] ?? '') as string;
      if (!seen.has(v)) {
        seen.add(v);
        out.push({value: v, label: v ? v : '(untagged)'});
      }
    }
    return out;
  }

  /** Triggered on version-select change. Auto-picks the most recently uploaded archive of
   *  the matching version so the admin doesn't have to do a second click for the common case
   *  of "one archive per version". They can still pick a different one manually. */
  protected onVersionChange(): void {
    this.matchingArchives = this.archives
      .filter(a => (a.meta?.['version'] ?? '') === (this.data.version ?? ''))
      // Most recent first — BobObject.id is monotonic per insertion, simplest "latest" proxy.
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    if (this.matchingArchives.length === 0) {
      this.data.archiveUuid = undefined;
      this.entries = [];
      this.data.fileMap = {};
      return;
    }
    this.data.archiveUuid = this.matchingArchives[0].uuid;
    this.onArchiveChange();
  }

  protected onArchiveChange(): void {
    this.entries = [];
    this.data.fileMap = {};
    if (!this.data.archiveUuid) {
      return;
    }
    const params = new HttpParamsLite();
    if (this.data.language) {
      params.set('language', this.data.language);
    }
    this.loader
      .wrap(
        'entries',
        this.http.get<{entries: ArchiveEntry[]}>(
          `${environment.termxApi}/loinc/archives/${this.data.archiveUuid}/files`,
          {params: params.build()},
        ),
      )
      .subscribe({
        next: resp => {
          this.entries = resp.entries ?? [];
          // Preselect each slot from the suggested mapping.
          for (const slot of SLOTS) {
            const hit = this.entries.find(e => e.suggestedSlot === slot.key);
            this.data.fileMap[slot.key] = hit?.name;
          }
        },
        error: () => this.entries = [],
      });
  }

  /** Language change re-runs the archive listing so the language-specific translations file
   *  gets its {@code suggestedSlot} populated. (Server keys translations off
   *  {@code <lang>LinguisticVariant.csv} — without the language, no entry can match.) */
  protected onLanguageChange(): void {
    if (this.data.archiveUuid) {
      this.onArchiveChange();
    }
  }

  /** Bob-archives card calls back here after a successful upload so the version dropdown +
   *  archive selection reflect the new file without a page reload. */
  protected onArchiveListChanged(): void {
    this.loadArchives();
  }

  private loadArchives(): void {
    this.loader
      .wrap(
        'archives',
        this.bobService.query('loinc', Object.assign(new QueryParams(), {limit: 100}) as any),
      )
      .subscribe(resp => {
        this.archives = resp.data ?? [];
        // If the form already has a version picked, re-derive the matching archive so the
        // per-slot selects stay populated after a refresh.
        if (this.data.version != null && !this.data.archiveUuid) {
          this.onVersionChange();
        }
      });
  }

  protected importLoinc(): void {
    if (!this.data.archiveUuid) {
      this.notificationService.error('Pick a LOINC version (and an archive) before importing.');
      return;
    }
    if (!this.data.version) {
      this.notificationService.error('Set the LOINC version above before importing.');
      return;
    }
    // Strip empty / undefined picks so the server's auto-dispatch fallback fires per-slot
    // for any that weren't explicitly mapped (otherwise the fileMap-override path skips
    // them silently).
    const fileMap: {[k: string]: string} = {};
    for (const slot of SLOTS) {
      const v = this.data.fileMap[slot.key];
      if (v) {
        fileMap[slot.key] = v;
      }
    }

    this.jobResponse = null;
    this.loading['process'] = true;
    this.modalData = {};
    this.http
      .post<JobLogResponse>(`${environment.termxApi}/loinc/import/from-archive`, {
        archiveUuid: this.data.archiveUuid,
        version: this.data.version,
        language: this.data.language,
        fileMap: Object.keys(fileMap).length > 0 ? fileMap : undefined,
      })
      .subscribe({
        next: resp => this.pollJobStatus(resp.jobId as number),
        error: () => (this.loading['process'] = false),
      });
  }

  private pollJobStatus(jobId: number): void {
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors && !jobResp.warnings) {
        this.notificationService.success(
          'web.integration.file-import.success-message',
          this.successNotificationContent!,
          {duration: 0, closable: true},
        );
      }
      this.jobResponse = jobResp;
    }).add(() => (this.loading['process'] = false));
  }

  /** Stored archives card's per-row Open action: select the row's version+archive in the
   *  form rather than triggering an immediate import. Admin then confirms via the Import
   *  button at the bottom of the form. Re-loads the archive list first so a freshly-
   *  uploaded zip's version shows up in the version select. */
  protected onArchiveOpen(archive: BobObject): void {
    if (!archive?.uuid) {
      return;
    }
    this.data.version = (archive.meta?.['version'] as string | undefined) ?? '';
    this.data.archiveUuid = archive.uuid;
    this.loadArchives();
    this.onArchiveChange();
  }

  /**
   * Auto-detect the LOINC release version from the chosen file's NAME so the admin doesn't
   * have to type it before uploading. Triggered by the {@code (fileSelected)} event on
   * {@code <tw-bob-archives>}. Standard LOINC distribution filenames are
   * {@code Loinc_<version>.zip} (e.g. {@code Loinc_2.82.zip}) and that's what we match —
   * if the regex misses, the version field stays as whatever the admin had previously, so
   * they can still type / pick it manually.
   *
   * Only overwrites the version when (a) the field is empty, or (b) the detected version
   * differs from what's in the field. Doesn't clobber an admin-typed value with a re-detect
   * of the same one.
   *
   * (For archives whose filename doesn't reveal the version, the server can still pick it
   * up from the {@code Loinc_<version>_DifferenceReport.pdf} entry inside the zip — see
   * {@code LoincZipReader.describe}; we'd need to add a similar regex on the server side
   * to backfill {@code meta.version} on already-uploaded archives.)
   */
  protected onLoincFilePicked(file: File | undefined): void {
    if (!file) {
      return;
    }
    const m = /Loinc[_-]?([\d.]+)/i.exec(file.name);
    if (m && m[1]) {
      const detected = m[1].replace(/\.+$/, ''); // strip trailing dots if filename was "Loinc_2.82..zip"
      if (this.data.version !== detected) {
        this.data.version = detected;
      }
    }
  }

  /**
   * Called by {@code <tw-bob-archives (uploaded)>} after a new LOINC archive has been
   * persisted to Bob. Refreshes the archives list (so the just-uploaded version shows up
   * in the dropdown), then auto-selects a "more suitable" pick where possible:
   *
   *   - If the uploaded BobObject has {@code meta.version} (it should — the page tagged
   *     the upload with the form's {@code data.version} via the {@code [meta]} binding),
   *     select that version + the new uuid and route the per-slot selects to it via
   *     {@code onVersionChange()}.
   *   - If meta.version is empty (the admin uploaded without setting a version first),
   *     leave the form alone and let the admin pick — the new file is in the list but
   *     its dropdown entry shows as "(untagged)".
   */
  protected onLoincUploaded(uploaded: BobObject): void {
    this.loader
      .wrap(
        'archives',
        this.bobService.query('loinc', Object.assign(new QueryParams(), {limit: 100}) as any),
      )
      .subscribe(resp => {
        this.archives = resp.data ?? [];
        const newVersion = (uploaded.meta?.['version'] as string | undefined) ?? '';
        if (newVersion) {
          this.data.version = newVersion;
          this.data.archiveUuid = uploaded.uuid;
          this.onVersionChange();
        }
      });
  }

  protected openCodeSystem(mode: 'edit' | 'view'): void {
    this.router.navigate(['/resources/code-systems/', 'loinc', mode]);
  }
}

/** Tiny shim so we don't pull a whole HttpParams instance for one optional language param. */
class HttpParamsLite {
  private map: {[k: string]: string} = {};
  public set(k: string, v: string): void { this.map[k] = v; }
  public build(): {[k: string]: string} { return this.map; }
}
