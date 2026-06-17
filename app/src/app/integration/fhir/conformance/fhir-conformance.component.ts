import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MarinPageLayoutModule,
  MuiAlertModule,
  MuiButtonModule,
  MuiCardModule,
  MuiCoreModule,
  MuiFormModule,
  MuiInputModule,
  MuiNotificationService,
  MuiTableModule
} from '@termx-health/ui';
import {NzProgressModule} from 'ng-zorro-antd/progress';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {BobLibService, LorqueLibService} from 'term-web/sys/_lib';
import {LorqueProcess} from 'term-web/sys/_lib/lorque/model/lorque-process';
import {FhirConformanceService} from './fhir-conformance.service';

interface TxTestRow {
  name: string;
  result: string;
}

/**
 * Runs the official HL7 tx-ecosystem terminology conformance suite against this server
 * (backend {@code POST /tx-conformance/runs}), polls the async LorqueProcess, and renders the
 * resulting FHIR TestReport. Optionally uploads a custom test bundle to the {@code tx-conformance}
 * Bob container first. Mirrors the SNOMED RF2 import screen.
 */
@Component({
  templateUrl: './fhir-conformance.component.html',
  imports: [
    MarinPageLayoutModule, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiTableModule,
    MuiAlertModule, MuiCoreModule, NzProgressModule, FormsModule, PrivilegedDirective
  ],
  providers: [FhirConformanceService]
})
export class FhirConformanceComponent {
  private conformanceService = inject(FhirConformanceService);
  private bobService = inject(BobLibService);
  private lorqueService = inject(LorqueLibService);
  private notificationService = inject(MuiNotificationService);

  protected suite?: string;
  protected running = false;
  protected progress = 0;
  protected progressNote?: string;

  protected uploadProgress?: number;
  protected bundleUuid?: string;
  protected bundleName?: string;

  protected report?: any;
  protected tests: TxTestRow[] = [];
  protected error?: string;

  protected onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.uploadProgress = 0;
    this.bobService.upload({container: 'tx-conformance', file, filename: file.name, meta: {kind: 'tx-test-bundle'}}).subscribe({
      next: e => {
        if (e.finished) {
          this.bundleUuid = e.body?.uuid;
          this.bundleName = file.name;
          this.uploadProgress = undefined;
          this.notificationService.success('Test bundle uploaded');
        } else {
          this.uploadProgress = e.progress;
        }
      },
      error: () => {
        this.uploadProgress = undefined;
        this.notificationService.error('Test bundle upload failed');
      }
    });
  }

  protected clearBundle(): void {
    this.bundleUuid = undefined;
    this.bundleName = undefined;
  }

  protected run(): void {
    this.running = true;
    this.progress = 0;
    this.progressNote = undefined;
    this.report = undefined;
    this.tests = [];
    this.error = undefined;

    this.conformanceService.run({suite: this.suite || undefined, archiveUuid: this.bundleUuid}).subscribe({
      next: process => {
        this.lorqueService.pollProcessProgress(process.id).subscribe({
          next: p => {
            this.progress = p.progressPercent ?? this.progress;
            this.progressNote = p.progressNote;
            if (p.status && p.status.toLowerCase() !== 'running') {
              this.finish(p);
            }
          },
          error: () => {
            this.running = false;
            this.error = 'Failed while polling the conformance run';
          }
        });
      },
      error: () => {
        this.running = false;
        this.notificationService.error('Failed to start the conformance run');
      }
    });
  }

  private finish(p: LorqueProcess): void {
    this.running = false;
    if ((p.status || '').toLowerCase() === 'failed' || !p.resultText) {
      this.error = p.resultText || 'Conformance run failed';
      return;
    }
    try {
      this.report = JSON.parse(p.resultText);
      this.tests = (this.report.test || []).map((t: any) => ({
        name: t.name,
        result: t.action?.[0]?.operation?.result || 'unknown'
      }));
    } catch (e) {
      this.error = 'Could not parse the TestReport response';
    }
  }

  protected get passedCount(): number {
    return this.tests.filter(t => t.result === 'pass').length;
  }
}
