import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {Template, TemplateSearchParams} from 'term-web/thesaurus/_lib';
import {TemplateService} from '../../services/template.service';

@Component({
  templateUrl: 'template-list.component.html'
})
export class TemplateListComponent implements OnInit {
  public query = new TemplateSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<Template> = SearchResult.empty();
  public loading = false;

  public constructor(private templateService: TemplateService) {}

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<Template>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.templateService.searchTemplates(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public deleteTemplate(id: number): void {
    this.templateService.deleteTemplate(id).subscribe(() => this.loadData());
  }
}
