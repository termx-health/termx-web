import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {NamingSystemSearchParams} from 'terminology-lib/resources/namingsystem/model/naming-system-search-params';
import {NamingSystem} from 'terminology-lib/resources/namingsystem/model/naming-system';
import {NamingSystemLibService} from 'terminology-lib/resources/namingsystem/services/naming-system-lib.service';

@Component({
  selector: 'twa-naming-system-list',
  templateUrl: './naming-system-list.component.html',
})
export class NamingSystemListComponent implements OnInit {
  public searchResult = new SearchResult<NamingSystem>();
  public query = new NamingSystemSearchParams();
  public loading = false;

  public searchInput?: string;
  public searchUpdate = new Subject<string>();

  public constructor(
    private namingSystemLibService: NamingSystemLibService,
  ) {}

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }


  private search(): Observable<SearchResult<NamingSystem>> {
    const q = copyDeep(this.query);
    q.name = this.searchInput;
    q.codeSystem = this.searchInput;
    this.loading = true;
    return this.namingSystemLibService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
