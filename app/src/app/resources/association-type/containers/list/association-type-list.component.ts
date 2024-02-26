import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {AssociationType, AssociationTypeSearchParams} from 'term-web/resources/_lib';
import {AssociationTypeService} from '../../services/association-type.service';

@Component({
  selector: 'tw-association-type-list',
  templateUrl: './association-type-list.component.html',
})
export class AssociationTypeListComponent implements OnInit {
  public query = new AssociationTypeSearchParams();
  public searchResult: SearchResult<AssociationType> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private associationTypeService: AssociationTypeService
  ) { }

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<AssociationType>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.associationTypeService.search(q).pipe(finalize(() => {
      this.loading = false;
    }));
  }

  public onSearch = (): Observable<SearchResult<AssociationType>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public haveDescriptions(searchResult: SearchResult<AssociationType>): boolean {
    return searchResult.data.filter(at => at.description).length > 0;
  }

  public deleteAssociationType(code: string): void {
    this.associationTypeService.delete(code).subscribe(() => this.loadData());
  }
}
