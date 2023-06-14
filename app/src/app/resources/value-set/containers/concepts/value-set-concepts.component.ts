import {Component, OnInit} from '@angular/core';
import {ValueSet, ValueSetVersion} from 'app/src/app/resources/_lib';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {Resource} from 'app/src/app/resources/resource/model/resource';
import {ResourceUtil} from 'app/src/app/resources/resource/util/resource-util';
import {forkJoin} from 'rxjs';

@Component({
  templateUrl: 'value-set-concepts.component.html'
})
export class ValueSetConceptsComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected versions?: ValueSetVersion[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valueSetService: ValueSetService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(id), this.valueSetService.searchVersions(id, {decorated: true, limit: -1})]))
      .subscribe(([vs, versions]) => {
        this.valueSet = vs;
        this.versions = versions.data;
      });
  }

  protected toResource = (vs: ValueSet): Resource => {
    return ResourceUtil.fromValueSet(vs);
  };
}
