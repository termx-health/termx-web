import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil} from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService} from 'term-web/resources/_lib';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiFormModule, MuiIconModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';


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
        @for (d of conceptVersion?.designations; track d) {
          <tw-finder-menu-item>
            <div class="m-items-middle">
              <m-icon mCode="star" [mOptions]="{nzTheme: d.preferred ? 'fill' : 'outline'}"></m-icon>
              <div>{{d.name}}</div>
            </div>
          </tw-finder-menu-item>
        }
      </tw-finder-menu>
    
      <tw-finder-menu title="entities.code-system-entity-version.property-values" [length]="conceptVersion?.propertyValues?.length">
        @for (pv of conceptVersion?.propertyValues; track pv) {
          <tw-finder-menu-item>
            {{pv.entityPropertyId}} - {{pv.value}}
          </tw-finder-menu-item>
        }
      </tw-finder-menu>
    </tw-finder-wrapper>
    `,
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiFormModule, StatusTagComponent, FinderMenuComponent, FinderMenuItemComponent, MuiIconModule]
})
export class FinderCodeSystemConceptVersionViewComponent implements OnInit {
  private codeSystemEntityVersionService = inject(CodeSystemEntityVersionLibService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public conceptVersion?: CodeSystemEntityVersion;
  public loading = false;

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
