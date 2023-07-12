import {Component, Input} from '@angular/core';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {Router} from '@angular/router';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';

@Component({
  selector: 'tw-code-system-versions-widget',
  templateUrl: 'code-system-versions-widget.component.html'
})
export class CodeSystemVersionsWidgetComponent {
  @Input() public codeSystem: string;
  @Input() public versions: CodeSystemVersion[];

  public constructor(private router: Router, private codeSystemService: CodeSystemService) {}

  protected openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'summary']);
  }

  protected openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'concepts']);
  }

  protected deleteVersion(version: string): void {
    if (!version) {
      return;
    }
    this.codeSystemService.deleteCodeSystemVersion(this.codeSystem, version).subscribe(() => {
      this.versions = [...this.versions.filter(v => v.version !== version)];
    });
  }
}
