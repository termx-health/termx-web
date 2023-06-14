import {Component, Input} from '@angular/core';
import {ValueSetVersion} from 'app/src/app/resources/_lib';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-value-set-versions-widget',
  templateUrl: 'value-set-versions-widget.component.html'
})
export class ValueSetVersionsWidgetComponent {
  @Input() public valueSet: string;
  @Input() public versions: ValueSetVersion[];

  public constructor(private router: Router) {}

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet, 'versions', version, 'summary']);
  }
}
