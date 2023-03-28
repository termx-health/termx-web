import {Component, OnInit} from '@angular/core';
import {CodeSystemEntityVersion, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {DestroyService, isNil, SearchResult} from '@kodality-web/core-util';

@Component({
  templateUrl: 'code-system-version-view.component.html',
  providers: [DestroyService]
})
export class FinderCodeSystemVersionViewComponent implements OnInit {
  public readonly DEFAULT_ENTITY_VERSION_LIMIT = 100;

  public version?: CodeSystemVersion;
  public entityVersionResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();
  public loading: {[k: string]: boolean} = {};

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}


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
