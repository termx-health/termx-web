import {Component, OnInit} from '@angular/core';
import {CodeSystemVersion} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';


@Component({
  template: `
    <twa-finder-wrapper [loading]="loading" title="CODE SYSTEM VERSION">
      <div class="tw-finder-view-form">
        <m-form-item mLabel="entities.code-system-version.version">
          {{version?.version || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.source">
          {{version?.source || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.preferred-language">
          {{version?.preferredLanguage || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.supported-languages">
          {{version?.supportedLanguages || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.description">
          {{version?.description || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.release-date">
          {{(version?.releaseDate | localDate) || '-'}}
        </m-form-item>

        <m-form-item mLabel="entities.code-system-version.expiration-date">
          {{(version?.expirationDate | localDate) || '-'}}
        </m-form-item>
      </div>

      <twa-finder-menu title="entities.code-system-version.entities" [length]="version?.entities?.length">
        <twa-finder-menu-item *ngFor="let e of version?.entities">
          {{e.code}}
        </twa-finder-menu-item>
      </twa-finder-menu>
    </twa-finder-wrapper>
  `
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
