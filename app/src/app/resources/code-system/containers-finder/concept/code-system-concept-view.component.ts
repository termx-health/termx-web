import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DestroyService, isNil, LocalDateTimePipe } from '@termx-health/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemConcept, CodeSystemLibService} from 'term-web/resources/_lib';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent } from 'term-web/core/components/finder/finder.component';
import { MuiFormModule } from '@termx-health/ui';



@Component({
    template: `
    <tw-finder-wrapper [loading]="loading" title="CODE SYSTEM CONCEPT">
      <div class="tw-finder-view-form">
        <m-form-item mLabel="entities.code-system-concept.code">
          {{concept?.code || '-'}}
        </m-form-item>
        <m-form-item mLabel="entities.code-system-concept.description">
          {{concept?.description || '-'}}
        </m-form-item>
      </div>
    
      <tw-finder-menu title="entities.code-system-concept.versions" [length]="concept?.versions?.length">
        @for (v of concept?.versions; track v) {
          <tw-finder-menu-item [navigate]="['versions', v.id]">
            {{v.id}} - {{v.created | localDateTime}}
          </tw-finder-menu-item>
        }
      </tw-finder-menu>
    </tw-finder-wrapper>
    `,
    providers: [DestroyService],
    imports: [FinderWrapperComponent, MuiFormModule, FinderMenuComponent, FinderMenuItemComponent, LocalDateTimePipe]
})
export class FinderCodeSystemConceptViewComponent implements OnInit {
  private codeSystemService = inject(CodeSystemLibService);
  private route = inject(ActivatedRoute);
  private destroy$ = inject(DestroyService);

  public concept?: CodeSystemConcept;
  public loading = false;

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const codeSystemConceptCode = params.get('conceptCode');
      const codeSystemId = this.route.parent!.snapshot.paramMap.get('id');
      if (isNil(codeSystemConceptCode) || isNil(codeSystemId)) {
        this.concept = undefined;
        return;
      }

      this.loading = true;
      this.codeSystemService.loadConcept(codeSystemId, codeSystemConceptCode).subscribe(version => {
        this.concept = version;
      }).add(() => this.loading = false);
    });
  }
}
