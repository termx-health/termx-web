import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {CodeSystemVersion} from 'terminology-lib/resources';
import {FhirCodeSystemLibService} from 'terminology-lib/fhir';
import {saveAs} from 'file-saver';


@Component({
  selector: 'twa-code-system-versions-list',
  templateUrl: 'code-system-versions-list.component.html',
})
export class CodeSystemVersionsListComponent implements OnChanges {
  @Input() public codeSystemId?: string;

  public versions: CodeSystemVersion[] = [];
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private integrationFhirLibService: FhirCodeSystemLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loadVersions();
    }
  }

  public loadVersions(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.loading = true;
    this.codeSystemService.loadVersions(this.codeSystemId)
      .subscribe(versions => this.versions = versions)
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

  public exportFhirFormatVersion(id: number): void {
    this.integrationFhirLibService.loadCodeSystem(id).subscribe(fhirCs => {
      saveAs(new Blob([JSON.stringify(fhirCs, null, 2)], {type: 'application/json'}), `${fhirCs.id}.json`);
    });
  }
}
