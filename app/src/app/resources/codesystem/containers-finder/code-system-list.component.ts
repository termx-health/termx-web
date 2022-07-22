import {Component, OnInit} from '@angular/core';
import {SearchResult} from '@kodality-web/core-util';
import {CodeSystem} from 'terminology-lib/resources';
import {CodeSystemService} from '../services/code-system.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../auth/auth.service';

@Component({
  template: `
    <div style="max-height: 100%; width: 100%; height: 100%; padding: 0 0 1rem 0;">
      <twa-finder-wrapper [loading]="loading">
        <twa-finder-menu title="CODE SYSTEMS" [length]="searchResult.data.length">
          <twa-finder-menu-item *ngFor="let cs of searchResult.data" [navigate]="[cs.id]" (view)="openResource(cs)">
            {{(cs.names | localName) || cs.id}}
          </twa-finder-menu-item>

          <twa-finder-load-more-item *ngIf="searchResult.data.length < searchResult.meta.total"
              (twClick)="loadCodeSystems(searchResult.data.length + DEFAULT_LIMIT)"
          ></twa-finder-load-more-item>
        </twa-finder-menu>
      </twa-finder-wrapper>
    </div>
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
    if (this.authService.hasPrivilege('*.code-system.edit')) {
      this.router.navigate(['/resources/code-systems/', cs.id, 'edit']);
    } else {
      this.router.navigate(['/resources/code-systems/', cs.id, 'view']);
    }
  }
}
