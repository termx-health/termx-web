import {Component, OnInit} from '@angular/core';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {DestroyService, isNil} from '@kodality-web/core-util';

@Component({
  template: `
    <twa-finder-wrapper [loading]="loading" title="CODE SYSTEM CONCEPT VERSION">
      <div class="tw-finder-view-form">
        <m-form-item mLabel="entities.code-system-entity-version.status">
          <twa-status-tag [status]="conceptVersion?.status"></twa-status-tag>
        </m-form-item>
        <m-form-item mLabel="entities.code-system-entity-version.description">
          {{conceptVersion?.description || '-'}}
        </m-form-item>
      </div>

      <twa-finder-menu title="entities.code-system-entity-version.designations" [length]="conceptVersion?.designations?.length">
        <twa-finder-menu-item *ngFor="let d of conceptVersion?.designations">
          <div class="m-items-middle">
            <m-icon mCode="star" [mOptions]="{nzTheme: d.preferred ? 'fill' : 'outline'}"></m-icon>
            <div>{{d.name}}</div>
          </div>
        </twa-finder-menu-item>
      </twa-finder-menu>

      <twa-finder-menu title="entities.code-system-entity-version.property-values" [length]="conceptVersion?.propertyValues?.length">
        <twa-finder-menu-item *ngFor="let pv of conceptVersion?.propertyValues">
          {{pv.entityPropertyId}} - {{pv.value}}
        </twa-finder-menu-item>
      </twa-finder-menu>
    </twa-finder-wrapper>
  `,
  providers: [DestroyService]
})
export class FinderCodeSystemConceptVersionViewComponent implements OnInit {
  public conceptVersion?: CodeSystemEntityVersion;
  public loading = false;

  public constructor(
    public codeSystemEntityVersionService: CodeSystemEntityVersionLibService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
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
