import {Component, Input, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {MapSet, MapSetSearchParams, MapSetVersion} from 'term-web/resources/_lib';
import {MapSetService} from '../services/map-set-service';


@Component({
  selector: 'tw-map-set-list',
  templateUrl: 'map-set-list.component.html'
})
export class MapSetListComponent implements OnInit {
  @Input() public dev: boolean = false;

  public query = new MapSetSearchParams();
  public searchResult: SearchResult<MapSet> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private mapSetService: MapSetService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public search(): Observable<SearchResult<MapSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.versionsDecorated = true;
    q.textContains = this.searchInput || undefined;
    this.loading = true;
    return this.mapSetService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<MapSet>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public getVersionTranslateTokens = (version: MapSetVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.map-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.map-set.list.versions-expiration-date' : '',
      version.version ? 'web.map-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  public parseDomain(uri: string): string {
    return uri?.split('//')[1]?.split('/')[0];
  }

  public deleteMapSet(mapSetId: string): void {
    this.mapSetService.delete(mapSetId).subscribe(() => this.loadData());
  }
}
