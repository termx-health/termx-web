import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CodeSystemService} from '../services/code-system.service';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem} from '../services/code-system';

@Component({
  templateUrl: './code-system-list.component.html'
})

export class CodeSystemListComponent implements OnInit {
  public codesystems: SearchResult<CodeSystem>;
  public loading: boolean;

  constructor(
    private codeSystemService: CodeSystemService,
    private router: Router,
    private translateService: TranslateService) {}

  public ngOnInit(): void {
    this.loading = true;
    this.codeSystemService.search({}).subscribe(r => this.codesystems = r).add(() => this.loading = false);
  }
}
