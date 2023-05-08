import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {NamingSystem, NamingSystemSearchParams} from 'term-web/resources/_lib';
import {NamingSystemService} from '../../services/naming-system-service';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'tw-naming-system-list',
  templateUrl: './naming-system-list.component.html',
})
export class NamingSystemListComponent implements OnInit {
  public query = new NamingSystemSearchParams();
  public searchResult: SearchResult<NamingSystem> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private namingSystemService: NamingSystemService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<NamingSystem>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.textContains = this.searchInput;
    this.loading = true;
    return this.namingSystemService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<NamingSystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public retire(ns: NamingSystem): void {
    this.loading = true;
    this.namingSystemService.retire(ns.id!).subscribe(() => ns.status = 'retired').add(() => this.loading = false);
  }

  public activate(ns: NamingSystem): void {
    this.loading = true;
    this.namingSystemService.activate(ns.id!).subscribe(() => ns.status = 'active').add(() => this.loading = false);
  }

  public deleteNamingSystem(namingSystemId: string): void {
    this.namingSystemService.delete(namingSystemId).subscribe(() => this.loadData());
  }
}
