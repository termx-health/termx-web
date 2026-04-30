import {Component, OnInit, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {
  MarinPageLayoutModule,
  MuiAlertModule,
  MuiButtonModule,
  MuiCardModule,
  MuiCheckboxModule,
  MuiCoreModule,
  MuiFormModule,
  MuiNotificationService,
  MuiSpinnerModule,
  MuiTableModule,
  MuiTextareaModule
} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';

interface SnomedConceptUsage {
  resourceType: string;
  resourceId: string;
  resourceVersion?: string;
  conceptCode: string;
  location: string;
}

@Component({
  templateUrl: 'snomed-concept-usage.component.html',
  imports: [
    FormsModule,
    MarinPageLayoutModule,
    MuiAlertModule,
    MuiButtonModule,
    MuiCardModule,
    MuiCheckboxModule,
    MuiCoreModule,
    MuiFormModule,
    MuiSpinnerModule,
    MuiTableModule,
    MuiTextareaModule,
    RouterLink,
    TranslatePipe
  ]
})
export class SnomedConceptUsageComponent implements OnInit {
  private snomedService = inject(SnomedService);
  private notificationService = inject(MuiNotificationService);
  private router = inject(Router);

  protected loader = new LoadingManager();
  protected rawInput = '';
  protected includeModified = false;
  protected detectedCodes: string[] = [];
  protected results?: SnomedConceptUsage[];

  public ngOnInit(): void {
    const state = (this.router.lastSuccessfulNavigation()?.extras?.state ?? history.state) as {codes?: string[], scan?: any} | undefined;
    if (state?.codes?.length) {
      this.rawInput = state.codes.join('\n');
      this.recomputeDetected();
    } else if (state?.scan) {
      this.rawInput = JSON.stringify(state.scan, null, 2);
      this.recomputeDetected();
    }
  }

  protected onInputChange(): void {
    this.recomputeDetected();
  }

  protected onIncludeModifiedChange(): void {
    this.recomputeDetected();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.rawInput = String(reader.result ?? '');
      this.recomputeDetected();
    };
    reader.readAsText(file);
  }

  protected search(): void {
    if (!this.detectedCodes.length) {
      this.notificationService.warning('web.snomed.concept-usage.no-codes');
      return;
    }
    this.loader.wrap('search', this.snomedService.findConceptUsage(this.detectedCodes)).subscribe(rows => {
      this.results = (rows ?? []) as SnomedConceptUsage[];
    });
  }

  protected resourceLink(row: SnomedConceptUsage): string[] | null {
    if (row.resourceType === 'CodeSystemSupplement') {
      return ['/resources/code-systems', row.resourceId, 'edit'];
    }
    if (row.resourceType === 'ValueSet' || row.resourceType === 'ValueSetExpansion') {
      if (row.resourceVersion) {
        return ['/resources/value-sets', row.resourceId, 'versions', row.resourceVersion, 'edit'];
      }
      return ['/resources/value-sets', row.resourceId, 'edit'];
    }
    return null;
  }

  private recomputeDetected(): void {
    this.detectedCodes = this.parseInput(this.rawInput, this.includeModified);
  }

  private parseInput(raw: string, includeModified: boolean): string[] {
    if (!raw?.trim()) {
      return [];
    }
    const codes = new Set<string>();
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        this.collectCodes(parsed, codes, includeModified);
        if (codes.size > 0) {
          return [...codes];
        }
      } catch {
        // fall through to text parsing
      }
    }
    raw.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean).forEach(c => codes.add(c));
    return [...codes];
  }

  private collectCodes(node: any, codes: Set<string>, includeModified: boolean, path: string[] = []): void {
    if (node === null || node === undefined) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(item => this.collectCodes(item, codes, includeModified, path));
      return;
    }
    if (typeof node === 'string' && /^\d+$/.test(node)) {
      // bare numeric string array entry
      codes.add(node);
      return;
    }
    if (typeof node !== 'object') {
      return;
    }

    if (path.length === 0 && (node.invalidatedConcepts || node.modifiedConcepts || node.newConcepts)) {
      (node.invalidatedConcepts as any[] || []).forEach(c => c?.conceptId && codes.add(c.conceptId));
      if (includeModified) {
        (node.modifiedConcepts as any[] || []).forEach(c => c?.conceptId && codes.add(c.conceptId));
      }
      return;
    }

    const id = node.conceptId ?? node.code;
    if (typeof id === 'string' && id.length) {
      codes.add(id);
    }
    Object.keys(node).forEach(k => this.collectCodes(node[k], codes, includeModified, [...path, k]));
  }
}
