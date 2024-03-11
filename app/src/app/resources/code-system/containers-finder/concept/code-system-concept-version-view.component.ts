import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil} from '@kodality-web/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'term-web/resources/_lib';

@Component({
  template: `
    <tw-finder-wrapper [loading]="loading" title="CODE SYSTEM CONCEPT VERSION">
      <div class="tw-finder-view-form">
        <m-form-item mLabel="entities.code-system-entity-version.status">
          <tw-status-tag [status]="conceptVersion?.status"></tw-status-tag>
        </m-form-item>
        <m-form-item mLabel="entities.code-system-entity-version.description">
          {{conceptVersion?.description || '-'}}
        </m-form-item>
      </div>

      <tw-finder-menu title="entities.code-system-entity-version.designations" [length]="conceptVersion?.designations?.length">
        <tw-finder-menu-item *ngFor="let d of conceptVersion?.designations">
          <div class="m-items-middle">
            <m-icon mCode="star" [mOptions]="{nzTheme: d.preferred ? 'fill' : 'outline'}"></m-icon>
            <div>{{d.name}}</div>
          </div>
        </tw-finder-menu-item>
      </tw-finder-menu>

      <tw-finder-menu title="entities.code-system-entity-version.property-values" [length]="conceptVersion?.propertyValues?.length">
        <tw-finder-menu-item *ngFor="let pv of conceptVersion?.propertyValues">
          {{pv.entityPropertyId}} - {{pv.value}}
        </tw-finder-menu-item>
      </tw-finder-menu>
    </tw-finder-wrapper>
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
