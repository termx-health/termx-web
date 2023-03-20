import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {StructureDefinition, StructureDefinitionSearchParams} from '@terminology/core';
import {StructureDefinitionService} from '../../services/structure-definition.service';

@Component({
  templateUrl: 'structure-definition-list.component.html'
})
export class StructureDefinitionListComponent implements OnInit {
  public query = new StructureDefinitionSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<StructureDefinition> = SearchResult.empty();
  public loading = false;

  public constructor(private structureDefinitionService: StructureDefinitionService) {}

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<StructureDefinition>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.structureDefinitionService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public deleteStructureDefinition(id: number): void {
    this.structureDefinitionService.delete(id).subscribe(() => this.loadData());
  }
}
