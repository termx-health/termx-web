import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {MapSet, MapSetSearchParams, MapSetVersion} from 'app/src/app/resources/_lib';
import {MapSetService} from '../../services/map-set-service';
import {environment} from 'environments/environment';


@Component({
  templateUrl: 'map-set-list.component.html'
})
export class MapSetListComponent implements OnInit {
  protected readonly STORE_KEY = 'map-set-list';

  public query = new MapSetSearchParams();
  public searchResult: SearchResult<MapSet> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private mapSetService: MapSetService,
    private translateService: TranslateService,
    private stateStore: ComponentStateStore,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<MapSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.versionsDecorated = true;
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.mapSetService.search(q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<MapSet>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected openFhir(id: string): void {
    window.open(environment.termxApi + '/fhir/ConceptMap/' + id, '_blank');
  }

  protected deleteMapSet(mapSetId: string): void {
    this.mapSetService.delete(mapSetId).subscribe(() => this.loadData());
  }

  protected findLastVersion = (versions: MapSetVersion[]): MapSetVersion => {
    return  versions?.filter(v => ['draft', 'active'].includes(v.status!))
      .sort((a, b) => new Date(a.created!) > new Date(b.created!) ? -1 : new Date(a.created!) > new Date(b.created!) ? 1 : 0)?.[0];
  };
}
