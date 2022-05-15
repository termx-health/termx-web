import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {EntityProperty} from 'terminology-lib/resources';


@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent implements OnChanges {
  @Input() public codeSystemId?: string;

  public properties: EntityProperty[] = [];
  public loading = false;

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue) {
      this.loadProperties();
    }
  }

  private loadProperties(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.loading = true;
    this.codeSystemService.loadProperties(this.codeSystemId)
      .subscribe(properties => this.properties = properties)
      .add(() => this.loading = false);
  }
}
