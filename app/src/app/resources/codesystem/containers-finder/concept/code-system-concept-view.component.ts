import {Component, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemLibService} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {DestroyService, isNil} from '@kodality-web/core-util';


@Component({
  template: `
    <twa-finder-wrapper [loading]="loading" title="CODE SYSTEM CONCEPT">
      <div class="tw-finder-view-form">
        <m-form-item mLabel="entities.code-system-concept.code">
          {{concept?.code || '-'}}
        </m-form-item>
        <m-form-item mLabel="entities.code-system-concept.description">
          {{concept?.description || '-'}}
        </m-form-item>
      </div>

      <twa-finder-menu title="entities.code-system-concept.versions" [length]="concept?.versions?.length">
        <twa-finder-menu-item *ngFor="let v of concept?.versions" [navigate]="['versions', v.id]">
          {{v.id}} - {{v.created | localDateTime}}
        </twa-finder-menu-item>
      </twa-finder-menu>
    </twa-finder-wrapper>
  `,
  providers: [DestroyService]
})
export class FinderCodeSystemConceptViewComponent implements OnInit {
  public concept?: CodeSystemConcept;
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private route: ActivatedRoute,
    private destroy$: DestroyService
  ) {}

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
