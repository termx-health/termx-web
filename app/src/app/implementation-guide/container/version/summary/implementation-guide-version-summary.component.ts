import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {forkJoin} from 'rxjs';
import {ImplementationGuide, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideGroupListComponent} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-group-list.component';
import {ImplementationGuidePageListComponent} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-page-list.component';
import {
  ImplementationGuideResourceListComponent
} from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-resource-list.component';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule } from '@termx-health/ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';

import { ImplementationGuideVersionInfoWidgetComponent } from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-version-info-widget.component';
import { ImplementationGuideGroupListComponent as ImplementationGuideGroupListComponent_1 } from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-group-list.component';
import { ImplementationGuideResourceListComponent as ImplementationGuideResourceListComponent_1 } from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-resource-list.component';
import { ImplementationGuidePageListComponent as ImplementationGuidePageListComponent_1 } from 'term-web/implementation-guide/container/version/summary/widgets/implementation-guide-page-list.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: 'implementation-guide-version-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, MuiButtonModule, RouterLink, MuiIconModule, ImplementationGuideVersionInfoWidgetComponent, ImplementationGuideGroupListComponent_1, ImplementationGuideResourceListComponent_1, ImplementationGuidePageListComponent_1, TranslatePipe, PrivilegedPipe]
})
export class ImplementationGuideVersionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private igService = inject(ImplementationGuideService);

  protected ig?: ImplementationGuide;
  protected igVersion?: ImplementationGuideVersion;
  protected loader = new LoadingManager();

  protected groupsChanged: boolean;
  @ViewChild(ImplementationGuideGroupListComponent) public groupListComponent?: ImplementationGuideGroupListComponent;
  protected resourcesChanged: boolean;
  @ViewChild(ImplementationGuideResourceListComponent) public resourceListComponent?: ImplementationGuideResourceListComponent;
  protected pagesChanged: boolean;
  @ViewChild(ImplementationGuidePageListComponent) public pageListComponent?: ImplementationGuidePageListComponent;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(ig: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.igService.load(ig), this.igService.loadVersion(ig, versionCode)])
    ).subscribe(([ig, igv]) => {
      this.ig = ig;
      this.igVersion = igv;
    });
  }

  public saveGroups(): void {
    if (!this.groupListComponent.validate()){
      return;
    }
    this.loader.wrap('save', this.igService.saveVersionGroups(this.ig.id, this.igVersion.version, this.groupListComponent.groups))
      .subscribe(() => {
        this.loadData(this.ig.id, this.igVersion.version);
        this.groupsChanged = false;
      });
  }

  public saveResources(): void {
    if (!this.resourceListComponent.validate()){
      return;
    }
    this.loader.wrap('save', this.igService.saveVersionResource(this.ig.id, this.igVersion.version, this.resourceListComponent.resources))
      .subscribe(() => {
        this.resourceListComponent.loadData(this.ig.id, this.igVersion.version);
        this.resourcesChanged = false;
      });
  }

  public savePages(): void {
    if (!this.pageListComponent.validate()){
      return;
    }
    this.loader.wrap('save', this.igService.saveVersionPages(this.ig.id, this.igVersion.version, this.pageListComponent.pages))
      .subscribe(() => {
        this.pageListComponent.loadData(this.ig.id, this.igVersion.version);
        this.pagesChanged = false;
      });
  }
}
