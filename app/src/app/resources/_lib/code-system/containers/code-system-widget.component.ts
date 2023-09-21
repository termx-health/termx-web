import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {Subscription} from 'rxjs';
import {CodeSystem, CodeSystemLibService, CodeSystemSearchParams} from '../../code-system';

@Component({
  selector: 'tw-code-system-widget',
  templateUrl: 'code-system-widget.component.html'
})
export class CodeSystemWidgetComponent implements OnChanges {
  @Input() public spaceId: number;
  @Input() public packageId: number;
  @Input() public packageVersionId: number;

  private searchSub: Subscription;
  public searchResult = SearchResult.empty<CodeSystem>();
  public query = new CodeSystemSearchParams();
  public loading = false;

  public constructor(private codeSystemService: CodeSystemLibService) {
    this.query.limit = 50;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['spaceId'] || changes['packageId'] || changes['packageVersionId']) {
      this.search();
    }
  }

  private search(): void {
    this.searchSub?.unsubscribe();

    if (!this.spaceId && !this.packageId && !this.packageVersionId) {
      this.searchResult = SearchResult.empty();
      return;
    }

    this.loading = true;
    this.searchSub = this.codeSystemService.search(
      {
        ...this.query,
        spaceId: this.spaceId,
        packageId: this.packageId,
        packageVersionId: this.packageVersionId
      }).subscribe(resp => {
      this.searchResult = resp;
      this.loading = false;
    });
  }
}
