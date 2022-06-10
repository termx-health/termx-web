import {Component, OnInit} from '@angular/core';
import {CodeSystemVersion} from 'lib/src/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';


@Component({
  template: `
    <twa-finder-wrapper [loading]="loading" title="CODE SYSTEM VERSION">
      {{version?.id}}
    </twa-finder-wrapper>
  `
})
export class FinderCodeSystemVersionViewComponent implements OnInit {
  public version?: CodeSystemVersion;
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
      const codeSystemVersionCode = params.get('versionCode');

      if (isNil(codeSystemId) || isNil(codeSystemVersionCode)) {
        this.version = undefined;
        return;
      }

      this.loading = true;
      this.codeSystemService.loadVersion(codeSystemId, codeSystemVersionCode).subscribe(version => {
        this.version = version;
      }).add(() => this.loading = false);
    });
  }
}
