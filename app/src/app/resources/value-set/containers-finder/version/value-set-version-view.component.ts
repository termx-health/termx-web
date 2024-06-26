import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil} from '@kodality-web/core-util';
import {takeUntil} from 'rxjs';
import {ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetService} from '../../services/value-set.service';


@Component({
  templateUrl: 'value-set-version-view.component.html',
  providers: [DestroyService]
})
export class FinderValueSetVersionViewComponent implements OnInit {
  public version?: ValueSetVersion;
  public loading = false;


  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}

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
