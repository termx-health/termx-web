import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin, of} from 'rxjs';
import {ValueSet, ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';
import {Provenance} from 'term-web/sys/_lib';

@Component({
  templateUrl: 'value-set-provenances.component.html'
})
export class ValueSetProvenancesComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected version: ValueSetVersion;
  protected versions?: ValueSetVersion[];
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valueSetService: ValueSetLibService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.valueSetService.load(id),
      version ? this.valueSetService.loadVersion(id, version) : of(null),
      !version ? this.valueSetService.searchVersions(id, {limit: -1}) : of(null),
      this.valueSetService.loadProvenances(id, version)
    ])).subscribe(([vs, version, versions, provenances]) => {
        this.valueSet = vs;
        this.version = version;
        this.versions = versions?.data;
        this.provenances = provenances;
      });
  }
}
