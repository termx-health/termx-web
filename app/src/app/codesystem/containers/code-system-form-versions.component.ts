import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeSystemService} from '../services/code-system.service';
import {CodeSystemVersion} from 'terminology-lib/codesystem/services/code-system-version';


@Component({
  selector: 'twa-code-system-form-versions',
  templateUrl: './code-system-form-versions.component.html',
})
export class CodeSystemFormVersionsComponent implements OnChanges {
  @Input() public codeSystemId?: string;

  public loading?: boolean;
  public versions?: CodeSystemVersion[];

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loading = true;
      this.codeSystemService.loadVersions(changes["codeSystemId"].currentValue)
        .subscribe(versions => this.versions = versions)
        .add(() => this.loading = false);
    }
  }

}
