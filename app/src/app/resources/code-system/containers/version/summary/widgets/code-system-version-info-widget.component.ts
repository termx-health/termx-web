import {Component, Input} from '@angular/core';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirCodeSystemLibService} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {environment} from 'app/src/environments/environment';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';

@Component({
  selector: 'tw-code-system-version-info-widget',
  templateUrl: 'code-system-version-info-widget.component.html'
})
export class CodeSystemVersionInfoWidgetComponent {
  @Input() public version: CodeSystemVersion;

  public constructor(
    private codeSystemService: CodeSystemService,
    private fhirCodeSystemService: FhirCodeSystemLibService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService) {}

  protected downloadDefinition(format: string): void {
    this.fhirCodeSystemService.loadCodeSystem(this.version.codeSystem, this.version.version).subscribe(fhirCs => {
      this.saveFile(fhirCs, format);
    });
  }

  private saveFile(fhirCs: any, format: string): void {
    const json = JSON.stringify(fhirCs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `${fhirCs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `${fhirCs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `${fhirCs.id}.fsh`);
      });
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.codeSystemService.changeCodeSystemVersionStatus(this.version.codeSystem, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(): void {
    window.open(environment.termxApi + '/fhir/CodeSystem/' + this.version.codeSystem + '@' + this.version.version, '_blank');
  }
}
