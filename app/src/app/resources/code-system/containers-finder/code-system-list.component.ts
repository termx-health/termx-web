import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SearchResult} from '@kodality-web/core-util';
import {AuthService} from 'term-web/core/auth';
import {CodeSystem} from 'term-web/resources/_lib';
import {CodeSystemService} from '../services/code-system.service';

@Component({
  template: `
    <m-page mFull>
      <tw-finder-wrapper [loading]="loading" style="overflow: auto; height: 100%; padding: 1rem">
        <tw-finder-menu title="CODE SYSTEMS" [length]="searchResult.data.length">
          <tw-finder-menu-item *ngFor="let cs of searchResult.data" [navigate]="[cs.id]" (view)="openResource(cs)">
            {{(cs.title | localName) || cs.id}}
          </tw-finder-menu-item>

          <tw-finder-load-more-item *ngIf="searchResult.data.length < searchResult.meta.total"
              (twClick)="loadCodeSystems(searchResult.data.length + DEFAULT_LIMIT)"
          ></tw-finder-load-more-item>
        </tw-finder-menu>
      </tw-finder-wrapper>
    </m-page>
  `
})
export class FinderCodeSystemListComponent implements OnInit {
  public readonly DEFAULT_LIMIT = 50;

  public searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private router: Router,
    private authService: AuthService
  ) {}

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
