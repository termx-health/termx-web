import {Component, Input} from '@angular/core';
import {ValueSetVersion} from 'app/src/app/resources/_lib';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {environment} from 'app/src/environments/environment';

@Component({
  selector: 'tw-value-set-version-info-widget',
  templateUrl: 'value-set-version-info-widget.component.html'
})
export class ValueSetVersionInfoWidgetComponent {
  @Input() public version: ValueSetVersion;

  public constructor(
    private valueSetService: ValueSetService,
    private fhirValueSetService: FhirValueSetLibService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService) {}

  protected downloadDefinition(format: string): void {
    this.fhirValueSetService.loadValueSet(this.version.valueSet, this.version.version).subscribe(fhirVs => {
      this.saveFile(fhirVs, format);
    });
  }

  protected downloadExpansion(format: string): void {
    this.fhirValueSetService.expandValueSet(this.version.valueSet, {valueSetVersion: this.version.version}).subscribe(fhirVs => {
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

  public openJson(expand: boolean = false): void {
    if (expand) {
      window.open(environment.terminologyApi + '/fhir/ValueSet/' + this.version.valueSet + '@' + this.version.version + '/$expand' , '_blank');
    } else {
      window.open(environment.terminologyApi + '/fhir/ValueSet/' + this.version.valueSet + '@' + this.version.version , '_blank');
    }
  }
}
