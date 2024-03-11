import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Router} from '@angular/router';
import {isDefined} from '@kodality-web/core-util';
import {ImplementationGuideVersion, ImplementationGuideVersionDependsOn} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

@Component({
  selector: 'tw-implementation-guide-versions-widget',
  templateUrl: 'implementation-guide-versions-widget.component.html'
})
export class ImplementationGuideVersionsWidgetComponent {
  @Input() public ig: string;
  @Input() public versions: ImplementationGuideVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  public constructor(private router: Router, private igService: ImplementationGuideService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/implementation-guides', this.ig, 'versions', version, 'summary']);
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.igService.deleteVersion(this.ig, version).subscribe(() => {
      this.versionsChanged.emit();
    });
  }

  protected getVersions = (versions: ImplementationGuideVersion[]): string[] => versions.map(v => v.version);

  protected mapDependsOn = (dependsOn: ImplementationGuideVersionDependsOn): string => {
    return [dependsOn.packageId, dependsOn.version].filter(i => isDefined(i)).join(': ');
  };
}
