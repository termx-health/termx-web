import {Component, OnInit} from '@angular/core';
import {CodeSystemEntityVersion} from 'lib/src/resources';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';
import {CodeSystemEntityVersionService} from '../../services/code-system-entity-version.service';


@Component({
  template: `
    <twa-finder-wrapper [loading]="loading">
      <twa-finder-item title="CODE SYSTEM CONCEPT VERSION">
        <m-form-item mLabel="status">
          {{conceptVersion?.status || '-'}}
        </m-form-item>
        <m-form-item mLabel="description">
          {{conceptVersion?.description || '-'}}
        </m-form-item>
      </twa-finder-item>

      <twa-finder-menu title="DESIGNATIONS" [length]="conceptVersion?.designations?.length">
        <twa-finder-menu-item *ngFor="let d of conceptVersion?.designations">
          {{d.name}}
        </twa-finder-menu-item>
      </twa-finder-menu>

      <twa-finder-menu title="PROPERTIES" [length]="conceptVersion?.propertyValues?.length">
        <twa-finder-menu-item *ngFor="let pv of conceptVersion?.propertyValues">
          {{pv.entityPropertyId}} - {{pv.value}}
        </twa-finder-menu-item>
      </twa-finder-menu>
    </twa-finder-wrapper>
  `
})
export class FinderCodeSystemConceptVersionViewComponent implements OnInit {
  public conceptVersion?: CodeSystemEntityVersion;
  public loading = false;

  public constructor(
    public codeSystemEntityVersionService: CodeSystemEntityVersionService,
    private route: ActivatedRoute,
    private destroy$: MuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const conceptVersionId = params.get('versionId');

      if (isNil(conceptVersionId)) {
        this.conceptVersion = undefined;
        return;
      }

      this.loading = true;
      this.codeSystemEntityVersionService.load(Number(conceptVersionId)).subscribe(v => {
        this.conceptVersion = v;
      }).add(() => this.loading = false);
    });
  }
}
