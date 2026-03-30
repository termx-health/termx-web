import { Component, OnInit, inject } from '@angular/core';
import {Router} from '@angular/router';
import {SearchResult} from '@termx-health/core-util';
import {AuthService} from 'term-web/core/auth';
import {CodeSystem} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { MarinPageLayoutModule } from '@termx-health/ui';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent } from 'term-web/core/components/finder/finder.component';

import { MarinaUtilModule } from '@termx-health/util';

@Component({
    template: `
    <m-page mFull>
      <tw-finder-wrapper [loading]="loading" style="overflow: auto; height: 100%; padding: 1rem">
        <tw-finder-menu title="CODE SYSTEMS" [length]="searchResult.data.length">
          @for (cs of searchResult.data; track cs) {
            <tw-finder-menu-item [navigate]="[cs.id]" (view)="openResource(cs)">
              {{(cs.title | localName) || cs.id}}
            </tw-finder-menu-item>
          }
    
          @if (searchResult.data.length < searchResult.meta.total) {
            <tw-finder-load-more-item
              (twClick)="loadCodeSystems(searchResult.data.length + DEFAULT_LIMIT)"
            ></tw-finder-load-more-item>
          }
        </tw-finder-menu>
      </tw-finder-wrapper>
    </m-page>
    `,
    imports: [MarinPageLayoutModule, FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent, MarinaUtilModule]
})
export class FinderCodeSystemListComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private router = inject(Router);
  private authService = inject(AuthService);

  public readonly DEFAULT_LIMIT = 50;

  public searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  public loading = false;

  public ngOnInit(): void {
    this.loadCodeSystems();
  }

  public loadCodeSystems(limit: number = this.DEFAULT_LIMIT): void {
    this.loading = true;
    this.codeSystemService.search({limit: limit})
      .subscribe(css => this.searchResult = css)
      .add(() => this.loading = false);
  }

  public openResource(cs: CodeSystem): void {
    if (this.authService.hasPrivilege('*.CodeSystem.edit')) {
      this.router.navigate(['/resources/code-systems/', cs.id, 'edit']);
    } else {
      this.router.navigate(['/resources/code-systems/', cs.id, 'view']);
    }
  }
}
