import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingManager, FilterPipe } from '@termx-health/core-util';
import {CodeSystem, CodeSystemArtifactImpact, CodeSystemVersion} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {CodeSystemUnlinkedConceptsComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiDividerModule, MuiDropdownModule, MuiCoreModule, MuiListModule } from '@termx-health/ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { CodeSystemInfoWidgetComponent } from 'term-web/resources/code-system/containers/summary/widgets/code-system-info-widget.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { CodeSystemVersionsWidgetComponent } from 'term-web/resources/code-system/containers/summary/widgets/code-system-versions-widget.component';

import { CodeSystemUnlinkedConceptsComponent as CodeSystemUnlinkedConceptsComponent_1 } from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';
import { ResourceTasksWidgetComponent as ResourceTasksWidgetComponent_1 } from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceRelatedArtifactWidgetComponent } from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'code-system-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, CodeSystemInfoWidgetComponent, MuiButtonModule, RouterLink, MuiIconModule, PrivilegedDirective, MuiDividerModule, CodeSystemVersionsWidgetComponent, MuiDropdownModule, MuiCoreModule, MuiListModule, CodeSystemUnlinkedConceptsComponent_1, ResourceTasksWidgetComponent_1, ResourceRelatedArtifactWidgetComponent, ResourceTaskModalComponent, TranslatePipe, FilterPipe]
})
export class CodeSystemSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codeSystemService = inject(CodeSystemService);

  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected valueSetImpacts: CodeSystemArtifactImpact[] = [];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  @ViewChild(CodeSystemUnlinkedConceptsComponent) public unlinkedConceptsComponent?: CodeSystemUnlinkedConceptsComponent;
  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id= pm.get('id');
      this.loadData(id);
    });
  }

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem.id, 'versions', version, 'summary']);
  }

  public link(codeSystemVersion: string, entityVersionIds: number[]): void {
    this.loader.wrap('link', this.codeSystemService.linkEntityVersions(this.codeSystem.id, codeSystemVersion, entityVersionIds))
      .subscribe(() => {
        this.codeSystemService.searchVersions(this.codeSystem.id, {limit: -1}).subscribe(versions => this.versions = versions.data);
        this.unlinkedConceptsComponent.loadUnlinkedConcepts();
      });
  }

  protected filterDraftVersions = (v: CodeSystemVersion): boolean => {
    return v.status === 'draft';
  };

  protected reviewValueSetImpact(impact: CodeSystemArtifactImpact): void {
    this.router.navigate(['/resources/value-sets', impact.artifactId, 'versions', impact.artifactVersion, 'summary']);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(id), this.codeSystemService.searchVersions(id, {limit: -1}), this.codeSystemService.loadValueSetImpacts(id)]))
      .subscribe(([cs, versions, impacts]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
        this.valueSetImpacts = impacts;
      });
  }
}
