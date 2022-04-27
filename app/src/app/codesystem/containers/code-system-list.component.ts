import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public codesystems?: SearchResult<CodeSystem>;
  public loading: boolean = false;

  constructor(
    private codeSystemService: CodeSystemService,
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.codeSystemService.search({}).subscribe(r => this.codesystems = r).add(() => this.loading = false);
  }
}
