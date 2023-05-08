import {Component, OnInit} from '@angular/core';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Template, TemplateSearchParams} from 'term-web/thesaurus/_lib';
import {TemplateService} from '../../services/template.service';

@Component({
  templateUrl: 'template-list.component.html'
})
export class TemplateListComponent implements OnInit {
  public query = new TemplateSearchParams();
  public searchResult: SearchResult<Template> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(private templateService: TemplateService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Template>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.templateService.searchTemplates(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Template>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public deleteTemplate(id: number): void {
    this.templateService.deleteTemplate(id).subscribe(() => this.loadData());
  }
}
