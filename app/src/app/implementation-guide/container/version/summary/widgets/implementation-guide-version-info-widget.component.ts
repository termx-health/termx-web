import {Component, Input} from '@angular/core';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {ImplementationGuide, ImplementationGuideVersion, ImplementationGuideVersionDependsOn} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

@Component({
  selector: 'tw-implementation-guide-version-info-widget',
  templateUrl: 'implementation-guide-version-info-widget.component.html'
})
export class ImplementationGuideVersionInfoWidgetComponent {
  @Input() public ig: ImplementationGuide;
  @Input() public version: ImplementationGuideVersion;


  protected loader = new LoadingManager();

  public constructor(private igService: ImplementationGuideService) {}

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.igService.changeVersionStatus(this.version.implementationGuide, this.version.version, status).subscribe(() => this.version.status = status);
  }

  protected mapDependsOn = (dependsOn: ImplementationGuideVersionDependsOn): string => [dependsOn.packageId, dependsOn.version].filter(i => isDefined(i)).join(': ');

}
