import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {Subscription} from 'rxjs';
import {ValueSet} from '../model/value-set';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {ValueSetLibService} from '../services/value-set-lib.service';

@Component({
  selector: 'twl-value-set-widget',
  templateUrl: 'value-set-widget.component.html'
})
export class ValueSetWidgetComponent implements OnChanges {
  @Input() public projectId: number;
  @Input() public packageId: number;
  @Input() public packageVersionId: number;

  private searchSub: Subscription;
  public searchResult = SearchResult.empty<ValueSet>();
  public query = new ValueSetSearchParams();
  public loading = false;

  public constructor(private valueSetService: ValueSetLibService) {
    this.query.limit = 50;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] || changes['packageId'] || changes['packageVersionId']) {
      this.search();
    }
  }

  private search(): void {
    this.searchSub?.unsubscribe();

    if (!this.projectId && !this.packageId && !this.packageVersionId) {
      this.searchResult = SearchResult.empty();
      return;
    }

    this.loading = true;
    this.searchSub = this.valueSetService.search(
      {
        ...this.query,
        projectId: this.projectId,
        packageId: this.packageId,
        packageVersionId: this.packageVersionId
      }).subscribe(resp => {
        this.searchResult = resp;
        this.loading = false;
    });
  }
}
