import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {
  ImplementationGuideLibService,
  ImplementationGuideVersion,
  ImplementationGuideVersionPage} from 'term-web/implementation-guide/_lib';

@Component({
  selector: 'tw-implementation-guide-page-list',
  templateUrl: './implementation-guide-page-list.component.html',
})
export class ImplementationGuidePageListComponent implements OnChanges {
  @Input() public ig: string;
  @Input() public igVersion: ImplementationGuideVersion;
  @Input() @BooleanInput() public editable: string | boolean;
  @Output() public pagesChanged: EventEmitter<void> = new EventEmitter<void>();

  public pages: ImplementationGuideVersionPage[];

  protected loader = new LoadingManager();

  public constructor(private igService: ImplementationGuideLibService) {}

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
