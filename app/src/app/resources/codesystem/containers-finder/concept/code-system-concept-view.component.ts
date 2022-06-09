import {Component, OnInit} from '@angular/core';
import {CodeSystemConcept} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';


@Component({
  template: `
    <twa-finder-wrapper [loading]="loading" class="tw-finder-view-form">
      <twa-finder-item title="CODE SYSTEM CONCEPT">
        <m-form-item mLabel="entities.code-system-concept.code">
          {{concept?.code || '-'}}
        </m-form-item>
        <m-form-item mLabel="entities.code-system-concept.description">
          {{concept?.description || '-'}}
        </m-form-item>
      </twa-finder-item>

      <twa-finder-menu title="entities.code-system-concept.versions" [length]="concept?.versions?.length">
        <twa-finder-menu-item *ngFor="let v of concept?.versions" [navigate]="['versions', v.id]">
          {{v.id}} - {{v.created | localDateTime}}
        </twa-finder-menu-item>
      </twa-finder-menu>
    </twa-finder-wrapper>
  `
})
export class FinderCodeSystemConceptViewComponent implements OnInit {
  public concept?: CodeSystemConcept;
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private destroy$: MuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const parentParams = this.route.snapshot.parent?.paramMap;

      const codeSystemId = parentParams?.get('id');
      const codeSystemConceptCode = params.get('conceptCode');

      if (isNil(codeSystemId) || isNil(codeSystemConceptCode)) {
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
