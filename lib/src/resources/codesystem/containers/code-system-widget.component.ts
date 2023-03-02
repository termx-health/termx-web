import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {Subscription} from 'rxjs';
import {CodeSystem} from '../model/code-system';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {CodeSystemLibService} from '../services/code-system-lib.service';

@Component({
  selector: 'twl-code-system-widget',
  templateUrl: 'code-system-widget.component.html'
})
export class CodeSystemWidgetComponent implements OnChanges {
  @Input() public projectId: number;
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
    this.searchSub = this.codeSystemService.search(
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
