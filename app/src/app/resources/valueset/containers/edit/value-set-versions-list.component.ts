import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/resources';
import {ValueSetService} from '../../services/value-set.service';


@Component({
  selector: 'twa-value-set-versions-list',
  templateUrl: 'value-set-versions-list.component.html',
})
export class ValueSetVersionsListComponent implements OnChanges {
  @Input() public valueSetId?: string;

  public versions: ValueSetVersion[] = [];
  public loading = false;

  public constructor(private valueSetService: ValueSetService) {}

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
}
