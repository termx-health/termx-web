import {Component, OnInit} from '@angular/core';
import {SearchResult, sort} from '@kodality-web/core-util';
import {CodeSystem} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public searchResult?: SearchResult<CodeSystem> = new SearchResult<CodeSystem>();
  public loading?: boolean;

  constructor(private codeSystemService: CodeSystemService) {}

  public ngOnInit(): void {
    this.loading = true;
    this.codeSystemService.search().subscribe(r => this.searchResult = r).add(() => this.loading = false);
  }

  public sortTableData = (cs: CodeSystem[]) => sort(cs, 'id');
}
