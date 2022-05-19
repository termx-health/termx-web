import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, debounceTime, distinctUntilChanged, finalize, Observable, switchMap} from 'rxjs';
import {MapSet, MapSetSearchParams, MapSetVersion} from 'terminology-lib/resources/mapset';
import {MapSetService} from '../../services/map-set-service';


@Component({
  selector: 'twa-map-set-list',
  templateUrl: 'map-set-list.component.html'
})
export class MapSetListComponent implements OnInit {
  public searchResult = new SearchResult<MapSet>();
  public query = new MapSetSearchParams();
  public loading: boolean = false;
  public searchInput: string = "";
  public searchUpdate = new BehaviorSubject<string>("");

  public constructor(
    private mapSetService: MapSetService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  public search(): Observable<SearchResult<MapSet>> {
    const q = copyDeep(this.query);
    q.versionsDecorated = true;
    q.textContains = this.searchInput || undefined;
    this.loading = true;
    return this.mapSetService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

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

}
