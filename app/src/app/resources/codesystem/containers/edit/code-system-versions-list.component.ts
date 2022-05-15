import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {CodeSystemVersion} from 'terminology-lib/resources';


@Component({
  selector: 'twa-code-system-versions-list',
  templateUrl: 'code-system-versions-list.component.html',
})
export class CodeSystemVersionsListComponent implements OnChanges {
  @Input() public codeSystemId?: string;

  public versions: CodeSystemVersion[] = [];
  public loading = false;

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loadVersions();
    }
  }

  private loadVersions(): void {
    if (!this.codeSystemId) {
      return
    }
    this.loading = true;
    this.codeSystemService.loadVersions(this.codeSystemId)
      .subscribe(versions => this.versions = versions)
      .add(() => this.loading = false);
  }
}
