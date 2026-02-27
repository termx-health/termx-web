import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {ImplementationGuide, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { ImplementationGuideInfoWidgetComponent } from 'term-web/implementation-guide/container/summary/widgets/implementation-guide-info-widget.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { ImplementationGuideVersionsWidgetComponent } from 'term-web/implementation-guide/container/summary/widgets/implementation-guide-versions-widget.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'implementation-guide-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, ImplementationGuideInfoWidgetComponent, PrivilegedDirective, MuiButtonModule, RouterLink, MuiIconModule, ImplementationGuideVersionsWidgetComponent, TranslatePipe]
})
export class ImplementationGuideSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private igService = inject(ImplementationGuideService);

  protected ig?: ImplementationGuide;
  protected versions?: ImplementationGuideVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(id);
  }

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.ig.id, 'versions', version, 'summary']);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.igService.load(id), this.igService.searchVersions(id, {limit: -1})]))
      .subscribe(([ig, versions]) => {
        this.ig = ig;
        this.versions = versions.data;
      });
  }
}
