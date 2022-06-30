import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EntityProperty, EntityPropertySearchParams} from 'terminology-lib/resources';
import {CodeSystemService} from '../../../services/code-system.service';
import {SearchResult} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent implements OnChanges {
  @Input() public codeSystemId?: string | null;

  public searchResult: SearchResult<EntityProperty> = SearchResult.empty();
  public query = new EntityPropertySearchParams();
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]) {
      this.loadData();
    }
  }

  public deleteProperty(propertyId: number): void {
    this.codeSystemService.deleteEntityProperty(this.codeSystemId!, propertyId).subscribe(() => this.loadData());
  }

  public loadData(): void {
    this.query.codeSystem = this.codeSystemId!;
    this.loading = true;
    this.codeSystemService.searchProperties(this.codeSystemId!, this.query).subscribe(resp => this.searchResult = resp).add(() => this.loading = false);
  }
}
