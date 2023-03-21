import {Component, OnInit} from '@angular/core';
import {AssociationType, AssociationTypeSearchParams} from 'term-web/resources/_lib';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {AssociationTypeService} from '../../services/association-type.service';

@Component({
  selector: 'tw-association-type-list',
  templateUrl: './association-type-list.component.html',
})
export class AssociationTypeListComponent implements OnInit {
  public query = new AssociationTypeSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<AssociationType> = SearchResult.empty();
  public loading = false;

  public constructor(
    private associationTypeService: AssociationTypeService
  ) { }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }


  private search(): Observable<SearchResult<AssociationType>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.associationTypeService.search(q).pipe(finalize(() => {
      this.loading = false;
    }));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public haveDescriptions(searchResult: SearchResult<AssociationType>): boolean {
    return searchResult.data.filter(at => at.description).length > 0;
  }

  public deleteAssociationType(code: string): void {
    this.associationTypeService.delete(code).subscribe(() => this.loadData());
  }
}
