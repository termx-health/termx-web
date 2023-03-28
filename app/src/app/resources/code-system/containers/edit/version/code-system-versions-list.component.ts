import {Component, Input} from '@angular/core';
import {CodeSystemService} from '../../../services/code-system.service';
import {saveAs} from 'file-saver';
import {BooleanInput} from '@kodality-web/core-util';
import {Fhir} from 'fhir/fhir';
import {environment} from 'environments/environment';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {FhirCodeSystemLibService} from 'term-web/fhir/_lib';


@Component({
  selector: 'tw-code-system-versions-list',
  templateUrl: 'code-system-versions-list.component.html',
})
export class CodeSystemVersionsListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string;
  @Input() public versions: CodeSystemVersion[] = [];
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private integrationFhirLibService: FhirCodeSystemLibService
  ) {}

  public loadVersions(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.loading = true;
    this.codeSystemService.searchVersions(this.codeSystemId, {limit: -1})
      .subscribe(versions => this.versions = versions.data)
      .add(() => this.loading = false);
  }

  public activateVersion(version: CodeSystemVersion): void {
    this.loading = true;
    this.codeSystemService.activateVersion(version.codeSystem!, version.version!).subscribe(() => version.status = 'active').add(() => this.loading = false);
  }

  public retireVersion(version: CodeSystemVersion): void {
    this.loading = true;
    this.codeSystemService.retireVersion(version.codeSystem!, version.version!).subscribe(() => version.status = 'retired').add(() => this.loading = false);
  }

  public saveAsDraft(version: CodeSystemVersion): void {
    this.loading = true;
    this.codeSystemService.saveVersionAsDraft(version.codeSystem!, version.version!).subscribe(() => version.status = 'draft').add(() => this.loading = false);
  }

  public exportFhirFormatVersion(id: string, version: string, type: 'json' | 'xml'): void {
    this.integrationFhirLibService.loadCodeSystem(id, version).subscribe(fhirCs => {
      const json = JSON.stringify(fhirCs, null, 2);
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([type === 'json' ? json : xml], {type: 'application/' + type}), `${fhirCs.id}.${type}`);
    });
  }

  public openFhir(id: string, version: string): void {
    window.open(environment.terminologyApi + '/fhir/CodeSystem/' + id + '?version=' + version, '_blank');
  }
}
