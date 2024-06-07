import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {compareDates, isDefined, LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {FhirConceptMapLibService, SEPARATOR} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MapSet, MapSetVersion} from 'app/src/app/resources/_lib';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {AuthService} from 'term-web/core/auth';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {Provenance, Release, ReleaseLibService} from 'term-web/sys/_lib';

@Component({
  selector: 'tw-map-set-version-info-widget',
  templateUrl: 'map-set-version-info-widget.component.html'
})
export class MapSetVersionInfoWidgetComponent implements OnChanges {
  @Input() public mapSet: MapSet;
  @Input() public version: MapSetVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected provenances: Provenance[];
  protected releases: Release[];

  protected loader = new LoadingManager();

  public constructor(
    private mapSetService: MapSetService,
    private fhirConceptMapService: FhirConceptMapLibService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService,
    private authService: AuthService,
    private releaseService: ReleaseLibService,
    private router: Router
  ) {}

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
