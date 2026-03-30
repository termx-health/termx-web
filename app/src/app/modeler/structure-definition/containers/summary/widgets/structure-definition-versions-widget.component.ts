import {Component, EventEmitter, Input, Output, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {LoadingManager, validateForm, ApplyPipe, LocalDatePipe, SortPipe} from '@termx-health/core-util';
import {MuiNoDataModule, MuiListModule, MuiDropdownModule, MuiIconModule, MuiModalModule, MuiFormModule, MuiButtonModule, MuiDividerModule, MarinPageLayoutModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslatePipe} from '@ngx-translate/core';
import {StructureDefinitionVersion} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import {SemanticVersionSelectComponent} from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';

@Component({
    selector: 'tw-structure-definition-versions-widget',
    templateUrl: 'structure-definition-versions-widget.component.html',
    imports: [
      MuiListModule, MuiNoDataModule, MuiDropdownModule, MuiIconModule, MuiModalModule, MuiFormModule,
      MuiButtonModule, MuiDividerModule, MarinPageLayoutModule, FormsModule,
      TranslatePipe, StatusTagComponent, SemanticVersionSelectComponent, PrivilegedDirective, ApplyPipe,
      LocalDatePipe, SortPipe, MarinaUtilModule
    ]
})
export class StructureDefinitionVersionsWidgetComponent {
  private structureDefinitionService = inject(StructureDefinitionService);

  @Input() public structureDefinitionId?: number;
  @Input() public versions?: StructureDefinitionVersion[];
  @Output() public versionSelected = new EventEmitter<string>();
  @Output() public versionsChanged = new EventEmitter<void>();

  protected loader = new LoadingManager();
  protected duplicateModalData: {visible?: boolean, version?: string, targetVersion?: string} = {};
  @ViewChild("duplicateModalForm") public duplicateModalForm?: NgForm;

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    this.loader.wrap('duplicate',
      this.structureDefinitionService.duplicateVersion(this.structureDefinitionId, this.duplicateModalData.version, this.duplicateModalData.targetVersion)
    ).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected getVersions = (versions: StructureDefinitionVersion[]): string[] => versions?.map(v => v.version) || [];
}
