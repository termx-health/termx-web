import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingManager, ToStringPipe } from '@termx-health/core-util';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiCoreModule } from '@termx-health/ui';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';

import { CodeSystemVersionInfoWidgetComponent } from 'term-web/resources/code-system/containers/version/summary/widgets/code-system-version-info-widget.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { ResourceTasksWidgetComponent as ResourceTasksWidgetComponent_1 } from 'term-web/resources/resource/components/resource-tasks-widget.component';
import { ResourceTaskModalComponent } from 'term-web/resources/resource/components/resource-task-modal-component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'code-system-version-summary.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule, MuiButtonModule, RouterLink, MuiIconModule, CodeSystemVersionInfoWidgetComponent, PrivilegedDirective, MuiCoreModule, ResourceTasksWidgetComponent_1, ResourceTaskModalComponent, TranslatePipe, ToStringPipe]
})
export class CodeSystemVersionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private codeSystemService = inject(CodeSystemService);

  protected codeSystem?: CodeSystem;
  protected codeSystemVersion?: CodeSystemVersion;
  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks?: boolean = true;

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  protected loadData(codeSystem: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(codeSystem), this.codeSystemService.loadVersion(codeSystem, versionCode)])
    ).subscribe(([cs, csv]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = csv;
    });
  }
}
