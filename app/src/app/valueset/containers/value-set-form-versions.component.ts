import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/valueset/services/value-set-version';
import {ValueSetService} from '../services/value-set.service';

@Component({
  selector: 'twa-value-set-form-versions',
  templateUrl: './value-set-form-versions.component.html',
})
export class ValueSetFormVersionsComponent implements OnChanges {

  public loading?: boolean;
  public versions?: ValueSetVersion[];

  @Input() public valueSetId?: string;

  public constructor(private valueSetService: ValueSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["valueSetId"]?.currentValue) {
      this.loading = true;
      this.valueSetService.loadVersions(changes["valueSetId"].currentValue)
        .subscribe(versions => this.versions = versions)
        .add(() => this.loading = false);
    }
  }

  public changeStatus(version: ValueSetVersion): void {
    if (version.valueSet) {
      this.loading = true;
      switch (version.status) {
        case 'active': {
          version.status = 'retired';
          return this.valueSetService.changeVersionStatus(version).subscribe().add(() => this.loading = false);
        }
        default: {
          version.status = 'active';
          return this.valueSetService.changeVersionStatus(version).subscribe().add(() => this.loading = false);
        }
      }
    }
  }
}
