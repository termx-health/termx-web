import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, LoadingManager, validateForm} from '@termx-health/core-util';
import {ImplementationGuideLibService, ImplementationGuideVersion, ImplementationGuideVersionResource} from 'term-web/implementation-guide/_lib';
import { MuiEditableTableModule, MuiSelectModule, MuiInputModule } from '@termx-health/ui';
import { TransformationDefinitionSelectComponent } from 'term-web/modeler/_lib/transformer/transformation-definition-select.component';
import { StructureDefinitionSelectComponent } from 'term-web/modeler/_lib/structure-definition/structure-definition-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { ValueSetVersionSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-version-select.component';
import { MapSetVersionSelectComponent } from 'term-web/resources/_lib/map-set/containers/map-set-version-select.component';

@Component({
    selector: 'tw-implementation-guide-resource-list',
    templateUrl: './implementation-guide-resource-list.component.html',
    imports: [
        FormsModule,
        MuiEditableTableModule,
        MuiSelectModule,
        TransformationDefinitionSelectComponent,
        StructureDefinitionSelectComponent,
        CodeSystemSearchComponent,
        ValueSetSearchComponent,
        MapSetSearchComponent,
        MuiInputModule,
        CodeSystemVersionSelectComponent,
        ValueSetVersionSelectComponent,
        MapSetVersionSelectComponent,
    ],
})
export class ImplementationGuideResourceListComponent implements OnChanges {
  private igService = inject(ImplementationGuideLibService);

  @Input() public ig: string;
  @Input() public igVersion: ImplementationGuideVersion;
  @Input() @BooleanInput() public editable: string | boolean;
  @Output() public resourcesChanged: EventEmitter<void> = new EventEmitter<void>();

  public resources: ImplementationGuideVersionResource[];

  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['ig'] || changes['igVersion']) && isDefined(this.ig) && isDefined(this.igVersion?.version)) {
      this.loadData(this.ig, this.igVersion.version);
    }
  }

  protected addRow(): void {
    this.resources = [...this.resources, {}];
    this.resourcesChanged.emit();
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  public loadData(ig: string, version: string): void {
    this.loader.wrap('load', this.igService.loadVersionResources(ig, version)).subscribe(r => this.resources = r);
  }
}
