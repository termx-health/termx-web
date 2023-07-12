import {Component, Input} from '@angular/core';
import {ValueSetVersion} from 'app/src/app/resources/_lib';
import {Router} from '@angular/router';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';

@Component({
  selector: 'tw-value-set-versions-widget',
  templateUrl: 'value-set-versions-widget.component.html'
})
export class ValueSetVersionsWidgetComponent {
  @Input() public valueSet: string;
  @Input() public versions: ValueSetVersion[];

  public constructor(private router: Router, private valueSetService: ValueSetService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet, 'versions', version, 'summary']);
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.valueSetService.deleteValueSetVersion(this.valueSet, version).subscribe(() => {
      this.versions = [...this.versions.filter(v => v.version !== version)];
    });
  }
}
