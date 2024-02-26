import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from 'app/src/environments/environment';
import {CodeSystemVersion} from 'term-web/resources/_lib';

class CodeSystemCompareResult {
  public added: string[];
  public deleted: string[];
  public changed: {
    code: string;
    diff: {
      old: {status: string, properties: string[], designations: string[]},
      mew: {status: string, properties: string[], designations: string[]}
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
  public sourceVersion: CodeSystemVersion;
  public targetCodeSystem: string;
  public targetVersion: CodeSystemVersion;
  public result: CodeSystemCompareResult;
  public loading: boolean;

  public constructor(
    public http: HttpClient,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    this.sourceCodeSystem = this.route.snapshot.paramMap.get('code-system');
    this.targetCodeSystem = this.route.snapshot.paramMap.get('code-system');
    const versionId = this.route.snapshot.paramMap.get('version');
    this.sourceVersion = versionId ? {id: Number(versionId)} : undefined;
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
    this.http.get<CodeSystemCompareResult>(`${environment.termxApi}/ts/code-systems/compare?source=${this.sourceVersion.id}&target=${this.targetVersion.id}`)
      .subscribe(r => this.result = r)
      .add(() => this.loading = false);
  }

  protected openFhirCompare(): void {
    if (!this.sourceVersion || !this.targetVersion) {
      return;
    }
    window.open(window.location.origin + environment.baseHref + 'fhir/CodeSystem/' + this.sourceCodeSystem + '/compare'
      + '?versionA=' + this.sourceVersion.version + '&versionB=' + this.targetVersion.version, '_blank');
  }

  public changeToHtml = (html: string): string => {

    // Escape possible HTML
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');

    // _spc ==> Single Space Char chr(32)
    html = html.replace(/ /g, '<span class="_m _spc">&middot;</span>');

    // _tab ==> Tab Stops chr(9)
    html = html.replace(/\t/g, '<span class="_m _tab">🠖</span>');

    // CarriageReturn chr(13)
    html = html.replace(/\r/g, '');

    // _brk ==> NewLine chr(10)
    html = html.replace(/\n/g, '<span class="_m _brk">¶</span><br>');

    // _np  ==> non-printable lower ASCII range chr(0)...chr(31) + personally known char(s)
    html = html.replace(/([\u0000-\u001F\u00AD])/g, '<span class="_m _np">$1</span>');

    // _uc  ==> Upper unicode range starting chr(255)
    html = html.replace(/([\u00FF-\u9999])/g, '<span class="_m _uc">$1</span>');

    return html;
  };
}
