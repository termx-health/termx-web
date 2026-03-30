import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DestroyService, isNil, LocalDatePipe } from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiAlertModule, MuiFormModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';



@Component({
    templateUrl: 'value-set-version-view.component.html',
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiAlertModule, MuiFormModule, StatusTagComponent, FinderMenuComponent, FinderMenuItemComponent, LocalDatePipe]
})
export class FinderValueSetVersionViewComponent implements OnInit {
  private valueSetService = inject(ValueSetService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public version?: ValueSetVersion;
  public loading = false;

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const parentParams = this.route.snapshot.parent?.paramMap;
      const valueSetId = parentParams?.get('id');
      const valueSetVersionCode = params.get('versionCode');

      if (isNil(valueSetId) || isNil(valueSetVersionCode)) {
        this.version = undefined;
        return;
      }

      this.loading = true;
      this.valueSetService.loadVersion(valueSetId, valueSetVersionCode).subscribe(version => this.version = version).add(() => this.loading = false);
    });
  }
}
