import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {environment} from 'environments/environment';

class CodeSystemCompareResult {
  public added: string[];
  public deleted: string[];
  public changed: {
    code: string;
    diff: {
      old: {status: string, properties: string[]},
      mew: {status: string, properties: string[]}
    };
  }[];
}

@Component({
  templateUrl: './code-system-compare.component.html',
  styles: [`
    .red {
      background-color: #fbe9eb;
    }
    .green {
      background-color: #ecfdf0;
    }
  `]
})
export class CodeSystemCompareComponent implements OnInit {
  public sourceCodeSystem: string;
  public sourceVersion: number;
  public targetCodeSystem: string;
  public targetVersion: number;
  public result: CodeSystemCompareResult;
  public loading: boolean;

  public constructor(
    public http: HttpClient,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.sourceCodeSystem = this.route.snapshot.paramMap.get('code-system');
    this.targetCodeSystem = this.route.snapshot.paramMap.get('code-system');
    this.sourceVersion = Number(this.route.snapshot.paramMap.get('version'));
  }

  public onSourceChange(cs: string): void {
    this.targetCodeSystem = this.targetCodeSystem || cs;
  }

  public compare(): void {
    this.result = null;
    if (!this.sourceVersion || !this.targetVersion) {
      return;
    }
    this.loading = true;
    this.http.get<CodeSystemCompareResult>(`${environment.terminologyApi}/ts/code-systems/compare?source=${this.sourceVersion}&target=${this.targetVersion}`)
      .subscribe(r => this.result = r)
      .add(() => this.loading = false);
  }
}
