import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Privilege, PrivilegeResourceActions, PrivilegeSearchParams} from 'term-web/privileges/_lib';
import {PrivilegeService} from '../services/privilege.service';

@Component({
  templateUrl: './privileges-list.component.html',
})
export class PrivilegesListComponent implements OnInit {
  public query = new PrivilegeSearchParams();
  public searchResult: SearchResult<Privilege> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private privilegeService: PrivilegeService
  ) { }

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Privilege>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.privilegeService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Privilege>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public toPlainString = (actions: PrivilegeResourceActions): string => {
    if (!actions) {
      return '';
    }
    return Object.keys(actions).filter(key => !!(actions as any)[key]).join(', ');
  };
}
