import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { compareDates, DestroyService, isDefined, LoadingManager, ApplyPipe, JoinPipe, LocalDatePipe } from '@kodality-web/core-util';
import { MuiNotificationService, MuiNoDataModule, MuiDividerModule, MuiCoreModule, MuiIconModule, MuiDropdownModule } from '@kodality-web/marina-ui';
import {FhirCodeSystemLibService, SEPARATOR} from 'term-web/fhir/_lib';
import {ChefService} from 'term-web/integration/_lib';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {AuthService} from 'term-web/core/auth';
import {Space, SpaceLibService} from 'term-web/sys/_lib/space';
import {LorqueLibService, Provenance, ReleaseLibService, Release} from 'term-web/sys/_lib';
import { UpperCasePipe } from '@angular/common';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { CopyContainerComponent } from 'term-web/core/ui/components/copy-container/copy-container.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { ResourceReleaseModalComponent } from 'term-web/resources/resource/components/resource-release-modal-component';
import { ValueSetVersionSaveModalComponent } from 'term-web/resources/value-set/components/value-set-version-save-modal-component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    selector: 'tw-code-system-version-info-widget',
    templateUrl: 'code-system-version-info-widget.component.html',
    providers: [DestroyService],
    imports: [MuiNoDataModule, MuiDividerModule, MuiCoreModule, StatusTagComponent, MuiIconModule, CopyContainerComponent, RouterLink, PrivilegedDirective, MuiDropdownModule, ResourceTaskModalComponent, ResourceReleaseModalComponent, ValueSetVersionSaveModalComponent, UpperCasePipe, TranslatePipe, MarinaUtilModule, ApplyPipe, JoinPipe, LocalDatePipe, PrivilegedPipe]
})
export class CodeSystemVersionInfoWidgetComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemService);
  private fhirCodeSystemService = inject(FhirCodeSystemLibService);
  private chefService = inject(ChefService);
  private notificationService = inject(MuiNotificationService);
  private spaceService = inject(SpaceLibService);
  private releaseService = inject(ReleaseLibService);
  private authService = inject(AuthService);
  private lorqueService = inject(LorqueLibService);
  private destroy$ = inject(DestroyService);
  private router = inject(Router);

  protected SEPARATOR = SEPARATOR;
  @Input() public codeSystem: CodeSystem;
  @Input() public version: CodeSystemVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();
  @Output() public versionChanged: EventEmitter<void> = new EventEmitter();

  protected provenances: Provenance[];
  protected githubSpaces: Space[];
  protected releases: Release[];

  protected loader = new LoadingManager();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.codeSystemService.loadProvenances(this.version.codeSystem, this.version.version))
        .subscribe(resp => this.provenances = resp);
      if (this.authService.hasPrivilege('*.Space.view')) {
        this.spaceService.search({resource: 'code-system|' + this.version.codeSystem}).subscribe(r => {
          this.githubSpaces = r.data.filter(s => !!s.integration?.github?.repo
            && (Object.keys(s.integration.github.dirs || {}).some(d => ['codesystem-fhir-json', 'codesystem-fhir-fsh'].includes(d)))
          );
        });
      }
      this.loadRelease();
    }
  }

  protected downloadDefinition(format: string): void {
    if (['csv', 'xlsx'].includes(format)) {
      this.codeSystemService.exportConcepts(this.version.codeSystem, this.version.version, format).subscribe(process => {
        this.lorqueService.pollFinishedProcess(process.id, this.destroy$).subscribe(status => {
          if (status === 'failed') {
            this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          } else  {
            const fileName = `CS-${this.version?.codeSystem}-${this.version.version}`;
            this.codeSystemService.getConceptExportResult(process.id, format, fileName);
          }
        });
      });
    } else {
      this.fhirCodeSystemService.loadCodeSystem(this.version.codeSystem, this.version.version).subscribe(fhirCs => {
        this.saveFile(fhirCs, format);
      });
    }
  }

  private saveFile(fhirCs: any, format: string): void {
    const json = JSON.stringify(fhirCs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `CS-${fhirCs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `CS-${fhirCs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `CS-${fhirCs.id}.fsh`);
      });
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.codeSystemService.changeCodeSystemVersionStatus(this.version.codeSystem, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/CodeSystem/' + this.version.codeSystem + SEPARATOR + this.version.version, '_blank');
  }

  protected getLastProvenance = (provenances: Provenance[], activity?: string): Provenance => {
    return provenances?.filter(p => !isDefined(activity) || p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };

  protected openVersionConcepts(): void {
    this.router.navigate(['/resources/code-systems', this.version.codeSystem, 'versions', this.version.version, 'concepts']);
  }

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['CodeSystem', this.version.codeSystem, this.version.version].join('|')}).subscribe(r => {
        this.releases = r.data;
      });
    }
  }
}
