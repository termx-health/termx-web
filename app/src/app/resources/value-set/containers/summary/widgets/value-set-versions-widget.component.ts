import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion, ValueSetVersion} from 'app/src/app/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';

@Component({
  selector: 'tw-value-set-versions-widget',
  templateUrl: 'value-set-versions-widget.component.html'
})
export class ValueSetVersionsWidgetComponent {
  @Input() public valueSet: string;
  @Input() public versions: ValueSetVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  protected loader = new LoadingManager();

  protected duplicateModalData: {
    visible?: boolean,
    version?: string,
    targetVersion?: string
  } = {};
  @ViewChild("duplicateModalForm") public duplicateModalForm?: NgForm;

  public constructor(private router: Router, private valueSetService: ValueSetService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/value-sets', this.valueSet, 'versions', version, 'summary']);
  }

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    const version = this.duplicateModalData.version;
    const request = {valueSet: this.valueSet, version: this.duplicateModalData.targetVersion};
    this.loader.wrap('duplicate', this.valueSetService.duplicateValueSetVersion(this.valueSet, version, request)).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.valueSetService.deleteValueSetVersion(this.valueSet, version).subscribe(() => {
      this.versions = [...this.versions.filter(v => v.version !== version)];
    });
  }

  protected getVersions = (versions: CodeSystemVersion[]): string[] => versions.map(v => v.version);

}
