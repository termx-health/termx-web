import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/resources';
import {ValueSetService} from '../../services/value-set.service';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService} from 'terminology-lib/fhir';
import {BooleanInput} from '@kodality-web/core-util';
import {Fhir} from 'fhir/fhir';


@Component({
  selector: 'twa-value-set-versions-list',
  templateUrl: 'value-set-versions-list.component.html',
})
export class ValueSetVersionsListComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public valueSetId?: string;
  @Input() public valueSetUri?: string;

  public versions: ValueSetVersion[] = [];
  public loading = false;

  public constructor(private valueSetService: ValueSetService, private integrationFhirLibService: FhirValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"]?.currentValue) {
      this.loadVersions();
    }
  }

  private loadVersions(): void {
    if (!this.valueSetId) {
      return;
    }
    this.loading = true;
    this.valueSetService.searchVersions(this.valueSetId, {limit: -1})
      .subscribe(versions => this.versions = versions.data)
      .add(() => this.loading = false);
  }

  public activateVersion(version: ValueSetVersion): void {
    this.loading = true;
    this.valueSetService.activateVersion(version.valueSet!, version.version!).subscribe(() => version.status = 'active').add(() => this.loading = false);
  }

  public retireVersion(version: ValueSetVersion): void {
    this.loading = true;
    this.valueSetService.retireVersion(version.valueSet!, version.version!).subscribe(() => version.status = 'retired').add(() => this.loading = false);
  }

  public saveAsDraft(version: ValueSetVersion): void {
    this.loading = true;
    this.valueSetService.saveVersionAsDraft(version.valueSet!, version.version!).subscribe(() => version.status = 'draft').add(() => this.loading = false);
  }

  public exportFhirFormatVersion(id: number, type: 'json' | 'xml'): void {
    this.integrationFhirLibService.loadValueSet(id).subscribe(fhirVs => {
      const json = JSON.stringify(fhirVs, null, 2);
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([type === 'json' ? json : xml], {type: 'application/' + type}), `${fhirVs.id}.${type}`);
    });
  }

  public exportFhirFormatVersionExpansion(uri: string, version: string): void {
    this.integrationFhirLibService.expand({url: uri, valueSetVersion: version}).subscribe(fhirVs => {
      saveAs(new Blob([JSON.stringify(fhirVs, null, 2)], {type: 'application/json'}), `${fhirVs.id}.json`);
    });
  }
}
