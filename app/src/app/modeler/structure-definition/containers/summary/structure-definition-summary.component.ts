import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {MarinPageLayoutModule, MuiButtonModule, MuiCardModule, MuiDividerModule, MuiFormModule, MuiIconModule, MuiSelectModule} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {forkJoin} from 'rxjs';
import {StructureDefinition, StructureDefinitionVersion} from 'term-web/modeler/_lib';
import {StructureDefinitionTreeComponent} from 'term-web/modeler/_lib/structure-definition/structure-definition-tree.component';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {ResourceRelatedArtifactWidgetComponent} from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import {ResourceTaskModalComponent} from 'term-web/resources/resource/components/resource-task-modal-component';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {StructureDefinitionInfoWidgetComponent} from './widgets/structure-definition-info-widget.component';
import {StructureDefinitionVersionsWidgetComponent} from './widgets/structure-definition-versions-widget.component';

@Component({
    templateUrl: 'structure-definition-summary.component.html',
    imports: [
      ResourceContextComponent, MarinPageLayoutModule, PrivilegeContextDirective, MuiFormModule, MuiCardModule,
      MuiButtonModule, RouterLink, MuiIconModule, PrivilegedDirective, MuiDividerModule,
      ResourceTasksWidgetComponent, ResourceRelatedArtifactWidgetComponent, ResourceTaskModalComponent, TranslatePipe,
      StructureDefinitionInfoWidgetComponent, StructureDefinitionVersionsWidgetComponent,
      StructureDefinitionTreeComponent, MuiSelectModule, FormsModule
    ]
})
export class StructureDefinitionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private structureDefinitionService = inject(StructureDefinitionService);

  protected structureDefinition?: StructureDefinition;
  protected versions?: StructureDefinitionVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected selectedViewerVersion?: string;
  protected viewerContent?: string;
  protected loader = new LoadingManager();

  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;
  @ViewChild('relatedArtifactsWidget') public relatedArtifactsWidget?: ResourceRelatedArtifactWidgetComponent;

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      this.loadData(id);
    });
  }

  public openVersionSummary(version: string): void {
    this.router.navigate(['/modeler/structure-definitions', this.structureDefinition.id, 'versions', version, 'summary']);
  }

  protected onViewerVersionChange(version: string): void {
    this.selectedViewerVersion = version;
    this.loadViewerContent(version);
  }

  protected loadData(id: number): void {
    this.loader.wrap('load',
      forkJoin([this.structureDefinitionService.load(id), this.structureDefinitionService.listVersions(id)]))
      .subscribe(([sd, versions]) => {
        this.structureDefinition = sd;
        this.versions = versions;
        if (versions?.length) {
          const latest = versions[versions.length - 1];
          this.selectedViewerVersion = latest.version;
          this.loadViewerContent(latest.version);
        }
      });
  }

  protected recalculateReferences(): void {
    this.loader.wrap('recalculate',
      this.structureDefinitionService.recalculateReferences(this.structureDefinition.id))
      .subscribe(() => {
        this.relatedArtifactsWidget?.loadArtifacts();
      });
  }

  private loadViewerContent(version: string): void {
    this.loader.wrap('viewer',
      this.structureDefinitionService.loadVersion(this.structureDefinition.id, version))
      .subscribe(v => {
        this.viewerContent = v.content;
      });
  }
}
