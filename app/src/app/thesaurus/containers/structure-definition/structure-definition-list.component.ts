import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {StructureDefinition, StructureDefinitionSearchParams} from 'term-web/thesaurus/_lib';
import {StructureDefinitionService} from '../../services/structure-definition.service';

@Component({
  templateUrl: 'structure-definition-list.component.html'
})
export class StructureDefinitionListComponent implements OnInit {
  public query = new StructureDefinitionSearchParams();
  public searchResult: SearchResult<StructureDefinition> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(private structureDefinitionService: StructureDefinitionService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<StructureDefinition>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.structureDefinitionService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<StructureDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public deleteStructureDefinition(id: number): void {
    this.structureDefinitionService.delete(id).subscribe(() => this.loadData());
  }
}
