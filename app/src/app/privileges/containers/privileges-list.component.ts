import {Component, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {Privilege, PrivilegeSearchParams} from 'terminology-lib/privileges';
import {PrivilegeService} from '../services/privilege.service';

@Component({
  templateUrl: './privileges-list.component.html',
})
export class PrivilegesListComponent implements OnInit {
  public query = new PrivilegeSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<Privilege> = SearchResult.empty();
  public loading = false;

  public constructor(
    private privilegeService: PrivilegeService
  ) { }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<Privilege>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.privilegeService.search(q).pipe(finalize(() => this.loading = false));
  }

  public deletePrivilege(id: number): void {
    this.privilegeService.delete(id).subscribe(() => this.loadData());
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}