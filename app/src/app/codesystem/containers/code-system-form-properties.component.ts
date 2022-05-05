import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeSystemService} from '../services/code-system.service';
import {EntityProperty} from 'lib/src/codesystem/services/entity-property';

@Component({
  selector: 'twa-code-system-form-properties',
  templateUrl: './code-system-form-properties.component.html',
})
export class CodeSystemFormPropertiesComponent implements OnChanges {
  public loading?: boolean;
  public properties?: EntityProperty[];

  @Input() public codeSystemId?: string;

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loading = true;
      this.codeSystemService.loadProperties(changes["codeSystemId"].currentValue)
        .subscribe(properties => this.properties = properties)
        .add(() => this.loading = false);
    }
  }
}
