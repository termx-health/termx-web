import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {ValueSet} from 'term-web/resources/_lib';
import {Router} from '@angular/router';
import {ValueSetService} from '../services/value-set.service';


@Component({
  template: `
    <div style="max-height: 100%; width: 100%; height: 100%; padding: 0 0 1rem 0;">
      <tw-finder-wrapper [loading]="loading">
        <tw-finder-menu title="VALUE SET" [length]="searchResult.meta.total">
          <tw-finder-menu-item *ngFor="let vs of searchResult.data" [navigate]="[vs.id]" (view)="openResource(vs)">
            {{(vs.names | localName) || vs.id}}
          </tw-finder-menu-item>

          <tw-finder-load-more-item
              *ngIf="searchResult.data.length < searchResult.meta.total"
              (twClick)="loadValueSets(searchResult.data.length + DEFAULT_LIMIT)"
          ></tw-finder-load-more-item>
        </tw-finder-menu>
      </tw-finder-wrapper>
    </div>
  `
})
export class FinderValueSetListComponent implements OnInit {
  public readonly DEFAULT_LIMIT = 50;

  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  public loading = false;

  public constructor(
    private valueSetService: ValueSetService,
    private router: Router
  ) {}

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
