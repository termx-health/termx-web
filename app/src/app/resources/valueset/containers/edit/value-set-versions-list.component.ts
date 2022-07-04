import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/resources';
import {ValueSetService} from '../../services/value-set.service';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService} from 'terminology-lib/fhir';


@Component({
  selector: 'twa-value-set-versions-list',
  templateUrl: 'value-set-versions-list.component.html',
})
export class ValueSetVersionsListComponent implements OnChanges {
  @Input() public valueSetId?: string;

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
    this.valueSetService.loadVersions(this.valueSetId)
      .subscribe(versions => this.versions = versions)
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

  public exportFhirFormatVersion(id: number): void {
    this.integrationFhirLibService.loadValueSet(id).subscribe(fhirVs => {
      saveAs(new Blob([JSON.stringify(fhirVs, null, 2)], {type: 'application/json'}), `${fhirVs.id}.json`);
    });
  }
}
