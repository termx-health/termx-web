import {Component, Input} from '@angular/core';
import {CodeSystemVersion} from 'app/src/app/resources/_lib';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-code-system-versions-widget',
  templateUrl: 'code-system-versions-widget.component.html'
})
export class CodeSystemVersionsWidgetComponent {
  @Input() public codeSystem: string;
  @Input() public versions: CodeSystemVersion[];

  public constructor(private router: Router) {}

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'summary']);
  }

  public openVersionConcepts(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem, 'versions', version, 'concepts']);
  }
}
