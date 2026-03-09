import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil} from '@kodality-web/core-util';
import {forkJoin, takeUntil} from 'rxjs';
import {ValueSet, ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiFormModule } from '@kodality-web/marina-ui';

import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    templateUrl: 'value-set-view.component.html',
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiFormModule, FinderMenuComponent, FinderMenuItemComponent, MarinaUtilModule]
})
export class FinderValueSetViewComponent implements OnInit {
  private valueSetService = inject(ValueSetService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public valueSet?: ValueSet;
  public versions: ValueSetVersion[] = [];

  public loading = false;

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
