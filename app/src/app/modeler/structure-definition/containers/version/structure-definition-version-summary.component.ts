import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {LoadingManager, LocalDatePipe} from '@kodality-web/core-util';
import {MuiCardModule, MuiFormModule, MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule, MuiButtonModule, MarinPageLayoutModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {forkJoin} from 'rxjs';
import {StructureDefinition, StructureDefinitionVersion} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {ResourceRelatedArtifactWidgetComponent} from 'term-web/resources/resource/components/resource-related-artifact-widget.component';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import {CopyContainerComponent} from 'term-web/core/ui/components/copy-container/copy-container.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    templateUrl: 'structure-definition-version-summary.component.html',
    imports: [
      ResourceContextComponent, MuiCardModule, MuiFormModule, MuiNoDataModule, MuiIconModule, MuiDividerModule, MuiCoreModule, MuiButtonModule,
      MarinPageLayoutModule, MarinaUtilModule, RouterLink,
      ResourceRelatedArtifactWidgetComponent, PrivilegeContextDirective, StatusTagComponent, CopyContainerComponent, LocalDatePipe, TranslatePipe
    ]
})
export class StructureDefinitionVersionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private structureDefinitionService = inject(StructureDefinitionService);

  protected structureDefinition?: StructureDefinition;
  protected versions?: StructureDefinitionVersion[];
  protected version?: StructureDefinitionVersion;
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      const versionCode = pm.get('versionCode');
      this.loadData(id, versionCode);
    });
  }

  protected loadData(id: number, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.structureDefinitionService.load(id),
        this.structureDefinitionService.loadVersion(id, versionCode),
        this.structureDefinitionService.listVersions(id)
      ])
    ).subscribe(([sd, version, versions]) => {
      this.structureDefinition = sd;
      this.version = version;
      this.versions = versions;
    });
  }
}
