import { Component, Input, inject } from '@angular/core';
import { isDefined, LoadingManager, JoinPipe, LocalDatePipe, MapPipe } from '@termx-health/core-util';
import {ImplementationGuide, ImplementationGuideVersion, ImplementationGuideVersionDependsOn} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

import { MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-implementation-guide-version-info-widget',
    templateUrl: 'implementation-guide-version-info-widget.component.html',
    imports: [MuiNoDataModule, StatusTagComponent, MuiIconModule, MuiDividerModule, PrivilegedDirective, MuiCoreModule, MuiButtonModule, RouterLink, TranslatePipe, JoinPipe, LocalDatePipe, MapPipe]
})
export class ImplementationGuideVersionInfoWidgetComponent {
  private igService = inject(ImplementationGuideService);

  @Input() public ig: ImplementationGuide;
  @Input() public version: ImplementationGuideVersion;


  protected loader = new LoadingManager();

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.igService.changeVersionStatus(this.version.implementationGuide, this.version.version, status).subscribe(() => this.version.status = status);
  }

  protected mapDependsOn = (dependsOn: ImplementationGuideVersionDependsOn): string => [dependsOn.packageId, dependsOn.version].filter(i => isDefined(i)).join(': ');

}
