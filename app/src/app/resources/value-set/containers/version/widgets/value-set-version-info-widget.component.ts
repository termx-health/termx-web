import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {compareDates, isDefined, LoadingManager, DestroyService} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {FhirValueSetLibService, SEPARATOR} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {ValueSet, ValueSetVersion} from 'app/src/app/resources/_lib';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {AuthService} from 'term-web/core/auth';
import {Space, SpaceLibService} from 'term-web/sys/_lib/space';
import {Provenance, Release, ReleaseLibService, LorqueLibService} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-value-set-version-info-widget',
  templateUrl: 'value-set-version-info-widget.component.html',
  providers: [DestroyService]
})
export class ValueSetVersionInfoWidgetComponent implements OnChanges {
  protected SEPARATOR = SEPARATOR;
  @Input() public valueSet: ValueSet;
  @Input() public version: ValueSetVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected provenances: Provenance[];
  protected githubSpaces: Space[];
  protected releases: Release[];

  protected loader = new LoadingManager();

  public constructor(
    private destroy$: DestroyService,
    private valueSetService: ValueSetService,
    private fhirValueSetService: FhirValueSetLibService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService,
    private spaceService: SpaceLibService,
    private authService: AuthService,
    private releaseService: ReleaseLibService,
    private lorqueService: LorqueLibService,
    private router: Router
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.valueSetService.loadProvenances(this.version.valueSet, this.version.version))
        .subscribe(resp => this.provenances = resp);
      if (this.authService.hasPrivilege('*.Space.view')) {
        this.spaceService.search({resource: 'value-set|' + this.version.valueSet}).subscribe(r => {
          this.githubSpaces = r.data.filter(s => !!s.integration?.github?.repo
            && (Object.keys(s.integration.github.dirs || {}).some(d => ['valueset-fhir-json', 'valueset-fhir-fsh'].includes(d)))
          );
        });
      }
      this.loadRelease();
    }
  }

  protected downloadDefinition(format: string): void {
    if (['csv', 'xlsx'].includes(format)) {
      this.valueSetService.exportConcepts(this.version.valueSet, this.version.version, format).subscribe(process => {
        this.lorqueService.pollFinishedProcess(process.id, this.destroy$).subscribe(status => {
          if (status === 'failed') {
            this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          } else  {
            const fileName = `VS-${this.version?.valueSet}-${this.version.version}`;
            this.valueSetService.getConceptExportResult(process.id, format, fileName);
          }
        });
      });
    } else  {
      this.fhirValueSetService.loadValueSet(this.version.valueSet, this.version.version).subscribe(fhirVs => {
        this.saveFile(fhirVs, format);
      });
    }
  }

  private saveFile(fhirVs: any, format: string): void {
    const json = JSON.stringify(fhirVs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `VS-${fhirVs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `VS-${fhirVs.id}.xml`);
    }
    if (format === 'fsh r4') {
      this.fhirToFsh(fhirVs.id, json, '4.3.0');
    }
    if (format === 'fsh r5') {
      this.fhirToFsh(fhirVs.id, json, '5.0.0');
    }
  }

  private fhirToFsh(valueSetId: string, json: string, version: string): void {
    this.chefService.fhirToFsh({fhir: [json]}, version).subscribe(r => {
      r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
      r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
      const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
      saveAs(new Blob([fsh], {type: 'application/fsh'}), `CS-${valueSetId}.fsh`);
    });    
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.valueSetService.changeValueSetVersionStatus(this.version.valueSet, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/ValueSet/' + this.version.valueSet + SEPARATOR + this.version.version, '_blank');
  }

  protected getLastProvenance = (provenances: Provenance[], activity?: string): Provenance => {
    return provenances?.filter(p => !isDefined(activity) || p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };

  public openRelease(id: number): void {
    this.router.navigate(['/releases', id, 'summary']);
  }

  protected loadRelease(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.releaseService.search({resource: ['ValueSet', this.version.valueSet, this.version.version].join('|')}).subscribe(r => {
        this.releases = r.data;
      });
    }
  }
}
