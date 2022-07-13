import {Component, Input} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';
import {CodeSystemService} from '../../../services/code-system.service';
import {BooleanInput} from '@kodality-web/core-util';

@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string | null;
  @Input() public properties: EntityProperty[] = [];
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService
  ) {}

  public loadProperties(): void {
    this.loading = true;
    this.codeSystemService.searchProperties(this.codeSystemId!, {limit: -1})
      .subscribe(properties => this.properties = properties.data)
      .add(() => this.loading = false);
  }

  public deleteProperty(propertyId: number): void {
    this.codeSystemService.deleteEntityProperty(this.codeSystemId!, propertyId).subscribe(() => this.loadProperties());
  }
}
