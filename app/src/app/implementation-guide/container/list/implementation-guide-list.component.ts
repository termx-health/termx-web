import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {ImplementationGuide, ImplementationGuideSearchParams, ImplementationGuideVersion} from 'app/src/app/implementation-guide/_lib';
import {ImplementationGuideService} from 'app/src/app/implementation-guide/services/implementation-guide.service';


@Component({
  templateUrl: 'implementation-guide-list.component.html',
})
export class ImplementationGuideListComponent implements OnInit {
  protected readonly STORE_KEY = 'ig-list';

  public query = new ImplementationGuideSearchParams();
  public searchResult: SearchResult<ImplementationGuide> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

  public constructor(
    private igService: ImplementationGuideService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public search(): Observable<SearchResult<ImplementationGuide>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('query', this.igService.search(q));
  }

  public onSearch = (): Observable<SearchResult<ImplementationGuide>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected findLastVersion = (versions: ImplementationGuideVersion[]): ImplementationGuideVersion => {
    return null;
  };

  public delete(id: string): void {
    this.igService.delete(id).subscribe(() => this.loadData());
  }

  public openFhir(id: string): void {
    window.open(window.location.origin + '/fhir/ImplementationGuide/' + id, '_blank');
  }
}
