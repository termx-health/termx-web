import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';

@Component({
  selector: 'tw-code-system-versions-widget',
  templateUrl: 'code-system-versions-widget.component.html'
})
export class CodeSystemVersionsWidgetComponent {
  @Input() public codeSystem: string;
  @Input() public versions: CodeSystemVersion[];
  @Output() public versionsChanged: EventEmitter<void> = new EventEmitter();

  protected loader = new LoadingManager();

  protected duplicateModalData: {
    visible?: boolean,
    version?: string,
    targetVersion?: string
  } = {};
  @ViewChild("duplicateModalForm") public duplicateModalForm?: NgForm;

  public constructor(private router: Router, private codeSystemService: CodeSystemService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'summary']);
  }

  protected openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'concepts']);
  }

  protected duplicateVersion(): void {
    if (!validateForm(this.duplicateModalForm)) {
      return;
    }
    const version = this.duplicateModalData.version;
    const request = {codeSystem: this.codeSystem, version: this.duplicateModalData.targetVersion};
    this.loader.wrap('duplicate', this.codeSystemService.duplicateCodeSystemVersion(this.codeSystem, version, request)).subscribe(() => {
      this.duplicateModalData = {};
      this.versionsChanged.emit();
    });
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.codeSystemService.deleteCodeSystemVersion(this.codeSystem, version).subscribe(() => {
      this.versionsChanged.emit();
    });
  }

  protected getVersions = (versions: CodeSystemVersion[]): string[] => versions.map(v => v.version);
}
