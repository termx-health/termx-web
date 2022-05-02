import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemSearchParams} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public searchResult?: SearchResult<CodeSystem> = new SearchResult<CodeSystem>();
  public query: any = new CodeSystemSearchParams(); //fixme!
  public loading?: boolean;

  public constructor(private codeSystemService: CodeSystemService) {}

  public ngOnInit(): void {
    this.query.limit = 2;
    this.loadData();
  }


  public loadData(): void {
    this.loading = true;
    this.codeSystemService.search(this.query).subscribe(r => this.searchResult = r).add(() => this.loading = false);
  }

}
