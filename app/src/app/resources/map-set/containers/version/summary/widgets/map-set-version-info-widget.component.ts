import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import {Router} from '@angular/router';
import { compareDates, isDefined, LoadingManager, ApplyPipe, JoinPipe, LocalDatePipe } from '@kodality-web/core-util';
import { MuiNotificationService, MuiNoDataModule, MuiDividerModule, MuiIconModule, MuiCoreModule } from '@kodality-web/marina-ui';
import {FhirConceptMapLibService, SEPARATOR} from 'term-web/fhir/_lib';
import {ChefService} from 'term-web/integration/_lib';
import {MapSet, MapSetVersion} from 'term-web/resources/_lib';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {AuthService} from 'term-web/core/auth';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {Provenance, Release, ReleaseLibService} from 'term-web/sys/_lib';
import * as ExcelJS from 'exceljs';
import { UpperCasePipe } from '@angular/common';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { ResourceReleaseModalComponent } from 'term-web/resources/resource/components/resource-release-modal-component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-map-set-version-info-widget',
    templateUrl: 'map-set-version-info-widget.component.html',
    imports: [MuiNoDataModule, MuiDividerModule, StatusTagComponent, MuiIconModule, MuiCoreModule, PrivilegedDirective, ResourceTaskModalComponent, ResourceReleaseModalComponent, UpperCasePipe, TranslatePipe, MarinaUtilModule, ApplyPipe, JoinPipe, LocalDatePipe, PrivilegedPipe]
})
export class MapSetVersionInfoWidgetComponent implements OnChanges {
  private mapSetService = inject(MapSetService);
  private fhirConceptMapService = inject(FhirConceptMapLibService);
  private chefService = inject(ChefService);
  private notificationService = inject(MuiNotificationService);
  private authService = inject(AuthService);
  private releaseService = inject(ReleaseLibService);
  private router = inject(Router);

  @Input() public mapSet: MapSet;
  @Input() public version: MapSetVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected provenances: Provenance[];
  protected releases: Release[];

  protected loader = new LoadingManager();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.mapSetService.loadProvenances(this.version.mapSet, this.version.version))
        .subscribe(resp => this.provenances = resp);
      this.loadRelease();
    }
  }

  protected downloadDefinition(format: string): void {
    this.fhirConceptMapService.loadConceptMap(this.version.mapSet, this.version.version).subscribe(fhirMs => {
      this.saveFile(fhirMs, format);
    });
  }

  private saveFile(fhirMs: any, format: string): void {
    const json = JSON.stringify(fhirMs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `MS-${fhirMs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `MS-${fhirMs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `MS-${fhirMs.id}.fsh`);
      });
    }
    if (format === 'csv' || format === 'xlsx') {
      const rows: string[][] = [];
      const headers = ['sourceCode', 'sourceDisplay', 'sourceCodeSystem', 'targetCode', 'targetDisplay', 'targetCodeSystem', 'relationship'];
      rows.push(headers);

      (fhirMs.group || []).forEach((group: any) => {
        const sourceSystem = group.source || '';
        const targetSystem = group.target || '';

        (group.element || []).forEach((element: any) => {
          const sourceCode = element.code || '';
          const sourceDisplay = element.display || '';

          if (element.target && element.target.length > 0) {
            element.target.forEach((target: any) => {
              rows.push([
                sourceCode,
                sourceDisplay,
                sourceSystem,
                target.code || '',
                target.display || '',
                targetSystem,
                target.equivalence || target.relationship || ''
              ]);
            });
          } else {
            rows.push([sourceCode, sourceDisplay, sourceSystem, '', '', '', 'no-map']);
          }
        });
      });

      if (format === 'csv') {
        const csv = rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n');
        saveAs(new Blob([csv], {type: 'text/csv'}), `MS-${fhirMs.id}.csv`);
      }
      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Associations');

        worksheet.addRows(rows);

        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}), `MS-${fhirMs.id}.xlsx`);
        });
      }
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.mapSetService.changeMapSetVersionStatus(this.version.mapSet, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/ConceptMap/' + this.version.mapSet + SEPARATOR + this.version.version, '_blank');
  }

  protected getLastProvenance = (provenances: Provenance[], activity?: string): Provenance => {
    return provenances?.filter(p => !isDefined(activity) || p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['MapSet', this.version.mapSet, this.version.version].join('|')}).subscribe(r => {
        this.releases = r.data;
      });
    }
  }
}
