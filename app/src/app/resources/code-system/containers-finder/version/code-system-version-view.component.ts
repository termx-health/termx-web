import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DestroyService, isNil, SearchResult, LocalDatePipe } from '@kodality-web/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemEntityVersion, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiFormModule } from '@kodality-web/marina-ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    templateUrl: 'code-system-version-view.component.html',
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiFormModule, StatusTagComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent, MarinaUtilModule, LocalDatePipe]
})
export class FinderCodeSystemVersionViewComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public readonly DEFAULT_ENTITY_VERSION_LIMIT = 100;

  public version?: CodeSystemVersion;
  public entityVersionResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();
  public loading: {[k: string]: boolean} = {};


  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const parentParams = this.route.snapshot.parent?.paramMap;
      const codeSystemId = parentParams?.get('id');
      const codeSystemVersionCode = params.get('versionCode');

      if (isNil(codeSystemId) || isNil(codeSystemVersionCode)) {
        this.version = undefined;
        return;
      }

      this.loading['version'] = true;
      this.codeSystemService.loadVersion(codeSystemId, codeSystemVersionCode)
        .subscribe(version => this.version = version)
        .add(() => this.loading['version'] = false);

      this.loadEntities(codeSystemId, codeSystemVersionCode);
    });
  }


  public loadEntities(id: string, version: string, limit: number = this.DEFAULT_ENTITY_VERSION_LIMIT): void {
    this.loading['entities'] = true;
    this.codeSystemService.searchEntityVersions(id, {
      codeSystem: id,
      codeSystemVersion: version,
      limit: limit
    })
      .subscribe(concepts => this.entityVersionResult = concepts)
      .add(() => this.loading['entities'] = false);
  }
}
