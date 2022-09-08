import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {NamingSystem, NamingSystemSearchParams} from 'terminology-lib/resources';
import {NamingSystemService} from '../../services/naming-system-service';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'twa-naming-system-list',
  templateUrl: './naming-system-list.component.html',
})
export class NamingSystemListComponent implements OnInit {
  public searchResult: SearchResult<NamingSystem> = SearchResult.empty();
  public query = new NamingSystemSearchParams();
  public loading = false;

  public searchInput?: string;
  public searchUpdate = new Subject<string>();

  public constructor(
    private namingSystemService: NamingSystemService,
    private translateService: TranslateService
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
    q.lang = this.translateService.currentLang;
    q.textContains = this.searchInput;
    this.loading = true;
    return this.namingSystemService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

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
