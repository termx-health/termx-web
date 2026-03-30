import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {Router} from '@angular/router';
import { isDefined, JoinPipe, MapPipe } from '@termx-health/core-util';
import {ImplementationGuideVersion, ImplementationGuideVersionDependsOn} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

import { MuiNoDataModule, MuiListModule, MuiDividerModule, MuiIconModule, MuiDropdownModule, MuiCoreModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    selector: 'tw-implementation-guide-versions-widget',
    templateUrl: 'implementation-guide-versions-widget.component.html',
    imports: [MuiNoDataModule, MuiListModule, MuiDividerModule, MuiIconModule, StatusTagComponent, MuiDropdownModule, MuiCoreModule, TranslatePipe, JoinPipe, MapPipe, HasAnyPrivilegePipe]
})
export class ImplementationGuideVersionsWidgetComponent {
  private router = inject(Router);
  private igService = inject(ImplementationGuideService);

  @Input() public ig: string;
  @Input() public versions: ImplementationGuideVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

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
