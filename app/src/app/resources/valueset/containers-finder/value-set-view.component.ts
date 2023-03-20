import {Component, OnInit} from '@angular/core';
import {ValueSet, ValueSetVersion} from '@terminology/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, takeUntil} from 'rxjs';
import {DestroyService, isNil} from '@kodality-web/core-util';
import {ValueSetService} from '../services/value-set.service';


@Component({
  templateUrl: 'value-set-view.component.html',
  providers: [DestroyService]
})
export class FinderValueSetViewComponent implements OnInit {
  public valueSet?: ValueSet;
  public versions: ValueSetVersion[] = [];

  public loading = false;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (isNil(id)) {
        this.valueSet = undefined;
        return;
      }

      this.loading = true;
      forkJoin([
        this.valueSetService.load(id),
        this.valueSetService.searchVersions(id, {limit: -1}),
      ]).subscribe(([cs, versions]) => {
        this.valueSet = cs;
        this.versions = versions.data;
      }).add(() => this.loading = false);
    });
  }

}
