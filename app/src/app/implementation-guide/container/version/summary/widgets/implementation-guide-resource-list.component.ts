import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ImplementationGuideLibService, ImplementationGuideVersion, ImplementationGuideVersionResource} from 'term-web/implementation-guide/_lib';

@Component({
  selector: 'tw-implementation-guide-resource-list',
  templateUrl: './implementation-guide-resource-list.component.html',
})
export class ImplementationGuideResourceListComponent implements OnChanges {
  @Input() public ig: string;
  @Input() public igVersion: ImplementationGuideVersion;
  @Input() @BooleanInput() public editable: string | boolean;
  @Output() public resourcesChanged: EventEmitter<void> = new EventEmitter<void>();

  public resources: ImplementationGuideVersionResource[];

  protected loader = new LoadingManager();

  public constructor(private igService: ImplementationGuideLibService) {}

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
