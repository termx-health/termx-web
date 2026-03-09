import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isDefined, LoadingManager, ApplyPipe, LocalDatePipe } from '@kodality-web/core-util';
import {ValueSet, ValueSetSnapshot, ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {AuthService} from 'term-web/core/auth';
import {forkJoin, map} from 'rxjs';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiCoreModule, MuiNoDataModule, MuiListModule, MuiDividerModule } from '@kodality-web/marina-ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { ValueSetInfoWidgetComponent } from 'term-web/resources/value-set/containers/summary/widgets/value-set-info-widget.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { ValueSetVersionsWidgetComponent } from 'term-web/resources/value-set/containers/summary/widgets/value-set-versions-widget.component';
import { AsyncPipe } from '@angular/common';
import { ResourceTasksWidgetComponent as ResourceTasksWidgetComponent_1 } from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceRelatedArtifactWidgetComponent } from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'value-set-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, ValueSetInfoWidgetComponent, PrivilegedDirective, MuiButtonModule, RouterLink, MuiIconModule, ValueSetVersionsWidgetComponent, MuiCoreModule, ResourceTasksWidgetComponent_1, ResourceRelatedArtifactWidgetComponent, MuiNoDataModule, MuiListModule, MuiDividerModule, ResourceTaskModalComponent, AsyncPipe, TranslatePipe, ApplyPipe, LocalDatePipe]
})
export class ValueSetSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueSetService = inject(ValueSetService);
  private authService = inject(AuthService);

  protected valueSet?: ValueSet;
  protected versions?: ValueSetVersion[];
  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks?: boolean = true;

  protected isAuthenticated = this.authService.isAuthenticated.pipe(
    map(isAuth => isAuth)
  );

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(id);
  }

  protected mapVersionToSnapshot = (versions: ValueSetVersion[]): ValueSetSnapshot[] => {
    return versions?.map(v => v.snapshot).filter(s => isDefined(s));
  };

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet.id, 'versions', version, 'summary']);
  }

  public openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet.id, 'versions', version, 'concepts']);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(id), this.valueSetService.searchVersions(id, {decorated: true, limit: -1})]))
      .subscribe(([vs, versions]) => {
        this.valueSet = vs;
        this.versions = versions.data;
      });
  }
}
