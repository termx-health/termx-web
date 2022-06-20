import {Component, OnInit} from '@angular/core';
import {CodeSystemEntityVersion, CodeSystemVersion} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil, SearchResult} from '@kodality-web/core-util';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';


@Component({
  templateUrl: 'code-system-version-view.component.html',
  providers: [MuiDestroyService]
})
export class FinderCodeSystemVersionViewComponent implements OnInit {
  public readonly DEFAULT_ENTITY_VERSION_LIMIT = 100;

  public version?: CodeSystemVersion;
  public entityVersionResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();

  private loading: {[k: string]: boolean} = {};


  public constructor(
    private codeSystemService: CodeSystemService,
    private codeSystemEntityVersionService: CodeSystemEntityVersionService,
    private route: ActivatedRoute,
    private destroy$: MuiDestroyService
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
    this.codeSystemEntityVersionService.search({
      codeSystem: id,
      codeSystemVersion: version,
      limit: limit
    })
      .subscribe(concepts => this.entityVersionResult = concepts)
      .add(() => this.loading['entities'] = false);
  }


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
