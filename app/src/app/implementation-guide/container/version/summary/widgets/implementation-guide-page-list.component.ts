import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ImplementationGuideLibService, ImplementationGuideVersion, ImplementationGuideVersionPage} from 'term-web/implementation-guide/_lib';
import { MuiEditableTableModule, MuiInputModule, MuiSelectModule } from '@kodality-web/marina-ui';
import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { PageContentSelectComponent } from 'term-web/wiki/_lib/page/components/page-content-select.component';
import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    selector: 'tw-implementation-guide-page-list',
    templateUrl: './implementation-guide-page-list.component.html',
    imports: [
        FormsModule,
        MuiEditableTableModule,
        SpaceSelectComponent,
        PageContentSelectComponent,
        MuiInputModule,
        MuiSelectModule,
        MarinaUtilModule,
    ],
})
export class ImplementationGuidePageListComponent implements OnChanges {
  private igService = inject(ImplementationGuideLibService);

  @Input() public ig: string;
  @Input() public igVersion: ImplementationGuideVersion;
  @Input() @BooleanInput() public editable: string | boolean;
  @Output() public pagesChanged: EventEmitter<void> = new EventEmitter<void>();

  public pages: ImplementationGuideVersionPage[];

  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['ig'] || changes['igVersion']) && isDefined(this.ig) && isDefined(this.igVersion?.version)) {
      this.loadData(this.ig, this.igVersion.version);
    }
  }

  protected addRow(): void {
    this.pages = [...this.pages, {}];
    this.pagesChanged.emit();
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  public loadData(ig: string, version: string): void {
    this.loader.wrap('load', this.igService.loadVersionPages(ig, version)).subscribe(r => this.pages = r);
  }
}
