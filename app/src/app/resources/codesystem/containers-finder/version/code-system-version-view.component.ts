import {Component, OnInit} from '@angular/core';
import {CodeSystemVersion} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';


@Component({
  templateUrl: 'code-system-version-view.component.html'
})
export class FinderCodeSystemVersionViewComponent implements OnInit {
  public version?: CodeSystemVersion;
  public loading = false;


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

      this.loading = true;
      forkJoin([
        this.codeSystemService.loadVersion(codeSystemId, codeSystemVersionCode),
        this.codeSystemEntityVersionService.search({
          codeSystem: codeSystemId,
          codeSystemVersion: codeSystemVersionCode,
          limit: -1
        })
      ]).subscribe(([version, entities]) => {
        this.version = version;
        this.version.entities = entities.data;
      }).add(() => this.loading = false);
    });
  }
}
