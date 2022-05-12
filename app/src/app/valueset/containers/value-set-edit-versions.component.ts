import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/valueset/services/value-set-version';
import {ValueSetService} from '../services/value-set.service';


@Component({
  selector: 'twa-value-set-edit-versions',
  templateUrl: './value-set-edit-versions.component.html',
})
export class ValueSetEditVersionsComponent implements OnChanges {
  @Input() public valueSetId?: string;

  public loading?: boolean;
  public versions?: ValueSetVersion[];

  public constructor(private valueSetService: ValueSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"]?.currentValue) {
      this.loading = true;
      this.valueSetService.loadVersions(changes["valueSetId"].currentValue)
        .subscribe(versions => this.versions = versions)
        .add(() => this.loading = false);
    }
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
