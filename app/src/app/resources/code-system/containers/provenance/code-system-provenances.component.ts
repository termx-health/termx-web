import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {CodeSystem, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {Provenance} from 'term-web/sys/_lib';

@Component({
  templateUrl: 'code-system-provenances.component.html'
})
export class CodeSystemProvenancesComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected version?: CodeSystemVersion;
  protected versions?: CodeSystemVersion[];
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.codeSystemService.load(id),
      version ? this.codeSystemService.loadVersion(id, version) : of(null),
      !version ? this.codeSystemService.searchVersions(id, {limit: -1}) : of(null),
      this.codeSystemService.loadProvenances(id, version)
    ])).subscribe(([cs, version, versions, provenances]) => {
        this.codeSystem = cs;
        this.version = version;
        this.versions = versions?.data;
        this.provenances = provenances;
      });
  }
}
