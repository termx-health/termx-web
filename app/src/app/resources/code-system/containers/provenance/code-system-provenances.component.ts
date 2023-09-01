import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';

@Component({
  templateUrl: 'code-system-provenances.component.html'
})
export class CodeSystemProvenancesComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(id), this.codeSystemService.searchVersions(id, {limit: -1})]))
      .subscribe(([cs, versions]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
      });
  }
}
