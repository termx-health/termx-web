import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ValueSet, ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';

@Component({
  templateUrl: 'value-set-provenances.component.html'
})
export class ValueSetProvenancesComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected versions?: ValueSetVersion[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valueSetService: ValueSetLibService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(id), this.valueSetService.searchVersions(id, {limit: -1})]))
      .subscribe(([vs, versions]) => {
        this.valueSet = vs;
        this.versions = versions.data;
      });
  }
}
