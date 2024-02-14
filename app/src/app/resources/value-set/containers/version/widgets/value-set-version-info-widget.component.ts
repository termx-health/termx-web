import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ValueSet, ValueSetVersion} from 'app/src/app/resources/_lib';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService, SEPARATOR} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {environment} from 'app/src/environments/environment';
import {Provenance} from 'term-web/sys/_lib';
import {compareDates, isDefined, LoadingManager} from '@kodality-web/core-util';
import {Space, SpaceLibService} from 'term-web/space/_lib';
import {AuthService} from 'term-web/core/auth';

@Component({
  selector: 'tw-value-set-version-info-widget',
  templateUrl: 'value-set-version-info-widget.component.html'
})
export class ValueSetVersionInfoWidgetComponent implements OnChanges {
  protected SEPARATOR = SEPARATOR;
  @Input() public valueSet: ValueSet;
  @Input() public version: ValueSetVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected provenances: Provenance[];
  protected githubSpaces: Space[];

  protected loader = new LoadingManager();

  public constructor(
    private valueSetService: ValueSetService,
    private fhirValueSetService: FhirValueSetLibService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService,
    private spaceService: SpaceLibService,
    private authService: AuthService
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
    }
  }

  protected downloadDefinition(format: string): void {
    this.fhirValueSetService.loadValueSet(this.version.valueSet, this.version.version).subscribe(fhirVs => {
      this.saveFile(fhirVs, format);
    });
  }

  private saveFile(fhirVs: any, format: string): void {
    const json = JSON.stringify(fhirVs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `${fhirVs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `${fhirVs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `${fhirVs.id}.fsh`);
      });
    }
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
}
