import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isNil} from '@kodality-web/core-util';
import {takeUntil} from 'rxjs';
import {CodeSystemConcept, CodeSystemLibService} from 'term-web/resources/_lib';


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
        <tw-finder-menu-item *ngFor="let v of concept?.versions" [navigate]="['versions', v.id]">
          {{v.id}} - {{v.created | localDateTime}}
        </tw-finder-menu-item>
      </tw-finder-menu>
    </tw-finder-wrapper>
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
