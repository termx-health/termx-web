import { Component, OnInit, inject } from '@angular/core';
import {Router} from '@angular/router';
import {SearchResult} from '@kodality-web/core-util';
import {ValueSet} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import { MarinPageLayoutModule } from '@kodality-web/marina-ui';
import { FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent } from 'term-web/core/components/finder/finder.component';

import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    template: `
    <m-page mFull>
      <tw-finder-wrapper [loading]="loading" style="overflow: auto; height: 100%; padding: 1rem">
        <tw-finder-menu title="VALUE SET" [length]="searchResult.meta.total">
          @for (vs of searchResult.data; track vs) {
            <tw-finder-menu-item [navigate]="[vs.id]" (view)="openResource(vs)">
              {{(vs.name | localName) || vs.id}}
            </tw-finder-menu-item>
          }
    
          @if (searchResult.data.length < searchResult.meta.total) {
            <tw-finder-load-more-item
              (twClick)="loadValueSets(searchResult.data.length + DEFAULT_LIMIT)"
            ></tw-finder-load-more-item>
          }
        </tw-finder-menu>
      </tw-finder-wrapper>
    </m-page>
    `,
    imports: [MarinPageLayoutModule, FinderWrapperComponent, FinderMenuComponent, FinderMenuItemComponent, FinderLoadMoreItemComponent, MarinaUtilModule]
})
export class FinderValueSetListComponent implements OnInit {
  private valueSetService = inject(ValueSetService);
  private router = inject(Router);

  public readonly DEFAULT_LIMIT = 50;

  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  public loading = false;

  public ngOnInit(): void {
    this.loadValueSets();
  }

  public loadValueSets(limit: number = this.DEFAULT_LIMIT): void {
    this.loading = true;
    this.valueSetService.search({limit: limit})
      .subscribe(vss => this.searchResult = vss)
      .add(() => this.loading = false);
  }

  public openResource(vs: ValueSet): void {
    this.router.navigate(['/resources/value-sets/', vs.id, 'edit']);
  }
}
