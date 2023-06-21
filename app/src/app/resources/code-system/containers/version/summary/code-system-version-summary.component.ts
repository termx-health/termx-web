import {Component, OnInit} from '@angular/core';
import {CodeSystem, CodeSystemVersion} from 'app/src/app/resources/_lib';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';

@Component({
  templateUrl: 'code-system-version-summary.component.html'
})
export class CodeSystemVersionSummaryComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected codeSystemVersion?: CodeSystemVersion;
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(codeSystem: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(codeSystem), this.codeSystemService.loadVersion(codeSystem, versionCode)])
    ).subscribe(([cs, csv]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = csv;
    });
  }
}
