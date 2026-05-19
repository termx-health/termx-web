/**
 * Response shape for {@code GET /snomed/archives/{uuid}/file-stats} — the per-zip-entry
 * row counts that drive the archive detail page's "Files" panel.
 *
 * Mirrors termx-server's {@code SnomedRF2FileStats} DTO. Entries whose data-row count is
 * &le; 0 (header-only or empty files) are filtered out by the server.
 */
export class SnomedRF2FileStats {
  public archiveSize?: number;
  public entriesScanned?: number;
  public entries?: SnomedRF2FileStatsEntry[];
}

export class SnomedRF2FileStatsEntry {
  public name?: string;
  public rowCount?: number;
  public compressedSize?: number;
}
